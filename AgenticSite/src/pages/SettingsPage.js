import React, { useContext } from 'react';
import { DarkModeContext } from '../contexts/DarkModeContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { motion } from 'framer-motion';
import './SettingsPage.css';
import PanelLayoutManager from '../components/settings/PanelLayoutManager';
import InfoBoxPositionControl from '../components/settings/InfoBoxPositionControl';

const SettingsPage = () => {
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const {
    language, setLanguage,
    notifications, setNotifications,
    fontSize, setFontSize,
    autoSave, setAutoSave,
    messageHistory, setMessageHistory,
    defaultLocation, setDefaultLocation,
    newsCategories, setNewsCategories,
    responseFormat, setResponseFormat,
    panelLayout, setPanelLayout,
    showModelInfo, setShowModelInfo, // Add showModelInfo
    infoBoxPosition, setInfoBoxPosition, // Add infoBoxPosition
    saveSettings,
    resetSettings,
  } = useContext(SettingsContext);

  // Available news categories
  const availableCategories = [
    'technology', 'science', 'business', 
    'health', 'entertainment', 'sports', 'politics'
  ];
  
  // Handle news category toggle
  const toggleNewsCategory = (category) => {
    if (newsCategories.includes(category)) {
      setNewsCategories(newsCategories.filter(cat => cat !== category));
    } else {
      setNewsCategories([...newsCategories, category]);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings via context
    saveSettings();
    console.log('Settings saved:', {
      general: { language, notifications, fontSize, autoSave, darkMode: isDarkMode },
      console: { messageHistory, defaultLocation, newsCategories, responseFormat, panelLayout, showModelInfo, infoBoxPosition }
    });
    
    // Show success message
    const successEl = document.getElementById('settings-save-success');
    successEl.classList.add('show');
    setTimeout(() => {
      successEl.classList.remove('show');
    }, 3000);
  };

  return (
    <div className="settings-page">
      <motion.div 
        className="settings-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="space-mono-bold">Settings</h1>
        <p className="space-mono-regular">Customize your 2nd Brain experience</p>
      </motion.div>
      
      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="settings-container">
          {/* General Settings Section */}
          <motion.div 
            className="settings-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="space-mono-bold section-title">
              <span className="gradient-text">General</span> Settings
            </h2>
            
            <div className="settings-cards">
              <div className="settings-card">
                <div className="setting-item">
                  <label className="setting-label space-mono-bold">Theme</label>
                  <div className="setting-control">
                    <div className="toggle-switch-container">
                      <span className={!isDarkMode ? 'active' : ''}>Light</span>
                      <div 
                        className={`toggle-switch ${isDarkMode ? 'active' : ''}`}
                        onClick={toggleDarkMode}
                      >
                        <div className="toggle-switch-handle"></div>
                      </div>
                      <span className={isDarkMode ? 'active' : ''}>Dark</span>
                    </div>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label space-mono-bold">Language</label>
                  <div className="setting-control">
                    <select 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                      className="setting-select space-mono-regular"
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
                      <option value="japanese">Japanese</option>
                    </select>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label space-mono-bold">Font Size</label>
                  <div className="setting-control">
                    <div className="slider-container">
                      <input 
                        type="range" 
                        min="12" 
                        max="24" 
                        value={fontSize} 
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="slider"
                      />
                      <span className="slider-value space-mono-regular">{fontSize}px</span>
                    </div>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label space-mono-bold">Notifications</label>
                  <div className="setting-control">
                    <div 
                      className={`toggle-switch ${notifications ? 'active' : ''}`}
                      onClick={() => setNotifications(!notifications)}
                    >
                      <div className="toggle-switch-handle"></div>
                    </div>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label space-mono-bold">Auto-save conversations</label>
                  <div className="setting-control">
                    <div 
                      className={`toggle-switch ${autoSave ? 'active' : ''}`}
                      onClick={() => setAutoSave(!autoSave)}
                    >
                      <div className="toggle-switch-handle"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Console Settings Section */}
          <motion.div 
            className="settings-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="space-mono-bold section-title">
              <span className="gradient-text">Console</span> Settings
            </h2>
            
            <div className="settings-cards">
              <div className="settings-card">
                <div className="setting-item">
                  <label className="setting-label space-mono-bold">Message History Limit</label>
                  <div className="setting-control">
                    <div className="slider-container">
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="10"
                        value={messageHistory} 
                        onChange={(e) => setMessageHistory(parseInt(e.target.value))}
                        className="slider"
                      />
                      <span className="slider-value space-mono-regular">{messageHistory} messages</span>
                    </div>
                  </div>
                </div>
                
                {/* Add Show Model Info toggle */}
                <div className="setting-item">
                  <label className="setting-label space-mono-bold">Show Model Info</label>
                  <div className="setting-control">
                    <div 
                      className={`toggle-switch ${showModelInfo ? 'active' : ''}`}
                      onClick={() => setShowModelInfo(!showModelInfo)}
                    >
                      <div className="toggle-switch-handle"></div>
                    </div>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label space-mono-bold">Default Weather Location</label>
                  <div className="setting-control">
                    <input 
                      type="text" 
                      value={defaultLocation} 
                      onChange={(e) => setDefaultLocation(e.target.value)}
                      className="setting-input space-mono-regular"
                      placeholder="Enter city name"
                    />
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label space-mono-bold">News Categories</label>
                  <div className="setting-control categories-grid">
                    {availableCategories.map(category => (
                      <div 
                        key={category} 
                        className={`category-chip space-mono-regular ${newsCategories.includes(category) ? 'active' : ''}`}
                        onClick={() => toggleNewsCategory(category)}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label space-mono-bold">AI Response Format</label>
                  <div className="setting-control">
                    <div className="radio-group">
                      <label className="radio-label space-mono-regular">
                        <input 
                          type="radio" 
                          value="structured" 
                          checked={responseFormat === 'structured'} 
                          onChange={() => setResponseFormat('structured')} 
                        />
                        <span>Structured (with sections)</span>
                      </label>
                      <label className="radio-label space-mono-regular">
                        <input 
                          type="radio" 
                          value="concise" 
                          checked={responseFormat === 'concise'} 
                          onChange={() => setResponseFormat('concise')} 
                        />
                        <span>Concise (shorter responses)</span>
                      </label>
                      <label className="radio-label space-mono-regular">
                        <input 
                          type="radio" 
                          value="detailed" 
                          checked={responseFormat === 'detailed'} 
                          onChange={() => setResponseFormat('detailed')} 
                        />
                        <span>Detailed (comprehensive)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Add InfoBox Position Control */}
                <div className="settings-card layout-settings-card">
                  <div className="setting-item layout-setting-item">
                    <label className="setting-label space-mono-bold">InfoBox Position</label>
                    <InfoBoxPositionControl 
                      position={infoBoxPosition} 
                      onChange={setInfoBoxPosition} 
                    />
                  </div>
                </div>

                {/* New Panel Layout Card */}
                <div className="settings-card layout-settings-card">
                  <div className="setting-item layout-setting-item">
                    <label className="setting-label space-mono-bold">Panel Layout</label>
                    <PanelLayoutManager 
                      panelLayout={panelLayout} 
                      setPanelLayout={setPanelLayout} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Save Button Section */}
        <motion.div 
          className="settings-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button 
            type="submit" 
            className="save-button space-mono-bold"
          >
            Save Settings
          </button>
          <button 
            type="button" 
            className="reset-button space-mono-regular"
            onClick={(e) => {
              e.preventDefault();
              resetSettings();
            }}
          >
            Reset
          </button>
          <div id="settings-save-success" className="save-success">
            <span>✓</span> Settings saved successfully
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default SettingsPage;
