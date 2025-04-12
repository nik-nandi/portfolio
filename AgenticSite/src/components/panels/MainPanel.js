import React, { useEffect, useRef, useState } from 'react';
import './MainPanel.css';
import SectionContent from '../../components/SectionContent';
import { motion, AnimatePresence } from 'framer-motion';
import { renderTextWithBoldMarkdown } from '../../utils/responseParser';
import { MathRenderer } from '../../components/MathRenderer';

const MainPanel = ({ 
  conversationHash, 
  messages, 
  error, 
  isLoading, 
  inputText, 
  startNewConversation, 
  handleSendMessage, 
  setInputText,
  isAnimating,
  isAnyPanelExpanded = false,
  showModelInfo = true
}) => {
  const messagesEndRef = useRef(null);
  // Track which model info dropdowns are open
  const [openModelInfo, setOpenModelInfo] = useState(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close model info dropdown when any side panel is expanded
  useEffect(() => {
    if (isAnyPanelExpanded && openModelInfo) {
      setOpenModelInfo(null);
    }
  }, [isAnyPanelExpanded, openModelInfo]);

  // Toggle model info dropdown
  const toggleModelInfo = (messageId) => {
    if (isAnyPanelExpanded) return; // Don't toggle if a panel is expanded
    setOpenModelInfo(openModelInfo === messageId ? null : messageId);
  };
  
  // Helper function to render text with both bold and italic formatting
  const renderBoldText = (text) => {
    const parts = renderTextWithBoldMarkdown(text);
    if (!Array.isArray(parts)) return text;
    
    return parts.map((part, idx) => {
      if (part.bold && part.italic) {
        return <strong key={idx}><em>{part.text}</em></strong>;
      } else if (part.bold) {
        return <strong key={idx}>{part.text}</strong>;
      } else if (part.italic) {
        return <em key={idx}>{part.text}</em>;
      } else {
        return <span key={idx}>{part.text}</span>;
      }
    });
  };
  
  return (
    <div className="chat-container main-chat">
      <div className="chat-header">
        <div className="conversation-id-container">
          <span className="space-mono-regular conversation-id">
            Current Chat: {conversationHash.slice(0, 13)}...
          </span>
          <div className="conversation-tooltip space-mono-regular">
            {conversationHash}
          </div>
        </div>
        <motion.button 
          onClick={startNewConversation} 
          className="new-chat-button space-mono-bold"
          whileTap={{ scale: 0.95 }}
          whileHover={{ backgroundColor: 'var(--text-secondary)' }}
        >
          New Chat
        </motion.button>
      </div>
      
      <AnimatePresence mode="wait">
        {isAnimating ? (
          <motion.div 
            key="animation-container"
            className="animation-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="new-chat-animation">
              <motion.div 
                className="animation-circle"
                animate={{
                  scale: [1, 1.5, 0.5, 1],
                  rotate: [0, 180, 180, 0],
                  opacity: [0.5, 0.8, 0.8, 0]
                }}
                transition={{ duration: 1, times: [0, 0.3, 0.6, 1] }}
              />
              <motion.div 
                className="animation-circle secondary"
                animate={{
                  scale: [1, 0.5, 1.5, 1],
                  rotate: [0, -180, -180, 0],
                  opacity: [0.5, 0.8, 0.8, 0]
                }}
                transition={{ duration: 1, times: [0, 0.3, 0.6, 1] }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="messages-container"
            className="messages-container"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence>
              {messages.map(message => (
                <motion.div 
                  key={message.id} 
                  className={`message ${message.isUser ? 'user-message' : 'ai-message'} ${message.isLoading ? 'loading' : ''}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  layout
                >
                  {message.isUser || message.isLoading || !message.parsedContent || !message.parsedContent.isStructured ? (
                    message.text.includes('$') ? (
                      <MathRenderer content={message.text} />
                    ) : (
                      <span className="message-text">{renderBoldText(message.text)}</span>
                    )
                  ) : (
                    <div className="structured-response">
                      {message.parsedContent.sections.map((section, index) => (
                        <div key={index} className={`response-section ${section.type} ${section.hasMath ? 'has-math' : ''}`}>
                          {section.title && (
                            <div className={`section-title ${section.type}`}>
                              {section.title}
                            </div>
                          )}
                          {section.content[0] && section.content[0].trim().startsWith("*") ? (
                            <ul className="message-list">
                              {section.content.map((line, i) => (
                                <li key={i} className="list-item">
                                  {line.replace(/^\*\s*/, '')}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <SectionContent content={section.content} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add model info button and dropdown for AI messages */}
                  {!message.isUser && !message.isLoading && message.model && !isAnyPanelExpanded && showModelInfo && (
                    <div className="model-info-container">
                      <button
                        className="model-info-button space-mono-regular"
                        onClick={() => toggleModelInfo(message.id)}
                        aria-label="View model information"
                      >
                        <span className="info-icon">ℹ</span>
                      </button>
                      
                      {openModelInfo === message.id && (
                        <motion.div 
                          className="model-info-dropdown"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <div className="model-info-content space-mono-regular">
                            <div className="model-info-header">Model Info</div>
                            <div className="model-name">{message.model}</div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {renderBoldText(error)}
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <form className="input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          className="message-input space-mono-regular"
          disabled={isLoading || isAnimating}
        />
        <button 
          type="submit" 
          className="send-button space-mono-bold" 
          disabled={isLoading || inputText.trim() === '' || isAnimating}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default MainPanel;
