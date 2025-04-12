import React, { createContext, useState, useEffect, useCallback } from 'react';

export const InfoTextContext = createContext();

export const InfoTextProvider = ({ children, defaultText = "Welcome to the 2nd Brain logs interface." }) => {
  // Main info text that's displayed
  const [infoText, setInfoText] = useState(defaultText);
  
  // History of info texts for backward navigation if needed
  const [infoTextHistory, setInfoTextHistory] = useState([defaultText]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Timer ID for temporary texts
  const [tempTextTimerId, setTempTextTimerId] = useState(null);

  // Set a new permanent info text (adds to history)
  const setInfo = useCallback((text) => {
    setInfoText(text);
    setInfoTextHistory(prev => [...prev.slice(0, historyIndex + 1), text]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Set a temporary info text that reverts after a specified duration
  const setTemporaryInfo = useCallback((text, durationMs = 5000) => {
    const prevText = infoText;
    
    // Clear any existing timer
    if (tempTextTimerId) {
      clearTimeout(tempTextTimerId);
    }
    
    // Set the temporary text
    setInfoText(text);
    
    // Set timer to revert back to previous text
    const timerId = setTimeout(() => {
      setInfoText(prevText);
      setTempTextTimerId(null);
    }, durationMs);
    
    setTempTextTimerId(timerId);
  }, [infoText, tempTextTimerId]);

  // Function to reset InfoTextBox visibility
  const resetInfoBoxVisibility = useCallback(() => {
    // We'll use a custom event to communicate with InfoTextBox components
    const event = new CustomEvent('resetInfoBoxVisibility');
    window.dispatchEvent(event);
  }, []);

  // Navigate through history
  const goBackInHistory = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setInfoText(infoTextHistory[historyIndex - 1]);
    }
  }, [historyIndex, infoTextHistory]);

  const goForwardInHistory = useCallback(() => {
    if (historyIndex < infoTextHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setInfoText(infoTextHistory[historyIndex + 1]);
    }
  }, [historyIndex, infoTextHistory]);

  // Clean up any timers when the component unmounts
  useEffect(() => {
    return () => {
      if (tempTextTimerId) {
        clearTimeout(tempTextTimerId);
      }
    };
  }, [tempTextTimerId]);

  return (
    <InfoTextContext.Provider 
      value={{
        infoText,
        setInfo,
        setTemporaryInfo,
        goBackInHistory,
        goForwardInHistory,
        canGoBack: historyIndex > 0,
        canGoForward: historyIndex < infoTextHistory.length - 1,
        resetInfoBoxVisibility
      }}
    >
      {children}
    </InfoTextContext.Provider>
  );
};
