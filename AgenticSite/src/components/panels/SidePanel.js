import React, { useContext } from 'react';
import './SidePanel.css';
import { DarkModeContext } from '../../contexts/DarkModeContext';
import PinButton from './PinButton';
import TextUpdateButton from '../common/TextUpdateButton';

const SidePanel = ({ 
  title, 
  content, 
  isExpanded,
  isPinned,
  onToggleExpand,
  onTogglePin,
  onUpdate,
  panelIndex 
}) => {
  const { isDarkMode } = useContext(DarkModeContext);
  
  // Handle double-click on the panel body
  const handleDoubleClick = (e) => {
    // Prevent any parent elements from also handling this event
    e.stopPropagation();
    onToggleExpand();
  };

  return (
    <div 
      className={`chat-container secondary-box ${isExpanded ? 'expanded' : ''} ${isPinned ? 'pinned' : ''} ${isDarkMode ? 'dark' : 'light'}`} 
      onDoubleClick={handleDoubleClick}
    >
      <div className="chat-header">
        <div 
          className="conversation-id-container"
          style={{ cursor: 'pointer', flex: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="space-mono-regular conversation-id">
            {title}
          </span>
        </div>
        <div className="expand-controls">
          {isExpanded && (
            <>
              <TextUpdateButton 
                onClick={onUpdate} 
                isDarkMode={isDarkMode} 
                panelType={title.toLowerCase()}
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
        <div className="message ai-message">
          <div className="section-content">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
