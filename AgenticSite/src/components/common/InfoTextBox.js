import React, { useRef, useEffect, useContext, useState } from 'react';
import { InfoTextContext } from '../../contexts/InfoTextContext';
import { motion, AnimatePresence } from 'framer-motion';
import InfoTextNews from './InfoTextNews';
import './InfoTextBox.css';

const InfoTextBox = ({ defaultText, coordinates }) => {
  const textBoxRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const { infoText } = useContext(InfoTextContext);
  const [prevText, setPrevText] = useState(infoText || defaultText);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const [isNewsContent, setIsNewsContent] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // Set inline style if coordinates prop is provided
  const containerStyle = coordinates
    ? { position: 'absolute', ...coordinates }
    : {};

  // Check if content is news-related - simplified to only check for news headers
  useEffect(() => {
    const contentText = infoText || defaultText;
    const isNews = contentText && (
      contentText.includes('# News Trust Analysis') ||
      contentText.includes('# Latest News')
    );
    setIsNewsContent(isNews);
  }, [infoText, defaultText]);

  // Parse text to identify and style headings
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    // Split text by new lines to process each line
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Check for heading patterns
      if (line.startsWith('# ')) {
        return <h1 key={index} className="info-text-title">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="info-text-heading">{line.substring(3)}</h2>;
      } else if (line.trim() === '') {
        // Return empty line with appropriate spacing
        return <br key={index} />;
      } else {
        return <p key={index} className="info-text-paragraph">{line}</p>;
      }
    });
  };

  // Effect to trigger animation when text changes
  useEffect(() => {
    const currentText = infoText || defaultText;
    if (currentText !== prevText) {
      setIsAnimating(true);
      setIsVisible(true); // Show the box when new data comes in
      setIsExpanded(false); // Reset to collapsed state when new content arrives
      
      // Set a timeout to end the animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPrevText(currentText);
        
        // Check again after animation completes
        if (contentRef.current) {
          const contentHeight = contentRef.current.scrollHeight;
          setNeedsTruncation(contentHeight > 300);
        }
      }, 700); // Animation duration
      
      return () => clearTimeout(timer);
    }
  }, [infoText, defaultText, prevText]);

  // Listen for resetInfoBoxVisibility event
  useEffect(() => {
    const handleReset = () => {
      setIsVisible(true);
      setIsExpanded(false); // Reset expanded state when showing the box again
      setIsAnimating(true); // Trigger animation for better user experience
      
      // Reset scroll position
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      
      // End animation after a delay
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 700);
      
      return () => clearTimeout(timer);
    };
    
    window.addEventListener('resetInfoBoxVisibility', handleReset);
    
    return () => {
      window.removeEventListener('resetInfoBoxVisibility', handleReset);
    };
  }, []);

  // Check content height to determine if truncation is needed
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Enhanced function to check content height
    const checkContentHeight = () => {
      // Small delay to ensure content is fully rendered
      setTimeout(() => {
        if (contentRef.current) {
          const contentHeight = contentRef.current.scrollHeight;
          setNeedsTruncation(contentHeight > 300); // Show toggle if content exceeds 300px
        }
      }, 100);
    };
    
    checkContentHeight();
    
    // Create ResizeObserver to monitor content height changes
    const resizeObserver = new ResizeObserver(checkContentHeight);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    // Also check when window is resized
    window.addEventListener('resize', checkContentHeight);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkContentHeight);
    };
  }, [infoText, defaultText]);

  useEffect(() => {
    if (!textBoxRef.current || !containerRef.current) return;
    
    const textElement = textBoxRef.current;
    const containerElement = containerRef.current;
    
    const measureElement = () => {
      const clone = textElement.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.visibility = 'hidden';
      clone.style.height = 'auto';
      clone.style.width = 'auto';
      clone.style.maxWidth = '400px'; // Updated from 320px to match CSS
      clone.style.whiteSpace = 'pre-wrap';
      
      document.body.appendChild(clone);
      
      const { width } = clone.getBoundingClientRect(); // Get width
      document.body.removeChild(clone);
      return { width };
    };
    
    const updateSize = () => {
      const { width } = measureElement(); // Remove unused height variable
      const viewportWidth = window.innerWidth;
      // Remove unused viewportHeight variable
      
      textElement.style.width = 'auto';
      textElement.style.height = 'auto';
      
      // Apply width with constraints and respect viewport boundaries
      const desiredWidth = Math.max(280, Math.min(400, width + 20)); // Updated min/max values
      const maxAllowedWidth = viewportWidth * 0.9; // Limit to 90% of viewport
      
      containerElement.style.width = `${Math.min(desiredWidth, maxAllowedWidth)}px`;
      
      // Height is handled by CSS max-height and overflow-y: auto
    };
    
    updateSize();
    
    const resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(textElement);
    
    const mutationObserver = new MutationObserver(() => updateSize());
    mutationObserver.observe(textElement, {
      characterData: true,
      childList: true,
      subtree: true
    });
    
    // Also update size on window resize to ensure it stays on screen
    window.addEventListener('resize', updateSize);
    
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [infoText, defaultText]);

  // Toggle expanded/collapsed state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    
    // If collapsing, scroll back to the component position after animation
    if (isExpanded && containerRef.current) {
      setTimeout(() => {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollTarget = window.scrollY + rect.top - 100; // Offset for better viewing
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }, 50);
    }
  };

  // Handle minimize button click
  const handleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
    
    // Reset expanded state when minimizing
    if (!isMinimized && isExpanded) {
      setIsExpanded(false);
    }
  };

  // Animation variants for the text content
  const contentVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        staggerChildren: 0.05 
      } 
    },
    exit: { 
      opacity: 0,
      y: -15,
      transition: { duration: 0.3 } 
    }
  };

  // Content height animation variants
  const heightVariants = {
    collapsed: { 
      height: "300px",
      transition: { 
        type: "tween", 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    expanded: { 
      height: "auto",
      transition: { 
        type: "tween", 
        duration: 0.5,
        ease: "easeInOut"
      }
    },
    minimized: {
      height: "40px", // Just enough height for the title to be visible
      transition: {
        type: "tween",
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Handle close button click
  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    
    // Reset states when closing
    setIsExpanded(false);
    
    // We'll use a small delay before fully resetting to allow close animation to play
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }, 300); // Short delay for animation completion
  };

  // Ensure content resets when visibility changes
  useEffect(() => {
    if (isVisible) {
      // Check if truncation is needed when becoming visible
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        setNeedsTruncation(contentHeight > 300);
      }
    }
  }, [isVisible]);

  return (
    <motion.div 
      className={`info-text-box-container ${isAnimating ? 'animating' : ''} ${isMinimized ? 'minimized' : ''}`} 
      ref={containerRef} 
      style={containerStyle}
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.95,
        y: isVisible ? 0 : -10
      }}
      transition={{ duration: 0.3 }}
    >
      <div 
        ref={textBoxRef} 
        className={`info-text-box space-mono-regular ${isExpanded ? 'expanded' : ''} ${isMinimized ? 'minimized' : ''}`}
      >
        <div className="info-box-controls">
          <button 
            className="minimize-button" 
            onClick={handleMinimize}
            aria-label={isMinimized ? "Restore" : "Minimize"}
            title={isMinimized ? "Restore" : "Minimize"}
          >
            {isMinimized ? '□' : '–'}
          </button>
          <button 
            className="close-button" 
            onClick={handleClose}
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>

        <motion.div 
          className="content-wrapper"
          initial="collapsed"
          animate={isMinimized ? "minimized" : (isExpanded ? "expanded" : "collapsed")}
          variants={heightVariants}
          style={{ overflow: isExpanded ? "visible" : "hidden" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={infoText || defaultText} // Unique key to trigger animation
              initial="initial"
              animate="animate"
              exit="exit"
              variants={contentVariants}
              className={`animated-text-content ${!isExpanded ? 'truncated-content' : ''}`}
              ref={contentRef}
            >
              {isNewsContent 
                ? <InfoTextNews newsContent={infoText || defaultText} /> 
                : renderFormattedText(infoText || defaultText)}
            </motion.div>
          </AnimatePresence>
          
          {!isExpanded && !isMinimized && needsTruncation && (
            <div className="fade-overlay"></div>
          )}
        </motion.div>
        
        {/* Show More/Less toggle button if content needs truncation */}
        {needsTruncation && !isMinimized && (
          <motion.button 
            className="content-toggle" 
            onClick={toggleExpanded}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              initial={false}
              animate={{ y: isExpanded ? 0 : -2, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </motion.span>
          </motion.button>
        )}
        
        {/* Particles for animation effect */}
        {isAnimating && (
          <div className="text-particles">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`text-particle particle-${i}`}></div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InfoTextBox;
