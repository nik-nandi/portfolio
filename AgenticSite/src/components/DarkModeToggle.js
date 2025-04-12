import React, { useContext, useState } from 'react';
import { DarkModeContext } from '../contexts/DarkModeContext';
import './DarkModeToggle.css';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Handle toggle click with animation states
  const handleToggle = () => {
    setIsAnimating(true);
    toggleDarkMode();
    
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <button 
      onClick={handleToggle} 
      className={`dark-mode-toggle-btn ${isDarkMode ? 'dark' : 'light'} ${isAnimating ? 'animating' : ''}`}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="toggle-background"></div>
      <div className="toggle-icon-wrapper">
        {/* Sun Icon */}
        <svg 
          className="sun-icon"
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle className="sun-circle" cx="12" cy="12" r="5" />
          <line className="sun-ray ray-1" x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" />
          <line className="sun-ray ray-2" x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
          <line className="sun-ray ray-3" x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" />
          <line className="sun-ray ray-4" x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" />
          <line className="sun-ray ray-5" x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" />
          <line className="sun-ray ray-6" x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" />
          <line className="sun-ray ray-7" x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" />
          <line className="sun-ray ray-8" x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Moon Icon */}
        <svg 
          className="moon-icon"
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            className="moon-path" 
            d="M21 12.79A9 9 0 1 1 11.21 3 A7 7 0 0 0 21 12.79z" 
          />
        </svg>
      </div>
      
      {/* Particles for toggle effect */}
      <div className="particles-container">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>
    </button>
  );
};

export default DarkModeToggle;
