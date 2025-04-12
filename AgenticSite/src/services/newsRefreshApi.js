import axios from 'axios';

/**
 * Refreshes the news data by calling the /news/refresh/ endpoint.
 * This function does not return any data.
 */
export const refreshNews = async () => {
  try {
    const apiUrl = 'http://localhost:8000/news/refresh/';
    await axios.get(apiUrl);
    console.log('News refresh triggered successfully.');
  } catch (error) {
    console.error('Error triggering news refresh:', error);
  }
};
