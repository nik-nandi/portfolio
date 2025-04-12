import React, { useEffect, useRef } from 'react';
import katex from 'katex';

export const MathRenderer = ({ content, displayMode = false }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (containerRef.current && content) {
      try {
        katex.render(content, containerRef.current, {
          throwOnError: false,
          displayMode: displayMode,
          trust: true,
          strict: false,
          output: "html",
          macros: {
            "\\R": "\\mathbb{R}",
            "\\N": "\\mathbb{N}",
            "\\Z": "\\mathbb{Z}"
          }
        });
      } catch (err) {
        console.error('KaTeX rendering error:', err);
        containerRef.current.textContent = displayMode ? `$$${content}$$` : `$${content}$`;
      }
    }
  }, [content, displayMode]);

  return (
    <span 
      ref={containerRef} 
      className={displayMode ? "katex-block" : "katex-inline"}
    />
  );
};

export const parseAndRenderMath = (text) => {
  if (!text || typeof text !== 'string' || !text.includes('$')) {
    return text;
  }

  // Split text by math expressions
  const segments = [];
  let currentText = '';
  let inInlineMath = false;
  let inBlockMath = false;
  let mathContent = '';
  
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '$') {
      // Check for block math ($$)
      if (i + 1 < text.length && text[i + 1] === '$' && !inInlineMath && !inBlockMath) {
        // Starting block math
        if (currentText) {
          segments.push({ type: 'text', content: currentText });
          currentText = '';
        }
        inBlockMath = true;
        i++; // Skip next $
      } 
      // Check for end of block math
      else if (inBlockMath && i + 1 < text.length && text[i + 1] === '$') {
        segments.push({ type: 'block-math', content: mathContent });
        mathContent = '';
        inBlockMath = false;
        i++; // Skip next $
      } 
      // Check for inline math
      else if (!inBlockMath && !inInlineMath) {
        if (currentText) {
          segments.push({ type: 'text', content: currentText });
          currentText = '';
        }
        inInlineMath = true;
      } 
      // End of inline math
      else if (inInlineMath) {
        segments.push({ type: 'inline-math', content: mathContent });
        mathContent = '';
        inInlineMath = false;
      }
    } else {
      // Add character to current segment
      if (inInlineMath || inBlockMath) {
        mathContent += text[i];
      } else {
        currentText += text[i];
      }
    }
  }
  
  // Add any remaining text
  if (currentText) {
    segments.push({ type: 'text', content: currentText });
  }
  
  return segments;
};