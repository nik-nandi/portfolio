import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import Home from './pages/HomePage';
import Console from './pages/ConsolePage';
import Settings from './pages/SettingsPage';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { InfoTextProvider } from './contexts/InfoTextContext';
import DarkModeToggle from './components/DarkModeToggle';

function AppContent() {
  const location = useLocation();
  
  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="app-title">2nd Brain</h1>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/console">Console</Link></li>
            <li><Link to="/settings">Settings</Link></li>
            <li><DarkModeToggle /></li>
          </ul>
        </div>
      </nav>
      
      <div className="content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/console" element={<PageTransition><Console /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </div>
      
      <footer className="footer">
        <p>© 2025 2nd Brain</p>
      </footer>
      
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <SettingsProvider>
        <InfoTextProvider>
          <Router>
            <AppContent />
          </Router>
        </InfoTextProvider>
      </SettingsProvider>
    </DarkModeProvider>
  );
}

export default App;