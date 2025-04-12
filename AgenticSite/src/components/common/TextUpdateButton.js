import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { InfoTextContext } from '../../contexts/InfoTextContext';
import { fetchNewsDetailsArticles } from '../../services/newsDetiailsApi';
import { formatNewsDetailsData } from './InfoTextNews';
import './TextUpdateButton.css';

const TextUpdateButton = ({ onClick, isDarkMode, panelType }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { setInfo, resetInfoBoxVisibility } = useContext(InfoTextContext);

  // Generate dummy data based on panel type
  const getDummyData = (type) => {
    switch (type) {
      case 'news':
        return "# Latest News\n\n## Headlines\nSpaceX launches new satellite\nTech company announces revolutionary AI\nScientists discover new species in Amazon\n\n## Markets\nS&P 500: +1.2%\nNASDAQ: +0.8%\nDow: +0.5%";
      case 'weather':
        return "# Weather Update\n\n## Current Conditions\nTemperature: 72°F / 22°C\nCondition: Partly Cloudy\nHumidity: 45%\n\n## Forecast\nTomorrow: Sunny, 75°F\nWednesday: Light Rain, 68°F\nThursday: Cloudy, 70°F";
      default:
        return "# Information Updated\n\nNew data has been loaded.\nCheck back later for more updates.";
    }
  };

  const handleClick = async (e) => {
    e.stopPropagation();
    
    // Prevent multiple clicks while updating
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    // Reset InfoTextBox visibility before updating the content
    resetInfoBoxVisibility();
    
    let formattedData;
    
    if (panelType === 'news') {
      try {
        // Fetch news details data
        const newsDetailsData = await fetchNewsDetailsArticles();
        
        // Format the news details data
        formattedData = formatNewsDetailsData(newsDetailsData);
      } catch (error) {
        console.error('Error fetching news details:', error);
        formattedData = "# News Trust Analysis\n\nUnable to fetch news trust data at this time.\nPlease try again later.";
      }
    } else {
      // For other panel types, use the existing dummy data function
      formattedData = getDummyData(panelType);
    }
    
    // Update the info text with formatted data
    setInfo(formattedData);
    // Force a resize event to trigger re-calculation in InfoTextBox
    window.dispatchEvent(new Event('resize'));
    
    // Call the provided onClick handler
    if (onClick) {
      onClick(panelType, formattedData);
    }
    
    // Reset the animation state after animation completes
    setTimeout(() => setIsUpdating(false), 1000);
  };

  // Determine button label based on panel type
  const getButtonLabel = () => {
    switch (panelType) {
      case 'news':
        return 'Update News Trust Analysis';
      case 'weather':
        return 'Update Weather';
      default:
        return 'Update';
    }
  };

  return (
    <motion.div
      className={`update-button ${isDarkMode ? 'dark' : ''} ${isUpdating ? 'updating' : ''} ${panelType || ''}`}
      onClick={handleClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.9 }}
      title={getButtonLabel()}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="update-icon"
      >
        <motion.path
          d="M20 11A8 8 0 0 0 4 11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.path
          d="M4 11L8 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round" 
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeInOut" }}
        />
        <motion.path
          d="M4 11L8 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeInOut" }}
        />
        <motion.path
          d="M4 11A8 8 0 0 0 20 11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ display: isUpdating ? 'block' : 'none' }}
          className="update-animation"
        />
      </svg>
    </motion.div>
  );
};

export default TextUpdateButton;
