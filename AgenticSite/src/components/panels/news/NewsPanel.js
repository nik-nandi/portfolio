import React, { useState, useEffect, useContext, useRef } from 'react';
import './NewsPanel.css';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkModeContext } from '../../../contexts/DarkModeContext';
import { fetchNewsArticles } from '../../../services/newsApi';
import { fetchNewsDetailsArticles } from '../../../services/newsDetiailsApi';
import { refreshNews } from '../../../services/newsRefreshApi';
import ArticlePopup from './ArticlePopup';
import { splitTextIntoLetters } from '../../../utils/textEffects';
import PinButton from '../PinButton';
import TextUpdateButton from '../../common/TextUpdateButton';
import NewsRefresh from './NewsRefresh';
import { InfoTextContext } from '../../../contexts/InfoTextContext';
import { formatNewsDetailsData } from '../../common/InfoTextNews';

const NewsPanel = ({ isExpanded, isPinned, onToggleExpand, onTogglePin, onUpdate, panelIndex }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const { setInfo, resetInfoBoxVisibility } = useContext(InfoTextContext);
  const [newsData, setNewsData] = useState({ articles: [] });
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [error, setError] = useState(null);
  const collapseTimerRef = useRef(null);
  
  // Clean up any timers when component unmounts
  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);
  
  // Function to fetch fresh news data
  const fetchFreshNewsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNewsArticles();
      
      if (data && data.articles && Array.isArray(data.articles)) {
        setNewsData(data);
      } else {
        console.error('Invalid news data structure:', data);
        setError('Failed to load news data');
        setNewsData({ articles: [] });
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setError('Failed to load news');
      setNewsData({ articles: [] });
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch news details (trust analysis) data and update InfoTextBox
  const fetchNewsDetailsData = async () => {
    try {
      // Fetch news details data
      const newsDetailsData = await fetchNewsDetailsArticles();
      // eslint-disable-next-line
      const _ = await refreshNews();
      // eslint-disable-next-line
      const __ = await fetchFreshNewsData();
      
      // Format the news details data
      const formattedData = formatNewsDetailsData(newsDetailsData);
      
      // Update the info text with formatted data
      setInfo(formattedData);
      
      // Force a resize event to trigger re-calculation in InfoTextBox
      window.dispatchEvent(new Event('resize'));
    } catch (error) {
      console.error('Error fetching news details:', error);
    }
  };
  
  // Combined refresh function for both news and news summary
  const handleCompleteRefresh = async () => {
    try {
      // First, fetch fresh news data (this happens after the refresh API has been called)
      await fetchFreshNewsData();
      
      // Reset InfoTextBox visibility before updating the content
      resetInfoBoxVisibility();
      
      // Fetch new news details (trust analysis) data
      await fetchNewsDetailsData();
      
      // If onUpdate callback exists, call it
      if (onUpdate) {
        onUpdate("news", "refresh");
      }
    } catch (error) {
      console.error('Error during news refresh completion:', error);
      setError('Failed to complete refresh');
      setLoading(false);
    }
  };
  
  // Fetch news data when component mounts
  useEffect(() => {
    fetchFreshNewsData();
  }, []);
  
  // Format publication date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Handle double-click on the panel
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onToggleExpand();
  };
  
  // Handle mouse entering the panel - cancel any pending collapse
  const handleMouseEnter = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };
  
  // Handle mouse leaving the panel - auto-collapse when expanded but not pinned
  const handleMouseLeave = () => {
    if (isExpanded && !isPinned) {
      // Close article popup if it's open
      if (selectedArticle) {
        setSelectedArticle(null);
      }
      
      // Set a delay before collapsing to allow for smooth transition
      collapseTimerRef.current = setTimeout(() => {
        onToggleExpand();
      }, 300); // 300ms matches the panel expansion animation duration in UI guide
    }
  };
  
  // Open article link in a new tab
  const openArticleLink = (url, e) => {
    e.stopPropagation(); // Prevent panel expansion when clicking an article
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Show article details in popup
  const showArticlePopup = (article, e) => {
    e.stopPropagation(); // Prevent other events
    
    // Clear any collapse timer when opening an article
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    
    // If panel is not expanded, expand it first
    if (!isExpanded) {
      onToggleExpand();
    }
    
    setSelectedArticle(article);
  };

  // Close article popup
  const closeArticlePopup = () => {
    setSelectedArticle(null);
  };

  // Enhanced function that applies different delay for each news item
  const renderNewsTitle = (title, itemIndex) => {
    // Base delay for each letter within a title - increased delays
    const letterDelay = title.length > 30 ? 0.12 : 0.25; // Increased from 0.08/0.15 to 0.12/0.25
    
    // Add significant offset between each news item (3.5 seconds per item) - increased from 2s
    const titleOffset = itemIndex * 3.5; 
    
    return splitTextIntoLetters(title, 'glow-letter', letterDelay, titleOffset);
  };

  return (
    <div 
      className={`chat-container secondary-box news-panel ${isExpanded ? 'expanded' : ''} ${isPinned ? 'pinned' : ''} ${isDarkMode ? 'dark' : 'light'}`}
      onDoubleClick={handleDoubleClick}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {/* Article Popup */}
      <AnimatePresence>
        {selectedArticle && (
          <ArticlePopup 
            article={selectedArticle} 
            onClose={closeArticlePopup} 
            formatDate={formatDate}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

      <div className="chat-header news-header">
        <div className="conversation-id-container">
          <span className="space-mono-regular conversation-id">
            Latest News
          </span>
        </div>
        <div className="expand-controls">
          {isExpanded && (
            <>
              <NewsRefresh 
                onClick={() => setLoading(true)} // Set loading state immediately for better UI feedback
                isDarkMode={isDarkMode}
                onRefreshComplete={handleCompleteRefresh}
              />
              <TextUpdateButton 
                onClick={onUpdate} 
                isDarkMode={isDarkMode} 
                panelType="news"
              />
              <PinButton 
                isPinned={isPinned} 
                isDarkMode={isDarkMode}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin();
                }}
              />
            </>
          )}
          <span 
            className="expand-indicator"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            {isExpanded ? '-' : '+'}
          </span>
        </div>
      </div>
      
      <div className={`messages-container ${isExpanded ? 'expanded' : ''}`}>
        {loading ? (
          <div className="news-loading">
            <motion.div 
              className="loading-icon"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              📰
            </motion.div>
            <p>Loading news articles...</p>
          </div>
        ) : error ? (
          <div className="news-error">
            <p>{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchNewsArticles()
                  .then(data => {
                    if (data && data.articles) setNewsData(data);
                    else setError('Failed to load news data');
                  })
                  .catch(err => setError('Error reloading news'))
                  .finally(() => setLoading(false));
              }}
            >
              Try Again
            </motion.button>
          </div>
        ) : newsData && newsData.articles && newsData.articles.length > 0 ? (
          <div className={`news-content ${isExpanded ? 'expanded-view' : 'mini-view'}`}>
            {isExpanded ? (
              // Expanded view - show 9 articles in 3x3 grid layout
              <>
                <div className="news-grid">
                  {newsData.articles.slice(0, 9).map((article, index) => (
                    <motion.div 
                      key={index}
                      className="news-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(0.05 * index, 0.5) }}
                    >
                      <div 
                        className="article-image" 
                        style={{ backgroundImage: `url(${article.image_url})` }}
                        onClick={(e) => showArticlePopup(article, e)}
                      >
                        {!article.image_url && <div className="no-image">📰</div>}
                        <div className="article-details-button" onClick={(e) => showArticlePopup(article, e)}>
                          <span>Details</span>
                        </div>
                      </div>
                      <div className="article-content">
                        <h3 
                          className="article-title space-mono-bold"
                          onClick={(e) => showArticlePopup(article, e)}
                        >
                          {article.title}
                        </h3>
                        <p className="article-description space-mono-regular">{article.description}</p>
                        <div className="article-footer">
                          <p className="article-date space-mono-regular">
                            {article.published_date ? formatDate(article.published_date) : 'No date'}
                          </p>
                          <button 
                            className="read-more-btn"
                            onClick={(e) => openArticleLink(article.url, e)}
                          >
                            Read More
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              // Mini view with glowing letter effect - now with sequential title animations
              <div className="news-list">
                {newsData.articles.slice(0, 4).map((article, index) => (
                  <motion.div 
                    key={index}
                    className="news-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={(e) => showArticlePopup(article, e)}
                  >
                    <h4 className="news-title space-mono-regular">
                      {renderNewsTitle(article.title, index)}
                    </h4>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="news-empty">
            <p>No news articles available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPanel;
