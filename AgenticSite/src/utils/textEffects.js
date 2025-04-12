/**
 * Splits a string into individual characters wrapped in spans with custom class
 * @param {string} text - The text to split into letters
 * @param {string} className - CSS class to apply to each letter's span
 * @param {number} baseDelay - Base delay between letters in seconds
 * @param {number} titleOffset - Additional delay offset for the entire title in seconds
 * @returns {Array} Array of React span elements
 */
export const splitTextIntoLetters = (text, className = 'glow-letter', baseDelay = 0.25, titleOffset = 0) => {
  // Increased default baseDelay from 0.15 to 0.25
  if (!text || typeof text !== 'string') return text;
  
  return text.split('').map((letter, index) => {
    // Use non-breaking space for actual spaces to maintain spacing
    const content = letter === ' ' ? '\u00A0' : letter;
    
    // Calculate sequential delay for each letter plus the title offset
    const delay = index * baseDelay + titleOffset;
    
    return (
      <span 
        key={index} 
        className={className}
        style={{ 
          animationDelay: `${delay}s`,
        }}
      >
        {content}
      </span>
    );
  });
};
