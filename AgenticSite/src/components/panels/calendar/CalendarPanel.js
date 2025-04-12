import React, { useState, useEffect, useContext, useRef } from 'react';
import './CalendarPanel.css';
import { motion } from 'framer-motion';
import { DarkModeContext } from '../../../contexts/DarkModeContext';
import PinButton from '../PinButton';
import TextUpdateButton from '../../common/TextUpdateButton';

const CalendarPanel = ({ isExpanded, isPinned, onToggleExpand, onTogglePin, onUpdate, panelIndex }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true); // Start with loading true
  const closeTimeoutRef = useRef(null);
  
  // Extract year and month from currentDate for static dependency checking
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Initialize calendar data with loading state
  useEffect(() => {
    // Simulate loading calendar data
    const loadCalendarData = async () => {
      setLoading(true);
      
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Initialize with some sample events using extracted values
      setEvents(prev => ({
        ...prev,
        [`${currentYear}-${currentMonth+1}-15`]: ["Team meeting"],
        [`${currentYear}-${currentMonth+1}-20`]: ["Deadline"]
      }));
      
      setLoading(false);
    };
    
    loadCalendarData();
  }, [currentYear, currentMonth]); // updated dependencies
  
  // Update current date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
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
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };
  
  // Mouse leave event handler - respect pinned state
  const handleMouseLeave = () => {
    if (isExpanded && !isPinned) {
      closeTimeoutRef.current = setTimeout(() => {
        onToggleExpand();
      }, 500);
    }
  };

  // Handle double-click on the panel
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onToggleExpand();
  };

  // Format functions
  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };
  
  const getMonthName = (month) => {
    return new Date(2000, month).toLocaleDateString('en-US', { month: 'long' });
  };

  // Format time in 12-hour format with AM/PM
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${hours}:${minutes} ${ampm}`;
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigation functions with loading states
  const goToPreviousMonth = async () => {
    setLoading(true);
    
    setSelectedMonth(prev => {
      if (prev === 0) {
        setSelectedYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
    
    // Simulate loading delay when changing months
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const goToNextMonth = async () => {
    setLoading(true);
    
    setSelectedMonth(prev => {
      if (prev === 11) {
        setSelectedYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
    
    // Simulate loading delay when changing months
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  // Refresh calendar function for TextUpdateButton
  const handleCalendarUpdate = () => {
    setLoading(true);
    
    // Simulate refresh with delay
    setTimeout(() => {
      // This is where we would fetch updated event data
      setLoading(false);
    }, 1000);
    
    // If onUpdate is passed from parent, call it
    if (onUpdate) {
      onUpdate("calendar", "Calendar updated successfully");
    }
  };

  // Render calendar grid
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDayOfMonth = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${selectedYear}-${selectedMonth+1}-${day}`;
      const isToday = day === currentDate.getDate() && 
                       selectedMonth === currentDate.getMonth() && 
                       selectedYear === currentDate.getFullYear();
      const hasEvents = events[dateKey] && events[dateKey].length > 0;
      
      days.push(
        <motion.div 
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-event' : ''}`}
          whileHover={{ 
            scale: 1.03, 
            boxShadow: isDarkMode 
              ? "0px 5px 12px rgba(0,0,0,0.3)" 
              : "0px 5px 10px rgba(162,44,41,0.15)" 
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.2,
            delay: day * 0.01,
            ease: "easeOut"
          }}
          layout
        >
          <span className="day-number-expanded">{day}</span>
          {hasEvents && (
            <div className="event-indicator-container">
              {events[dateKey].map((event, idx) => (
                <motion.div 
                  key={idx} 
                  className="event-tag" 
                  title={event}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (idx * 0.05) }}
                >
                  {event}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      );
    }
    
    return days;
  };

  // Render mini view animations
  const renderDateDigits = (number) => {
    return String(number).split('').map((digit, i) => (
      <motion.span 
        key={i} 
        className="date-digit"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 + 0.2 }}
      >
        {digit}
      </motion.span>
    ));
  };

  return (
    <div 
      className={`chat-container secondary-box calendar-panel ${isExpanded ? 'expanded' : ''} ${isPinned ? 'pinned' : ''} ${isDarkMode ? 'dark' : 'light'}`}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="chat-header calendar-header">
        <div className="conversation-id-container">
          <span className="space-mono-regular conversation-id">
            Calendar
          </span>
        </div>
        <div className="expand-controls">
          {isExpanded && (
            <>
              <TextUpdateButton 
                onClick={handleCalendarUpdate} 
                isDarkMode={isDarkMode} 
                panelType="calendar"
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
          <div className="calendar-loading">
            <motion.div 
              className="loading-icon"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              📅
            </motion.div>
            <p>Loading calendar...</p>
          </div>
        ) : (
          <div className="calendar-content">
            {!isExpanded ? (
              // Mini view with current date
              <motion.div 
                className="current-date-display"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="month-display"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {currentDate.toLocaleDateString('en-US', { month: 'short' })}
                </motion.div>
                
                <motion.div 
                  className="day-number"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {renderDateDigits(currentDate.getDate())}
                </motion.div>
                
                <motion.div 
                  className="weekday-display"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {getDayName(currentDate)}
                </motion.div>
                
                <motion.div 
                  className="year-display"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentDate.getFullYear()}
                </motion.div>
                
                {/* Time display with enhanced animation */}
                <motion.div 
                  className="time-display"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.span 
                    className="time-icon"
                    animate={{ 
                      rotate: [0, 0, -10, 10, 0],
                      scale: [1, 1, 1.1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatDelay: 3 
                    }}
                  >
                    ⏱
                  </motion.span>
                  <motion.span 
                    className="time-text"
                    animate={{ 
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  >
                    {formatTime(currentDate)}
                  </motion.span>
                </motion.div>
                
                <motion.div 
                  className="calendar-decoration"
                  animate={{ 
                    rotate: [0, 5, -5, 5, 0],
                    scale: [1, 1.02, 0.98, 1.02, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 8,
                  }}
                />
              </motion.div>
            ) : (
              // Expanded view with full calendar
              <div className="calendar-expanded-view">
                <div className="calendar-header-controls">
                  <motion.button 
                    className="calendar-nav-button"
                    onClick={goToPreviousMonth}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ←
                  </motion.button>
                  
                  <motion.h3 className="calendar-current-month">
                    {getMonthName(selectedMonth)} {selectedYear}
                  </motion.h3>
                  
                  <motion.button 
                    className="calendar-nav-button"
                    onClick={goToNextMonth}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    →
                  </motion.button>
                </div>
                
                <div className="calendar-weekdays">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="weekday-header">{day}</div>
                  ))}
                </div>
                
                <motion.div 
                  className="calendar-days-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {renderCalendarDays()}
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPanel;
