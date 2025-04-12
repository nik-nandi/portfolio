import React, { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

// Default panel configuration
const DEFAULT_PANEL_LAYOUT = {
  left: [
    { id: 'weather', title: 'Weather', enabled: true },
    { id: 'news', title: 'News', enabled: true },
    { id: 'info', title: 'Information', enabled: true }
  ],
  right: [
    { id: 'calendar', title: 'Calendar', enabled: true },
    { id: 'reference2', title: 'Reference 2', enabled: true },
    { id: 'reference3', title: 'Reference 3', enabled: true }
  ]
};

// Default position for InfoTextBox
const DEFAULT_INFO_BOX_POSITION = {
  location: 'left-panel' // Options: 'left-panel', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center-top'
};

export const SettingsProvider = ({ children }) => {
  // General Settings
  const [language, setLanguage] = useState('english');
  const [notifications, setNotifications] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [autoSave, setAutoSave] = useState(true);

  // Console Settings
  const [messageHistory, setMessageHistory] = useState(50);
  const [defaultLocation, setDefaultLocation] = useState('San Francisco');
  const [newsCategories, setNewsCategories] = useState(['technology', 'science']);
  const [responseFormat, setResponseFormat] = useState('structured');
  const [panelLayout, setPanelLayout] = useState(DEFAULT_PANEL_LAYOUT);
  const [showModelInfo, setShowModelInfo] = useState(true); // New setting for model info display
  const [infoBoxPosition, setInfoBoxPosition] = useState(DEFAULT_INFO_BOX_POSITION); // New setting for InfoTextBox position

  // Optionally load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setLanguage(settings.language || 'english');
      setNotifications(settings.notifications ?? true);
      setFontSize(settings.fontSize || 16);
      setAutoSave(settings.autoSave ?? true);
      setMessageHistory(settings.messageHistory || 50);
      setDefaultLocation(settings.defaultLocation || 'San Francisco');
      setNewsCategories(settings.newsCategories || ['technology', 'science']);
      setResponseFormat(settings.responseFormat || 'structured');
      if (settings.panelLayout) {
        setPanelLayout(settings.panelLayout);
      }
      setShowModelInfo(settings.showModelInfo ?? true); // Load showModelInfo setting
      // Load infoBoxPosition setting
      if (settings.infoBoxPosition) {
        setInfoBoxPosition(settings.infoBoxPosition);
      }
    }
  }, []);

  // NEW: Update CSS variable when fontSize changes
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);
  }, [fontSize]);

  const saveSettings = () => {
    const settings = {
      language,
      notifications,
      fontSize,
      autoSave,
      messageHistory,
      defaultLocation,
      newsCategories,
      responseFormat,
      panelLayout,
      showModelInfo, // Save showModelInfo setting
      infoBoxPosition // Save infoBoxPosition setting
    };
    localStorage.setItem('settings', JSON.stringify(settings));
  };

  // Function to reset settings to defaults
  const resetSettings = () => {
    // Reset general settings
    setLanguage('english');
    setNotifications(true);
    setFontSize(16);
    setAutoSave(true);
    
    // Reset console settings
    setMessageHistory(50);
    setDefaultLocation('San Francisco');
    setNewsCategories(['technology', 'science']);
    setResponseFormat('structured');
    setShowModelInfo(true); // Reset showModelInfo setting
    
    // Reset panel layout to default configuration
    setPanelLayout({...DEFAULT_PANEL_LAYOUT});
    
    // Reset InfoTextBox position to default
    setInfoBoxPosition({...DEFAULT_INFO_BOX_POSITION});
    
    // Clear localStorage
    localStorage.removeItem('settings');
    
    // Show success message
    const successEl = document.getElementById('settings-save-success');
    if (successEl) {
      successEl.textContent = "✓ Settings reset successfully";
      successEl.classList.add('show');
      setTimeout(() => {
        successEl.classList.remove('show');
      }, 3000);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        language, setLanguage,
        notifications, setNotifications,
        fontSize, setFontSize,
        autoSave, setAutoSave,
        messageHistory, setMessageHistory,
        defaultLocation, setDefaultLocation,
        newsCategories, setNewsCategories,
        responseFormat, setResponseFormat,
        panelLayout, setPanelLayout,
        showModelInfo, setShowModelInfo, // Add showModelInfo to context
        infoBoxPosition, setInfoBoxPosition, // Add infoBoxPosition to context
        saveSettings,
        resetSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
