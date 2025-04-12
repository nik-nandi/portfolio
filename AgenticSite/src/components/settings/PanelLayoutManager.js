import React from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './PanelLayoutManager.css';

// Draggable panel item
const PanelItem = ({ id, title, index, movePanel, section, toggleEnabled, enabled }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'PANEL',
    item: { id, index, section },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Add the drop target logic for vertical reordering
  const [, drop] = useDrop({
    accept: 'PANEL',
    hover(item, monitor) {
      if (!enabled) return; // Don't allow dropping on disabled items
      
      // Don't replace items with themselves
      if (item.index === index && item.section === section) {
        return;
      }
      
      // If item is from same section, handle vertical reordering
      if (item.section === section) {
        movePanel(section, section, item.index, index);
        // Update the item's index for further drag operations
        item.index = index;
      }
    },
  });

  // Combine drag and drop refs to make component both draggable and a drop target
  const itemRef = (node) => {
    drag(node);
    drop(node);
  };

  return (
    <div 
      ref={itemRef}
      className={`panel-item ${isDragging ? 'dragging' : ''} ${enabled ? 'enabled' : 'disabled'}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="panel-item-header">
        <span className="panel-item-title">{title}</span>
        <label className="panel-toggle">
          <input 
            type="checkbox" 
            checked={enabled} 
            onChange={() => toggleEnabled(section, id)}
            className="panel-toggle-checkbox"
          />
          <span className="panel-toggle-slider"></span>
        </label>
      </div>
      <div className="panel-item-content">
        <div className="panel-item-handle">
          <div className="panel-handle-line"></div>
          <div className="panel-handle-line"></div>
          <div className="panel-handle-line"></div>
        </div>
      </div>
    </div>
  );
};

// Panel container with drop capability
const PanelContainer = ({ section, panels, movePanel, toggleEnabled }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'PANEL',
    drop: (item) => {
      if (item.section !== section) {
        movePanel(item.section, section, item.index, panels.length);
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`panel-container ${section} ${isOver ? 'drop-hover' : ''}`}
    >
      <h3 className="panel-container-title">
        {section === 'left' ? 'Left Sidebar' : 'Right Sidebar'}
      </h3>
      {panels.map((panel, index) => (
        <PanelItem
          key={panel.id}
          id={panel.id}
          title={panel.title}
          index={index}
          section={section}
          movePanel={movePanel}
          toggleEnabled={toggleEnabled}
          enabled={panel.enabled}
        />
      ))}
    </div>
  );
};

// Main console preview component
const ConsolePreview = ({ panelLayout, movePanel, toggleEnabled }) => {
  return (
    <div className="console-preview">
      <div className="console-preview-container">
        <PanelContainer 
          section="left"
          panels={panelLayout.left}
          movePanel={movePanel}
          toggleEnabled={toggleEnabled}
        />
        <div className="main-panel-preview">
          <div className="main-panel-content">
            <div className="main-panel-header">Main Chat</div>
            <div className="main-panel-messages">
              <div className="message-preview user"></div>
              <div className="message-preview ai"></div>
              <div className="message-preview user short"></div>
              <div className="message-preview ai long"></div>
            </div>
            <div className="main-panel-input"></div>
          </div>
        </div>
        <PanelContainer 
          section="right"
          panels={panelLayout.right}
          movePanel={movePanel}
          toggleEnabled={toggleEnabled}
        />
      </div>
    </div>
  );
};

// The main panel layout manager component
const PanelLayoutManager = ({ panelLayout, setPanelLayout }) => {
  // Function to move a panel between sections or reorder within a section
  const movePanel = (fromSection, toSection, fromIndex, toIndex) => {
    const updatedLayout = { ...panelLayout };
    
    // If it's the same section and the positions are the same, don't do anything
    if (fromSection === toSection && fromIndex === toIndex) {
      return;
    }
    
    // Remove panel from source section
    const [movedPanel] = updatedLayout[fromSection].splice(fromIndex, 1);
    
    // Add panel to destination section
    updatedLayout[toSection].splice(toIndex, 0, movedPanel);
    
    // Update state
    setPanelLayout(updatedLayout);
  };
  
  // Function to toggle panel enabled state
  const toggleEnabled = (section, id) => {
    const updatedLayout = { ...panelLayout };
    const panelIndex = updatedLayout[section].findIndex(panel => panel.id === id);
    
    if (panelIndex !== -1) {
      updatedLayout[section][panelIndex].enabled = !updatedLayout[section][panelIndex].enabled;
      setPanelLayout(updatedLayout);
    }
  };

  return (
    <div className="panel-layout-manager">
      <div className="panel-layout-description">
        {/* Help text removed */}
      </div>
      
      <DndProvider backend={HTML5Backend}>
        <ConsolePreview
          panelLayout={panelLayout}
          movePanel={movePanel}
          toggleEnabled={toggleEnabled}
        />
      </DndProvider>
    </div>
  );
};

export default PanelLayoutManager;
