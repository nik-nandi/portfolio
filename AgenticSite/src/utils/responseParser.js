/**
 * Parse AI message to identify sections
 * @param {string} text - The response text to parse
 * @returns {Object} - Parsed structure or plain text
 */
export const parseAIResponse = (text) => {
    // Check if response appears to have any structure
    const hasExplicitStructure = text.includes('## ') || text.includes('# ');
    const hasBoldHeaders = text.includes('**') && (text.includes(':**') || text.includes(':**\n'));
    const hasNumberedList = /\n\s*\d+\.\s/.test(text);
    const hasMathContent = text.includes('$');
    
    // If no structure detected at all, return as plain text
    if (!hasExplicitStructure && !hasBoldHeaders && !hasNumberedList && !hasMathContent) {
      return { isStructured: false, content: text };
    }
  
    // Split by major section headers
    const sections = [];
    const lines = text.split('\n');
    let currentSection = { title: '', content: [], type: 'text' };
    let inCodeBlock = false;
    let previousLineEmpty = false;
  
    lines.forEach((line, index) => {
      // Detect markdown headers
      if (line.startsWith('# ') && !inCodeBlock) {
        // If we have content in the current section, save it
        if (currentSection.content.length > 0) {
          sections.push({...currentSection});
        }
        // Start a new section
        currentSection = {
          title: line.substring(2).trim(),
          content: [],
          type: 'major-section'
        };
      } 
      // Detect markdown subheaders
      else if (line.startsWith('## ') && !inCodeBlock) {
        // If we have content in the current section, save it
        if (currentSection.content.length > 0) {
          sections.push({...currentSection});
        }
        // Start a new subsection
        currentSection = {
          title: line.substring(3).trim(),
          content: [],
          type: 'sub-section'
        };
      }
      // Detect bold text that acts as headers (e.g., **Statement:**)
      else if (!inCodeBlock && line.includes('**') && line.includes(':**')) {
        // Extract the bold header
        const boldHeader = line.match(/\*\*(.*?):\*\*/);
        if (boldHeader && boldHeader[1]) {
          // If we have content in the current section, save it
          if (currentSection.content.length > 0) {
            sections.push({...currentSection});
          }
          
          // Start a new section with the bold header as title
          currentSection = {
            title: boldHeader[1],
            content: [line.replace(/\*\*(.*?):\*\*/, '')], // Keep remaining content
            type: 'sub-section'
          };
        } else {
          // Just a bold text, not a header
          currentSection.content.push(line);
        }
      }
      // Detect code blocks
      else if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        currentSection.content.push(line);
        if (inCodeBlock) {
          currentSection.type = 'code';
        }
      }
      // Detect potential paragraph breaks or logical sections
      else if (line.trim() === '' && !inCodeBlock) {
        previousLineEmpty = true;
        currentSection.content.push(line);
      }
      // Detect start of numbered list as potential new section
      else if (previousLineEmpty && /^\s*\d+\.\s/.test(line) && !inCodeBlock && 
               (currentSection.content.length > 3) && !currentSection.title.includes("Statement")) {
        // Don't split numbered lists that follow directly after a statement header
        if (currentSection.content.length > 0) {
          sections.push({...currentSection});
        }
        
        // New list section
        currentSection = {
          title: "Key Points",
          content: [line],
          type: 'list-section'
        };
        previousLineEmpty = false;
      }
      // Check for topic sentence that might indicate a new section
      else if (previousLineEmpty && line.trim().length > 0 && 
               !line.startsWith(' ') && !inCodeBlock && 
               index > 5 && currentSection.content.length > 5) {
        
        // Only create a new section for what seems like a significant topic shift
        // with a substantive sentence that's not indented or continuing a list
        const wordsInLine = line.split(' ').length;
        if (wordsInLine > 6 && !line.match(/^[a-z]/)) {
          // Try to extract a title from the first few words
          const possibleTitle = line.split('.')[0];
          if (possibleTitle && possibleTitle.length > 15 && possibleTitle.length < 60) {
            if (currentSection.content.length > 0) {
              sections.push({...currentSection});
            }
            
            currentSection = {
              title: possibleTitle.endsWith('.') ? 
                     possibleTitle.substring(0, possibleTitle.length - 1) : 
                     possibleTitle,
              content: [line],
              type: 'paragraph-section'
            };
          } else {
            currentSection.content.push(line);
          }
        } else {
          currentSection.content.push(line);
        }
        previousLineEmpty = false;
      }
      // Add line to current section
      else {
        currentSection.content.push(line);
        previousLineEmpty = line.trim() === '';
      }
    });
  
    // Add the last section if it has content
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
  
    // Check for math content in each section
    sections.forEach(section => {
      if (section.content.join('\n').includes('$')) {
        section.hasMath = true;
      }
    });
  
    // If we only found one section and it has no title, check if we should create a title
    if (sections.length === 1 && !sections[0].title) {
      const firstFewLines = sections[0].content.slice(0, 3).join(" ");
      const potentialTitle = firstFewLines.split('.')[0];
      
      if (potentialTitle && potentialTitle.length > 10 && potentialTitle.length < 80) {
        sections[0].title = potentialTitle;
      }
    }
  
    return { isStructured: sections.length > 0, sections };
  };
  
  /**
   * Process both bold and italic markdown syntax in text
   * @param {string} text - Text to process
   * @returns {Array} - Array of text segments with formatting information
   */
  export const renderTextWithBoldMarkdown = (text) => {
    if (!text) return text;
    
    // Check if there are any formatting markers
    if (!text.includes('**') && !text.includes('*')) return text;
    
    // Split by bold markers and italic markers and process
    const parts = [];
    let lastIndex = 0;
    let inBold = false;
    let inItalic = false;
    
    for (let i = 0; i < text.length; i++) {
      // Check for bold markers (double asterisk)
      if (i < text.length - 1 && text[i] === '*' && text[i + 1] === '*') {
        // Add text up to this point
        if (i > lastIndex) {
          parts.push({
            text: text.substring(lastIndex, i),
            bold: inBold,
            italic: inItalic
          });
        }
        
        // Skip both asterisks
        i++;
        lastIndex = i + 1;
        inBold = !inBold;
        continue;
      }
      
      // Check for italic markers (single asterisk) but only if not part of a bold marker
      if (text[i] === '*' && (i === 0 || text[i-1] !== '*') && (i === text.length - 1 || text[i+1] !== '*')) {
        // Add text up to this point
        if (i > lastIndex) {
          parts.push({
            text: text.substring(lastIndex, i),
            bold: inBold,
            italic: inItalic
          });
        }
        
        // Skip the single asterisk
        lastIndex = i + 1;
        inItalic = !inItalic;
      }
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        bold: inBold,
        italic: inItalic
      });
    }
    
    return parts;
  };