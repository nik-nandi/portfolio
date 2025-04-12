import React, { useState, useEffect } from 'react';
import { 
  Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine, Label,
  Area, ComposedChart
} from 'recharts';
import './WeatherGraph.css';

const WeatherGraph = ({ hourlyData, isDarkMode }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [currentTimePosition, setCurrentTimePosition] = useState(null);
  
  // Enhanced theme-consistent colors
  const colors = {
    temp: isDarkMode ? 'var(--melon)' : 'var(--old-rose)',
    tempGradientStart: isDarkMode ? 'rgba(255, 180, 162, 0.4)' : 'rgba(181, 131, 141, 0.4)',
    tempGradientEnd: isDarkMode ? 'rgba(255, 180, 162, 0)' : 'rgba(181, 131, 141, 0)',
    precip: isDarkMode ? '#83a8c9' : '#4682b4',
    precipGradientStart: isDarkMode ? 'rgba(131, 168, 201, 0.4)' : 'rgba(70, 130, 180, 0.4)',
    precipGradientEnd: isDarkMode ? 'rgba(131, 168, 201, 0)' : 'rgba(70, 130, 180, 0)',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    text: isDarkMode ? 'var(--dark-text)' : 'var(--dim-gray)',
    background: isDarkMode ? 'var(--dark-bg-secondary)' : 'rgba(255, 205, 178, 0.15)',
    currentTime: isDarkMode ? 'var(--dark-highlight)' : 'var(--salmon-pink)',
    daySelector: isDarkMode ? 'var(--dark-accent)' : 'var(--salmon-pink)',
  };

  // Find current hour for the reference line
  useEffect(() => {
    if (!hourlyData || !hourlyData[selectedDay]) return;
    
    const now = new Date();
    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDate = new Date(hourlyData[selectedDay].hourlyData[0].time).setHours(0, 0, 0, 0);
    
    // Only show reference line for today's data
    if (today === selectedDate) {
      const currentHour = now.getHours();
      setCurrentTimePosition(currentHour);
    } else {
      setCurrentTimePosition(null);
    }
  }, [selectedDay, hourlyData]);
  
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className={`weather-graph-empty ${isDarkMode ? 'dark' : 'light'}`}>
        <span className="empty-icon">📊</span>
        <p>No forecast data available</p>
      </div>
    );
  }

  const formatTime = (time) => {
    const date = new Date(time);
    return date.getHours() === 0 ? '12am' : 
           date.getHours() === 12 ? '12pm' : 
           date.getHours() > 12 ? `${date.getHours() - 12}pm` : 
           `${date.getHours()}am`;
  };
  
  const formatData = (dayData) => {
    if (!dayData || !dayData.hourlyData) return [];
    
    return dayData.hourlyData.map(hour => ({
      time: hour.time,
      formattedTime: formatTime(hour.time),
      temperature: hour.temperature,
      precipitation: hour.precipitationChance,
      hour: new Date(hour.time).getHours(), // Add hour for filtering
    }));
  };
  
  const currentDayData = hourlyData[selectedDay];
  const formattedData = formatData(currentDayData);

  // Navigation handlers
  const goToPreviousDay = () => {
    setSelectedDay(prev => (prev > 0 ? prev - 1 : prev));
  };

  const goToNextDay = () => {
    setSelectedDay(prev => (prev < hourlyData.length - 1 ? prev + 1 : prev));
  };

  // Enhanced custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`weather-graph-tooltip ${isDarkMode ? 'dark' : 'light'}`}>
          <p className="time">{payload[0].payload.formattedTime}</p>
          <div className="tooltip-data">
            <div className="tooltip-item">
              <span className="tooltip-icon temp-icon">🌡️</span>
              <span className="tooltip-value">{payload[0].value}°F</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-icon precip-icon">💧</span>
              <span className="tooltip-value">{payload[1].value}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Function to determine which hours to display on x-axis
  const shouldDisplayTick = (hour) => {
    // Show only hours divisible by 6 (midnight, 6am, noon, 6pm)
    return hour % 6 === 0;
  };

  return (
    <div className={`weather-graph-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="weather-graph-day-selector">
        <button 
          className={`arrow-button left ${isDarkMode ? 'dark' : 'light'}`}
          onClick={goToPreviousDay}
          disabled={selectedDay === 0}
          aria-label="Previous day"
        >
          &#10094;
        </button>
        
        <div className={`selected-day ${isDarkMode ? 'dark' : 'light'}`}>
          {hourlyData[selectedDay].date.split(',')[0]}
        </div>
        
        <button 
          className={`arrow-button right ${isDarkMode ? 'dark' : 'light'}`}
          onClick={goToNextDay}
          disabled={selectedDay === hourlyData.length - 1}
          aria-label="Next day"
        >
          &#10095;
        </button>
      </div>
      
      <div className="weather-graph-wrapper">
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart
            data={formattedData}
            margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="tempColorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.tempGradientStart} stopOpacity={0.9}/>
                <stop offset="95%" stopColor={colors.tempGradientEnd} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="precipColorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.precipGradientStart} stopOpacity={0.9}/>
                <stop offset="95%" stopColor={colors.precipGradientEnd} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis 
              dataKey="formattedTime" 
              tick={{ fontSize: 11, fill: colors.text }}
              tickLine={{ stroke: colors.grid }}
              axisLine={{ stroke: colors.grid }}
              tickMargin={5}
              ticks={formattedData
                .filter(item => shouldDisplayTick(item.hour))
                .map(item => item.formattedTime)}
            />
            <YAxis 
              yAxisId="temp"
              domain={['dataMin - 5', 'dataMax + 5']}
              tick={{ fontSize: 11, fill: colors.text }}
              tickLine={{ stroke: colors.grid }}
              axisLine={{ stroke: colors.grid }}
              tickMargin={5}
            />
            <YAxis 
              yAxisId="precip"
              orientation="right"
              domain={[0, 100]}
              hide={true}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {currentTimePosition !== null && (
              <ReferenceLine 
                x={formattedData.find(d => new Date(d.time).getHours() === currentTimePosition)?.formattedTime}
                stroke={colors.currentTime}
                strokeWidth={2}
                strokeDasharray="3 3"
                yAxisId="temp"
                label={
                  <Label 
                    value="Now" 
                    position="top" 
                    fill={colors.text} 
                    fontSize={11}
                    fontWeight="var(--font-weight-medium)"
                  />
                }
              />
            )}
            
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke={colors.temp}
              strokeWidth={3}
              fill="url(#tempColorGradient)"
              activeDot={{ r: 5, fill: colors.temp, stroke: isDarkMode ? '#2a2a2a' : '#fff', strokeWidth: 2 }}
              dot={{ r: 0 }}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
            <Line 
              yAxisId="precip"
              type="monotone" 
              dataKey="precipitation" 
              stroke={colors.precip} 
              strokeWidth={2}
              dot={{ r: 0 }}
              activeDot={{ r: 4, fill: colors.precip, stroke: isDarkMode ? '#2a2a2a' : '#fff', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        <div className="weather-graph-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: colors.temp }}></span>
            <span className="legend-text">Temperature (°F)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: colors.precip }}></span>
            <span className="legend-text">Precipitation (%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherGraph;
