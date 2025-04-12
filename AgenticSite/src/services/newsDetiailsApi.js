import axios from 'axios';

// API endpoint for news details with trust level information
const NEWS_DETAILS_API_URL = 'http://localhost:8000/news_summary/';

// Trust level enum mapping for better visualization
const TRUST_LEVELS = {
  'LOW': { value: 'Low', color: '#ff6b6b' },
  'MEDIUM': { value: 'Medium', color: '#f9cb40' },
  'HIGH': { value: 'High', color: '#20bf6b' }
};

// Fallback dummy data in case the API fails
const DUMMY_NEWS_DETAILS_DATA = {
  articles: [
    {
      title: "AI Breakthrough: New Models Show Human-Level Reasoning",
      trust: "trust=<Trust.HIGH: 'High'>"
    },
    {
      title: "Global Climate Initiative Launches with 150 Countries",
      trust: "trust=<Trust.MEDIUM: 'Medium'>"
    },
    {
      title: "Study Questions Effectiveness of Popular Diet Trends",
      trust: "trust=<Trust.LOW: 'Low'>"
    },
    {
      title: "New Electric Vehicle Battery Technology Extends Range by 50%",
      trust: "trust=<Trust.HIGH: 'High'>"
    }
  ]
};

/**
 * Parses the trust string from the API into a standardized format
 * @param {string} trustString - Raw trust string from API (e.g. "trust=<Trust.MEDIUM: 'Medium'>")
 * @returns {Object} - Normalized trust information with level and color
 */
const parseTrustLevel = (trustString) => {
  try {
    // Extract the trust level from the string (LOW, MEDIUM, HIGH)
    const match = trustString.match(/Trust\.([A-Z]+)/);
    if (match && match[1]) {
      const level = match[1];
      return {
        level: level,
        value: TRUST_LEVELS[level]?.value || 'Unknown',
        color: TRUST_LEVELS[level]?.color || '#999999'
      };
    }
    return { level: 'UNKNOWN', value: 'Unknown', color: '#999999' };
  } catch (error) {
    console.error('Error parsing trust level:', error);
    return { level: 'UNKNOWN', value: 'Unknown', color: '#999999' };
  }
};

/**
 * Normalizes news details data structure to ensure it matches expected format
 * @param {Object} data - Raw news details data from API
 * @returns {Object} - Normalized news details data
 */
const normalizeNewsDetailsData = (data) => {
  // Check if data has articles property
  if (!data || !data.articles || !Array.isArray(data.articles)) {
    console.error('Invalid news details data structure:', data);
    return DUMMY_NEWS_DETAILS_DATA;
  }
  
  // Normalize each article
  const normalizedArticles = data.articles.map(article => ({
    title: article.title || 'Untitled Article',
    trust: article.trust || "trust=<Trust.UNKNOWN: 'Unknown'>",
    trustInfo: parseTrustLevel(article.trust || "")
  }));
  
  return { articles: normalizedArticles };
};

/**
 * Fetch news articles with trust information from the API
 * @param {number} limit - Maximum number of articles to fetch (optional)
 * @returns {Promise<Object>} - Object containing articles with trust levels
 */
export const fetchNewsDetailsArticles = async (limit = 20) => {
  try {
    const response = await axios.get(NEWS_DETAILS_API_URL);
    
    // Check if the response contains valid data
    if (response.data && response.data.articles) {
      const normalizedData = normalizeNewsDetailsData(response.data);
      
      // If limit is provided, limit the number of articles
      if (limit && normalizedData.articles.length > limit) {
        normalizedData.articles = normalizedData.articles.slice(0, limit);
      }
      
      return normalizedData;
    } else {
      console.warn('News Details API returned invalid data format, using fallback data');
      return normalizeNewsDetailsData(DUMMY_NEWS_DETAILS_DATA);
    }
  } catch (error) {
    console.error('Error fetching news details data:', error);
    
    // Log specific error details for debugging
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Return fallback dummy data
    return normalizeNewsDetailsData(DUMMY_NEWS_DETAILS_DATA);
  }
};

/**
 * Fetch news articles filtered by trust level
 * @param {string} trustLevel - Trust level to filter by (LOW, MEDIUM, HIGH)
 * @returns {Promise<Object>} - Object containing filtered articles
 */
export const fetchNewsByTrustLevel = async (trustLevel) => {
  try {
    // Get all articles and filter by trust level
    const response = await fetchNewsDetailsArticles();
    const filteredArticles = response.articles.filter(
      article => article.trustInfo.level === trustLevel
    );
    
    return { articles: filteredArticles };
  } catch (error) {
    console.error(`Error fetching ${trustLevel} trust level news:`, error);
    
    // Filter dummy data by trust level
    const filteredArticles = DUMMY_NEWS_DETAILS_DATA.articles.filter(
      article => parseTrustLevel(article.trust).level === trustLevel
    );
    return { articles: filteredArticles };
  }
};
