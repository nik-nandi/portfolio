import React, { useState, useEffect, useContext, useRef } from 'react';
import './WeatherPanel.css';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkModeContext } from '../../../contexts/DarkModeContext';
import { fetchWeatherData } from '../../../services/weatherApi';
import WeatherGraph from './WeatherGraph';
import PinButton from '../PinButton';
import TextUpdateButton from '../../common/TextUpdateButton';

const WeatherPanel = ({ isExpanded, isPinned, onToggleExpand, onTogglePin, onUpdate, panelIndex }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const closeTimeoutRef = useRef(null);
  
  // Get user's location when component mounts
  useEffect(() => {
    getUserLocation();
  }, []);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);
  
  // Mouse enter event handler
  const handleMouseEnter = () => {
    // Clear any existing timeout to prevent panel from closing
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };
  
  // Mouse leave event handler - updated to respect pinned state
  const handleMouseLeave = () => {
    // Only set a timeout if the panel is expanded and NOT pinned
    if (isExpanded && !isPinned) {
      closeTimeoutRef.current = setTimeout(() => {
        onToggleExpand(); // Close the panel
      }, 500); // 500ms delay before closing
    }
  };
  
  // Get user's geolocation
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          // Store the coordinates as separate values for direct API use
          setLocation({
            lat: latitude,
            lon: longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocation('San Francisco'); // Fallback to city name
        }
      );
    } else {
      console.error('Geolocation not supported by this browser');
      setLocation('San Francisco'); // Fallback to city name
    }
  };
  
  // Fetch real weather data using the API
  useEffect(() => {
    const getWeatherData = async () => {
      if (!location) return; // Don't fetch if location is not yet set
      
      try {
        setLoading(true);
        let data;
        
        // Check if location is an object with coordinates or a string with city name
        if (typeof location === 'object' && location.lat && location.lon) {
          // Pass latitude and longitude directly to fetchWeatherData
          data = await fetchWeatherData({
            latitude: location.lat,
            longitude: location.lon
          });
        } else {
          // Pass city name to fetchWeatherData
          data = await fetchWeatherData(location);
        }
        
        setWeatherData(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (location) {
      getWeatherData();
    }
  }, [location]);
  
  // Weather icon mapping
  const getWeatherIcon = (condition) => {
    const iconMap = {
      'sunny': '☀️',
      'clear': '☀️',
      'partly-cloudy': '⛅',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'stormy': '⛈️',
      'snowy': '❄️',
      'foggy': '🌫️'
    };
    
    return iconMap[condition] || '☀️';
  };
  
  // Format temperature with degree symbol
  const formatTemp = (temp) => `${temp}°`;
  
  // Handle double-click on the panel
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onToggleExpand();
  };
  
  return (
    <div 
      className={`chat-container secondary-box weather-panel ${isExpanded ? 'expanded' : ''} ${isPinned ? 'pinned' : ''} ${isDarkMode ? 'dark' : 'light'}`}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="chat-header weather-header">
        <div className="conversation-id-container">
          <span className="space-mono-regular conversation-id">
            Weather
          </span>
        </div>
        <div className="expand-controls">
          {isExpanded && (
            <>
              <TextUpdateButton 
                onClick={onUpdate} 
                isDarkMode={isDarkMode} 
                panelType="weather"
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
          <div className="weather-loading">
            <motion.div 
              className="loading-icon"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ☀️
            </motion.div>
            <p>Loading weather data...</p>
          </div>
        ) : weatherData && (
          <div className="weather-content">
            <div className="weather-location">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {weatherData.location}
              </motion.span>
            </div>
            
            <div className="current-weather">
              <motion.div 
                className="weather-icon"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {getWeatherIcon(weatherData.current.icon)}
              </motion.div>
              
              <div className="weather-details">
                <motion.div 
                  className="temperature"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {formatTemp(weatherData.current.temp)}
                </motion.div>
                <motion.div 
                  className="condition"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {weatherData.current.condition}
                </motion.div>
              </div>
            </div>
            
            <motion.div 
              className="weather-metrics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="metric">
                <span className="metric-label">Humidity</span>
                <span className="metric-value">{weatherData.current.humidity}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Wind</span>
                <span className="metric-value">{weatherData.current.wind} mph</span>
              </div>
              <div className="metric">
                <span className="metric-label">Feels like</span>
                <span className="metric-value">{formatTemp(weatherData.current.feelsLike)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Precip.</span>
                <span className="metric-value" title={weatherData.current.forecastText || ''}>{weatherData.current.precipProb}%</span>
              </div>
            </motion.div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  className="forecast"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="forecast-title space-mono-regular">Forecast</h4>
                  <div className="forecast-days">
                    {weatherData.forecast.map((day, index) => (
                      <motion.div 
                        key={day.day} 
                        className="forecast-day"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + (index * 0.1) }}
                      >
                        <div className="day-name">{day.day}</div>
                        <div className="day-icon">{getWeatherIcon(day.condition)}</div>
                        <div className="day-temp">
                          <span className="high">{formatTemp(day.high)}</span>
                          <span className="low">{formatTemp(day.low)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Add the hourly forecast graph below the 3-day forecast */}
                  {weatherData.hourlyForecast && weatherData.hourlyForecast.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="weather-graph-container"
                    >
                      <WeatherGraph 
                        hourlyData={weatherData.hourlyForecast} 
                        isDarkMode={isDarkMode} 
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherPanel;
