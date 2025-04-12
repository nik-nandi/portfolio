import axios from 'axios';

/**
 * Call the chat API with a message
 * @param {string} message - The user's message
 * @param {string} conversationId - The conversation identifier
 * @returns {Promise<object>} - The API response including text and model info
 */
export const callChatAPI = async (message, conversationId) => {
  try {
    // Define the API URL
    const apiUrl = 'http://localhost:8000/chat/';
    
    // Prepare the request data
    const requestData = {
      message: message,
      conversation_id: conversationId,
    };
    
    console.log('Sending request to API:', requestData);
    
    // Make the API call
    const response = await axios.post(apiUrl, requestData);
    
    console.log('API response:', response.data);
    
    // Return both response text and model information
    return {
      text: response.data.response || response.data.message || JSON.stringify(response.data),
      model: response.data.model || "Unknown model"
    };
  } catch (err) {
    console.error('API call failed:', err);
    throw err; // Rethrow to handle in the component
  }
};
