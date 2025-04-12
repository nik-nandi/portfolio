import React, { useState, useEffect, useContext } from 'react';
import './ConsolePage.css';

import 'katex/dist/katex.min.css';

import { callChatAPI } from '../services/apiChat';
import { parseAIResponse } from '../utils/responseParser';
import { SettingsContext } from '../contexts/SettingsContext';
import { InfoTextContext } from '../contexts/InfoTextContext';
import { useInfoTextQuery } from '../components/common/InfoTextQuery';

import MainPanel from '../components/panels/MainPanel';
import SidePanel from '../components/panels/SidePanel';
import WeatherPanel from '../components/panels/weather/WeatherPanel';
import NewsPanel from '../components/panels/news/NewsPanel';
import InfoTextBox from '../components/common/InfoTextBox';
import CalendarPanel from '../components/panels/calendar/CalendarPanel';

function Console() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I assist you today?", isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationHash, setConversationHash] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  // Simplified state for tracking expanded panels - now just has one expanded index per side
  const [expandedPanels, setExpandedPanels] = useState({
    left: null,  // null means none are expanded
    right: null  // null means none are expanded
  });
  const [pinnedPanels, setPinnedPanels] = useState({
    left: [],
    right: []
  });
  
  // Get panel layout and showModelInfo from settings
  const { panelLayout, showModelInfo, infoBoxPosition } = useContext(SettingsContext);
  
  // Use the InfoTextContext
  const { setInfo } = useContext(InfoTextContext);
  const { displayQueryProcessing } = useInfoTextQuery();

  // Calculate InfoTextBox coordinates based on selected location
  const getInfoBoxCoordinates = () => {
    if (!infoBoxPosition || infoBoxPosition.location === 'left-panel') {
      return null; // Use default positioning
    }
    
    // Map location IDs to actual coordinates
    switch (infoBoxPosition.location) {
      case 'top-left':
        return { top: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'center-top':
        return { top: '20px', left: '50%', transform: 'translateX(-50%)' };
      default:
        return null;
    }
  };

  // Generate conversation hash on component mount
  useEffect(() => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const newHash = `chat_${timestamp}_${randomStr}`;
    setConversationHash(newHash);
    console.log(`New conversation started with ID: ${newHash}`);
  }, [setInfo]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;
    
    // Add user message
    const newUserMessage = { id: messages.length + 1, text: inputText, isUser: true };
    setMessages([...messages, newUserMessage]);
    
    // Update info text to show query is being processed
    displayQueryProcessing(inputText);
    
    // Clear input immediately for better UX
    const userMessageText = inputText;
    setInputText('');
    
    // Add a temporary "typing" indicator
    const typingIndicatorId = messages.length + 2;
    setMessages(prev => [...prev, { 
      id: typingIndicatorId, 
      text: "...", 
      isUser: false,
      isLoading: true
    }]);
    
    try {
      setIsLoading(true);
      
      // Call the API service function
      const apiResponse = await callChatAPI(userMessageText, conversationHash);
      
      // Parse the response before adding to messages
      const parsedResponse = parseAIResponse(apiResponse.text);
      
      // Remove typing indicator and add actual response
      setMessages(prev => prev
        .filter(msg => msg.id !== typingIndicatorId)
        .concat({
          id: Date.now(), 
          text: apiResponse.text,
          parsedContent: parsedResponse,
          isUser: false,
          model: apiResponse.model // Store model information
        })
      );
    } catch (err) {
      console.error('API call failed:', err);
      setError(`API Error: ${err.message}`);
      
      // Remove typing indicator and add error message
      setMessages(prev => prev
        .filter(msg => msg.id !== typingIndicatorId)
        .concat({
          id: Date.now(),
          text: "Sorry, I couldn't process your request. Please try again later.",
          isUser: false
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new conversation with animation
  const startNewConversation = () => {
    setIsAnimating(true);
    
    setTimeout(() => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const newHash = `chat_${timestamp}_${randomStr}`;
      setConversationHash(newHash);
      console.log(`New conversation started with ID: ${newHash}`);
      
      setMessages([
        { id: 1, text: "Hello! How can I assist you today?", isUser: false, isNew: true }
      ]);
      setError(null);
      
      // End animation after a brief delay to allow for fade-in
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 600); // Delay to allow fade-out animation to complete
  };

  // Single toggle function to handle panel expansion/collapse
  const togglePanelExpansion = (side, index) => {
    setExpandedPanels(prev => {
      // Don't collapse if pinned
      if (prev[side] === index && pinnedPanels[side].includes(index)) {
        return prev;
      }
      return {
        ...prev,
        [side]: prev[side] === index ? null : index
      };
    });
  };

  // Handle panel pinning
  const togglePanelPin = (side, index) => {
    setPinnedPanels(prev => {
      const updated = { ...prev };
      
      if (updated[side].includes(index)) {
        // Unpin the panel
        updated[side] = updated[side].filter(i => i !== index);
      } else {
        // Pin the panel
        updated[side] = [...updated[side], index];
      }
      
      return updated;
    });
  };

  // Function to render panels based on configuration
  const renderPanels = (section) => {
    if (!panelLayout || !panelLayout[section]) return null;
    
    return panelLayout[section]
      .filter(panel => panel.enabled)
      .map((panel, index) => {
        const isPinned = pinnedPanels[section].includes(index);
        
        switch(panel.id) {
          case 'weather':
            return (
              <WeatherPanel 
                key={panel.id}
                isExpanded={expandedPanels[section] === index}
                isPinned={isPinned}
                onToggleExpand={() => togglePanelExpansion(section, index)}
                onTogglePin={() => togglePanelPin(section, index)}
                panelIndex={index}
              />
            );
          case 'news':
            return (
              <NewsPanel 
                key={panel.id}
                isExpanded={expandedPanels[section] === index}
                isPinned={isPinned}
                onToggleExpand={() => togglePanelExpansion(section, index)}
                onTogglePin={() => togglePanelPin(section, index)}
                panelIndex={index}
              />
            );
          case 'calendar':
            return (
              <CalendarPanel
                key={panel.id}
                isExpanded={expandedPanels[section] === index}
                isPinned={isPinned}
                onToggleExpand={() => togglePanelExpansion(section, index)}
                onTogglePin={() => togglePanelPin(section, index)}
                panelIndex={index}
              />
            );
          default:
            return (
              <SidePanel 
                key={panel.id}
                title={panel.title}
                content={`This is the ${panel.title} panel content.`}
                isExpanded={expandedPanels[section] === index}
                isPinned={isPinned}
                onToggleExpand={() => togglePanelExpansion(section, index)}
                onTogglePin={() => togglePanelPin(section, index)}
                panelIndex={index}
              />
            );
        }
      });
  };

  return (
    <div className="console-page">
      <div className="console-layout" style={{ 
        display: 'flex',
        flexDirection: 'row',
        marginLeft: '20px',
        maxWidth: '1600px',
        justifyContent: 'flex-start',
        gap: '20px',
        position: 'relative', /* For absolute positioning of InfoBox */
      }}>
        {/* Info text box in default left panel position */}
        {infoBoxPosition?.location === 'left-panel' ? (
          <div style={{ flexShrink: 0, position: 'relative', zIndex: 2 }}>
            <InfoTextBox />
          </div>
        ) : null}
        
        <div className="console-outer-container" style={{ 
          width: '100%',
          position: 'relative', /* Ensure proper stacking context */
          zIndex: 1
        }}>
          {/* Left side panels */}
          <div className="side-panels left-panels">
            {renderPanels('left')}
          </div>
          
          {/* Main chat container (in the middle) */}
          <div className="main-container" style={{ marginLeft: '0' }}>
            <MainPanel 
              conversationHash={conversationHash}
              messages={messages}
              error={error}
              isLoading={isLoading}
              inputText={inputText}
              startNewConversation={startNewConversation}
              handleSendMessage={handleSendMessage}
              setInputText={setInputText}
              isAnimating={isAnimating}
              isAnyPanelExpanded={expandedPanels.left !== null || expandedPanels.right !== null}
              showModelInfo={showModelInfo}
            />
          </div>
          
          {/* Right side panels */}
          <div className="side-panels right-panels">
            {renderPanels('right')}
          </div>
        </div>
        
        {/* InfoTextBox in custom position */}
        {infoBoxPosition?.location !== 'left-panel' && (
          <InfoTextBox coordinates={getInfoBoxCoordinates()} />
        )}
      </div>
    </div>
  );
}

export default Console;