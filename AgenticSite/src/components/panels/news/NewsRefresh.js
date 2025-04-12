import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './NewsRefresh.css';

const NewsRefresh = ({ onClick, isDarkMode, onRefreshComplete }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle the refresh action
  const handleRefresh = (e) => {
    e.stopPropagation();
    
    // Prevent multiple clicks while refreshing
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    // Call the provided onClick handler
    if (onClick) {
      onClick();
    }
    
    // Simulate refresh completion with timeout
    // In a real scenario, this could be replaced with a fetch completion
    setTimeout(() => {
      setIsRefreshing(false);
      if (onRefreshComplete) {
        onRefreshComplete();
      }
    }, 1500); // Slightly longer than the ripple animation for better UX
  };
  
  // Reset refreshing state if component unmounts during refresh
  useEffect(() => {
    return () => {
      setIsRefreshing(false);
    };
  }, []);

  return (
    <motion.div
      className={`refresh-button ${isDarkMode ? 'dark' : ''} ${isRefreshing ? 'refreshing' : ''}`}
      onClick={handleRefresh}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.9 }}
      title="Refresh News"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="refresh-icon"
      >
        <motion.path
          d="M21 12a9 9 0 1 1-9-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.path
          d="M21 3v9h-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
};

export default NewsRefresh;
