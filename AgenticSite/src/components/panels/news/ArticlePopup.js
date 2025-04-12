import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ArticlePopup.css';

const ArticlePopup = ({ article, onClose, formatDate, isDarkMode }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const MAX_DESCRIPTION_LENGTH = 150;
  
  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop, not the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const openArticleLink = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };
  
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  const isLongDescription = article.description && article.description.length > MAX_DESCRIPTION_LENGTH;

  return (
    <motion.div 
      className={`article-popup-backdrop ${isDarkMode ? 'dark' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
    >
      <motion.div 
        className={`article-popup-content ${isDarkMode ? 'dark' : ''}`}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <button className="close-button" onClick={onClose}>×</button>
        
        {article.image_url && (
          <div 
            className="article-popup-image" 
            style={{ backgroundImage: `url(${article.image_url})` }}
          >
            <div className="article-popup-image-overlay"></div>
          </div>
        )}
        
        <div className="article-popup-body">
          <h2 className="article-popup-title space-mono-bold">{article.title}</h2>
          
          {article.published_date && (
            <p className="article-popup-date space-mono-regular">
              Published on {formatDate(article.published_date)}
            </p>
          )}
          
          <div className="article-popup-description space-mono-regular">
            <p>
              {isLongDescription 
                ? (showFullDescription 
                    ? article.description 
                    : truncateText(article.description, MAX_DESCRIPTION_LENGTH))
                : article.description}
            </p>
            {isLongDescription && (
              <div className="show-more-container">
                <button 
                  className="show-more-button space-mono-regular"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Show Less' : 'Show More'}
                </button>
              </div>
            )}
          </div>
          
          <div className="article-popup-actions">
            <button 
              className="read-more-button space-mono-bold" 
              onClick={openArticleLink}
            >
              Read Full Article
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ArticlePopup;
