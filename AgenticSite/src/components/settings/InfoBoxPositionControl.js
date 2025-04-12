import React from 'react';
import './InfoBoxPositionControl.css';

const InfoBoxPositionControl = ({ position, onChange }) => {
  // Available positions for the InfoBox
  const availablePositions = [
    { id: 'left-panel', label: 'Left Panel (Default)', description: 'Display in left sidebar' },
    { id: 'top-left', label: 'Top Left', description: 'Anchored to top left corner' },
    { id: 'top-right', label: 'Top Right', description: 'Anchored to top right corner' },
    { id: 'bottom-left', label: 'Bottom Left', description: 'Anchored to bottom left corner' },
    { id: 'bottom-right', label: 'Bottom Right', description: 'Anchored to bottom right corner' },
    { id: 'center-top', label: 'Center Top', description: 'Centered at the top' }
  ];

  // Handle position selection
  const handlePositionChange = (locationId) => {
    onChange({ location: locationId });
  };

  return (
    <div className="info-box-position-control">
      <div className="position-preview-area">
        {/* Screen representation */}
        <div className="screen-representation">
          <div className="header-area"></div>
          <div className="content-area">
            <div className="sidebar-area left"></div>
            <div className="central-area"></div>
            <div className="sidebar-area right"></div>
          </div>
          
          {/* Position indicators */}
          {availablePositions.map(pos => (
            pos.id !== 'left-panel' && (
              <div 
                key={pos.id}
                className={`position-indicator ${pos.id} ${position.location === pos.id ? 'active' : ''}`}
                onClick={() => handlePositionChange(pos.id)}
                title={pos.label}
              >
                <div className="info-box-representation"></div>
              </div>
            )
          ))}
          
          {/* Left panel special case */}
          {position.location === 'left-panel' && (
            <div className="left-panel-representation">
              <div className="info-box-representation"></div>
            </div>
          )}
        </div>
      </div>

      <div className="position-options">
        <p className="position-instructions">Select a position for the InfoBox:</p>
        <div className="position-buttons">
          {availablePositions.map(pos => (
            <button
              key={pos.id}
              className={`position-button ${position.location === pos.id ? 'active' : ''}`}
              onClick={() => handlePositionChange(pos.id)}
              title={pos.description}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="position-description">
        {availablePositions.find(pos => pos.id === position.location)?.description}
      </div>
    </div>
  );
};

export default InfoBoxPositionControl;
