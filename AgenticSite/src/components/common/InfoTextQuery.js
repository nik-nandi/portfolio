import { useContext } from 'react';
import { InfoTextContext } from '../../contexts/InfoTextContext';

// Direct export of the function to display input text processing
export const displayQueryProcessing = (setTemporaryInfo, inputText) => {
  const message = `# Processing Query\n\n## Your Input:\n"${inputText.substring(0, 60)}${inputText.length > 60 ? '...' : ''}"\n\nAnalyzing and preparing response...`;
  setTemporaryInfo(message, 5000);
};

// React hook for components that don't have direct access to InfoTextContext
export const useInfoTextQuery = () => {
  const { setTemporaryInfo } = useContext(InfoTextContext);
  
  return {
    displayQueryProcessing: (inputText) => displayQueryProcessing(setTemporaryInfo, inputText)
  };
};

export default useInfoTextQuery;
