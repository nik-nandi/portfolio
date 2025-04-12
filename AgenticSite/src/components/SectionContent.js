import React from 'react';
import { MathRenderer, parseAndRenderMath } from './MathRenderer';
import { renderTextWithBoldMarkdown } from '../utils/responseParser';

const SectionContent = ({ content }) => {
  const contentText = content.join('\n');
  
  // Render text with bold and italic markdown formatting
  const renderFormattedText = (parts) => {
    if (!Array.isArray(parts)) return parts;
    
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
  
  // Check if content contains mathematical notation
  if (contentText.includes('$')) {
    const segments = parseAndRenderMath(contentText);
    
    if (Array.isArray(segments)) {
      return (
        <div className="section-content math-enabled">
          {segments.map((segment, idx) => {
            if (segment.type === 'text') {
              // Process bold and italic markdown in text segments
              return <span key={idx}>{renderFormattedText(renderTextWithBoldMarkdown(segment.content))}</span>;
            } else if (segment.type === 'inline-math') {
              return <MathRenderer key={idx} content={segment.content} displayMode={false} />;
            } else if (segment.type === 'block-math') {
              return <MathRenderer key={idx} content={segment.content} displayMode={true} />;
            }
            return null;
          })}
        </div>
      );
    }
  }
  
  // Regular content without math
  return (
    <div className="section-content">
      {content.map((line, idx) => (
        <p key={idx}>{renderFormattedText(renderTextWithBoldMarkdown(line))}</p>
      ))}
    </div>
  );
};

export default SectionContent;