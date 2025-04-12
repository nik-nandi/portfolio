import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './HomePage.css';
import BrainIcon from '../components/icons/BrainIcon';

function Home() {
  return (
    <div className="home-page">
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <div className="hero-section">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-content"
        >
          <h1 className="space-mono-bold">Your Digital <span className="gradient-text">2nd Brain</span></h1>
          <p className="space-mono-regular">An intelligent AI companion that learns, adapts, and grows with you</p>
          <div className="brain-icon-container">
            <BrainIcon pulseEffect={true} color="var(--news-accent)" />
          </div>
          <Link to="/console" className="cta-button space-mono-bold">
            Start Exploring
            <span className="button-arrow">→</span>
          </Link>
        </motion.div>
      </div>
      
      <div className="features-section">
        <h2 className="space-mono-bold section-title">
          <span className="gradient-text">Features</span> that empower you
        </h2>
        
        <div className="feature-cards">
          <motion.div 
            className="feature-card"
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0px 10px 20px rgba(0,0,0,0.15)",
              background: "linear-gradient(225deg, var(--bg-secondary) 0%, var(--bg-accent) 100%)"
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon chat-icon"></div>
            <h3 className="space-mono-bold">Smart Conversations</h3>
            <p className="space-mono-regular">Engage with our advanced large language model for natural discussions.</p>
          </motion.div>
          
          <motion.div 
            className="feature-card"
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0px 10px 20px rgba(0,0,0,0.15)",
              background: "linear-gradient(225deg, var(--bg-secondary) 0%, var(--bg-accent) 100%)"
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon speed-icon"></div>
            <h3 className="space-mono-bold">Instant Responses</h3>
            <p className="space-mono-regular">Get real-time answers to your questions and prompts.</p>
          </motion.div>
          
          <motion.div 
            className="feature-card"
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0px 10px 20px rgba(0,0,0,0.15)",
              background: "linear-gradient(225deg, var(--bg-secondary) 0%, var(--bg-accent) 100%)"
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon personalize-icon"></div>
            <h3 className="space-mono-bold">Personalized Experience</h3>
            <p className="space-mono-regular">The more you chat, the better it understands your preferences.</p>
          </motion.div>
        </div>
      </div>
      
      <div className="experience-section">
        <h2 className="space-mono-bold section-title">Experience the <span className="gradient-text">Future</span></h2>
        <div className="experience-grid">
          <motion.div 
            className="experience-item"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="stat-circle">
              <span className="stat-number">24/7</span>
            </div>
            <p className="space-mono-regular">Always available to assist you</p>
          </motion.div>
          
          <motion.div 
            className="experience-item"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="stat-circle">
              <span className="stat-number">100%</span>
            </div>
            <p className="space-mono-regular">Personalized assistance</p>
          </motion.div>
          
          <motion.div 
            className="experience-item"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="stat-circle">
              <span className="stat-number">AI</span>
            </div>
            <p className="space-mono-regular">Powered by advanced models</p>
          </motion.div>
        </div>
      </div>
      
      <div className="cta-section">
        <div className="cta-content">
          <h2 className="space-mono-bold">Ready to enhance your digital experience?</h2>
          <p className="space-mono-regular">Start your journey with the 2nd Brain chat assistant today</p>
          <Link to="/console" className="cta-button large space-mono-bold">
            Get Started Now
            <span className="button-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;