import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './PinButton.css';

const PinButton = ({ isPinned, onClick, isDarkMode }) => {
  const [isPinning, setIsPinning] = useState(false);

  const handleClick = (e) => {
    // Prevent multiple clicks while animation is in progress
    if (isPinning) return;
    
    setIsPinning(true);
    
    // Call the provided onClick handler
    if (onClick) {
      onClick(e);
    }
    
    // Reset the animation state after animation completes
    setTimeout(() => setIsPinning(false), 800);
  };

  return (
    <motion.div 
      className={`pin-button ${isPinned ? 'pinned' : ''} ${isDarkMode ? 'dark' : ''} ${isPinning ? 'pinning' : ''}`}
      onClick={handleClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.9 }}
      title={isPinned ? "Unpin Panel" : "Pin Panel"}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="pin-icon"
      >
        {isPinned ? (
          <motion.path
            d="M12 2L12 16M12 16L16 12M12 16L8 12M12 22L12 20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isPinning ? [1, 0, 1] : 1 }}
            transition={{ 
              duration: isPinning ? 0.6 : 0.3, 
              ease: "easeInOut",
              times: isPinning ? [0, 0.5, 1] : [0, 1]
            }}
          />
        ) : (
          <motion.path
            d="M15 4.5l-4 4L5 7l-3 3 7 7 3-3-1.5-6 4-4H15z M18 2l-2 2M7.5 17.5L6 19M16 18l2 2 4-4-2-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isPinning ? [1, 0, 1] : 1 }}
            transition={{ 
              duration: isPinning ? 0.6 : 0.3, 
              ease: "easeInOut",
              times: isPinning ? [0, 0.5, 1] : [0, 1]
            }}
          />
        )}
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="63"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isPinning ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ display: isPinning ? 'block' : 'none' }}
          className="pin-animation"
        />
      </svg>
    </motion.div>
  );
};

export default PinButton;
