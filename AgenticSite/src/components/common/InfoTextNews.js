import React from 'react';
import { motion } from 'framer-motion';
import './InfoTextNews.css';

// Format news details with trust levels
export const formatNewsDetailsData = (data) => {
  if (!data || !data.articles || !Array.isArray(data.articles) || data.articles.length === 0) {
    return "# News Trust Analysis\n\nNo articles available at the moment.";
  }

  // Group articles by trust level
  const trustGroups = {
    HIGH: [],
    MEDIUM: [],
    LOW: [],
    UNKNOWN: []
  };

  data.articles.forEach(article => {
    const level = article.trustInfo?.level || 'UNKNOWN';
    if (trustGroups[level]) {
      trustGroups[level].push(article);
    }
  });

  // Format the output
  let output = "# News Trust Analysis\n\n";

  if (trustGroups.HIGH.length > 0) {
    output += "## HIGH Trust Sources\n";
    trustGroups.HIGH.forEach(article => {
      output += `- ${article.title}\n`;
    });
    output += "\n";
  }

  if (trustGroups.MEDIUM.length > 0) {
    output += "## MEDIUM Trust Sources\n";
    trustGroups.MEDIUM.forEach(article => {
      output += `- ${article.title}\n`;
    });
    output += "\n";
  }

  if (trustGroups.LOW.length > 0) {
    output += "## LOW Trust Sources\n";
    trustGroups.LOW.forEach(article => {
      output += `- ${article.title}\n`;
    });
    output += "\n";
  }

  if (trustGroups.UNKNOWN.length > 0) {
    output += "## Unknown Credibility\n";
    trustGroups.UNKNOWN.forEach(article => {
      output += `- ${article.title}\n`;
    });
  }

  return output;
};

const getHeadingProps = (line) => {
  // Default settings for h1 vs h2
  if (line.startsWith('# ')) {
    return {
      tag: 'h1',
      className: "info-text-title"
    };
  }
  // For h2 headings, add trust-level classes based on keywords
  let baseClass = "info-text-heading";
  if (line.includes("HIGH Trust")) {
    baseClass += " trust-level high-trust";
  } else if (line.includes("MEDIUM Trust")) {
    baseClass += " trust-level medium-trust";
  } else if (line.includes("LOW Trust")) {
    baseClass += " trust-level low-trust";
  } else if (line.includes("Unknown")) {
    baseClass += " trust-level unknown-trust";
  }
  return {
    tag: 'h2',
    className: baseClass
  };
};

const InfoTextNews = ({ newsContent }) => {
  // Parse news data to identify trust levels and format accordingly
  const renderNewsContent = (content) => {
    if (!content) return null;
    
    // Split text by new lines to process each line
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Render headings
      if (line.startsWith('# ') || line.startsWith('## ')) {
        const { tag, className } = getHeadingProps(line);
        const Tag = motion[tag];
        return (
          <Tag key={index}
            className={className}
            initial={{ opacity: 0, y: tag === 'h1' ? -10 : -5 }} // Reduced from -15/-8 to -10/-5
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }} // Reduced from 0.4
          >
            {line.substring(tag === 'h1' ? 2 : 3)}
            {tag === 'h1' && <div className="title-underline"></div>}
          </Tag>
        );
      } else if (line.trim() === '') {
        // Optional: You could remove this empty line rendering to save space
        // or replace it with a smaller spacer
        return <div key={index} style={{ height: '4px' }}></div>; // Smaller spacer instead of <br>
      } else if (line.startsWith('- ')) {
        // Format list items with enhanced animations and card-like styling
        return (
          <motion.div 
            key={index} 
            className="info-text-list-item-container"
            initial={{ opacity: 0, x: -5 }} // Reduced from -10
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }} // Adjusted for quicker animation
          >
            <motion.div 
              className="info-text-list-item"
              whileHover={{ 
                scale: 1.01, // Reduced from 1.02 for more subtle hover
                boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)" // Reduced shadow
              }}
            >
              <div className="article-content">
                {line.substring(2)}
              </div>
              <div className="article-indicator"></div>
            </motion.div>
          </motion.div>
        );
      } else {
        return (
          <motion.p 
            key={index} 
            className="info-text-paragraph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {line}
          </motion.p>
        );
      }
    });
  };

  // Animation variants - adjust for faster/smaller animations
  const contentVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.04, // Reduced from 0.06
        delayChildren: 0.03   // Reduced from 0.05
      } 
    }
  };

  const legendItemVariants = {
    initial: { opacity: 0, scale: 0.95 }, // Increased from 0.9 for less dramatic scaling
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 350, damping: 15 } // Adjusted for quicker animation
    }
  };

  return (
    <motion.div
      className="news-content"
      initial="initial"
      animate="animate"
      variants={contentVariants}
    >
      {renderNewsContent(newsContent)}
      
      <motion.div 
        className="news-footer"
        initial={{ opacity: 0, y: 5 }} // Reduced from y: 10
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }} // Reduced from 0.3
      >
        <div className="trust-legend">
          <motion.div 
            className="trust-legend-item high-legend"
            variants={legendItemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <span className="trust-dot high-trust"></span>
            <span className="trust-label">High Trust</span>
          </motion.div>
          
          <motion.div 
            className="trust-legend-item medium-legend"
            variants={legendItemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <span className="trust-dot medium-trust"></span>
            <span className="trust-label">Medium Trust</span>
          </motion.div>
          
          <motion.div 
            className="trust-legend-item low-legend"
            variants={legendItemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <span className="trust-dot low-trust"></span>
            <span className="trust-label">Low Trust</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InfoTextNews;
