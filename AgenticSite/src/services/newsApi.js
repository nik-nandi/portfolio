import axios from 'axios';

// API endpoint for news
const NEWS_API_URL = 'http://localhost:8000/news/';

// Fallback dummy data in case the API fails
const DUMMY_NEWS_DATA = {
  articles: [
    {
      title: "AI Breakthrough: New Models Show Human-Level Reasoning",
      description: "Researchers have developed neural networks that demonstrate unprecedented reasoning capabilities, bringing us closer to artificial general intelligence.",
      url: "https://example.com/ai-breakthrough",
      image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
      published_date: new Date().toISOString()
    },
    {
      title: "Global Climate Initiative Launches with 150 Countries",
      description: "A new international climate agreement has been signed, with ambitious targets to reduce carbon emissions by 50% before 2030.",
      url: "https://example.com/climate-initiative",
      image_url: "https://images.unsplash.com/photo-1610552050890-fe99536c2615",
      published_date: new Date(Date.now() - 86400000).toISOString() // yesterday
    },
    {
      title: "Tech Giants Announce Collaboration on Quantum Computing Standards",
      description: "Major technology companies have formed a consortium to establish industry standards for quantum computing technologies.",
      url: "https://example.com/quantum-standards",
      image_url: "https://images.unsplash.com/photo-1635002973099-cc646fe26bf7",
      published_date: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      title: "New Study Links Exercise to Improved Cognitive Function",
      description: "Research shows that regular physical exercise can significantly enhance memory and problem-solving abilities across all age groups.",
      url: "https://example.com/exercise-cognition",
      image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
      published_date: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    },
    {
      title: "Renewable Energy Surpasses Fossil Fuels in Global Production",
      description: "For the first time in history, renewable energy sources have generated more electricity worldwide than fossil fuels.",
      url: "https://example.com/renewable-milestone",
      image_url: "https://images.unsplash.com/photo-1509390144018-794d9d179aae",
      published_date: new Date(Date.now() - 345600000).toISOString() // 4 days ago
    },
    {
      title: "Advances in Gene Editing Promise New Treatments for Genetic Disorders",
      description: "Latest CRISPR techniques show promising results in clinical trials for treating previously incurable genetic conditions.",
      url: "https://example.com/gene-editing-advances",
      image_url: "https://images.unsplash.com/photo-1659535857224-799523661cbd",
      published_date: new Date(Date.now() - 432000000).toISOString() // 5 days ago
    },
    {
      title: "Space Tourism Set to Begin Commercial Flights Next Year",
      description: "Private aerospace companies announce regular orbital tourism flights will commence in the coming year with tickets already sold out.",
      url: "https://example.com/space-tourism",
      image_url: "https://images.unsplash.com/photo-1517976547714-720226b864c1",
      published_date: new Date(Date.now() - 518400000).toISOString() // 6 days ago
    },
    {
      title: "Global Internet Coverage Reaches 95% Through Satellite Networks",
      description: "New satellite constellations have expanded internet access to remote regions previously without connectivity.",
      url: "https://example.com/global-internet",
      image_url: "https://images.unsplash.com/photo-1614064642761-d8f8723a683c",
      published_date: new Date(Date.now() - 604800000).toISOString() // 7 days ago
    },
    {
      title: "Breakthrough in Sustainable Materials Could Revolutionize Manufacturing",
      description: "Scientists develop biodegradable polymer with strength comparable to steel that could replace plastics in many applications.",
      url: "https://example.com/sustainable-materials",
      image_url: "https://images.unsplash.com/photo-1530979485308-55a20bec0182",
      published_date: new Date(Date.now() - 691200000).toISOString() // 8 days ago
    }
  ]
};

/**
 * Normalizes news data structure to ensure it matches expected format
 * @param {Object} data - Raw news data from API
 * @returns {Object} - Normalized news data
 */
const normalizeNewsData = (data) => {
  // Check if data has articles property
  if (!data || !data.articles || !Array.isArray(data.articles)) {
    console.error('Invalid news data structure:', data);
    return DUMMY_NEWS_DATA;
  }
  
  // Normalize each article
  const normalizedArticles = data.articles.map(article => ({
    title: article.title || 'Untitled Article',
    description: article.description || 'No description available',
    url: article.url || '#',
    image_url: article.image_url || null,
    published_date: article.published_date || new Date().toISOString()
  }));
  
  return { articles: normalizedArticles };
};

/**
 * Fetch news articles from the API
 * @param {number} limit - Maximum number of articles to fetch (optional)
 * @returns {Promise<Object>} - Object containing articles
 */
export const fetchNewsArticles = async (limit = 10) => {
  try {
    const response = await axios.get(NEWS_API_URL);
    
    // Check if the response contains valid data
    if (response.data && response.data.articles) {
      const normalizedData = normalizeNewsData(response.data);
      
      // If limit is provided, limit the number of articles
      if (limit && normalizedData.articles.length > limit) {
        normalizedData.articles = normalizedData.articles.slice(0, limit);
      }
      
      return normalizedData;
    } else {
      console.warn('News API returned invalid data format, using fallback data');
      return DUMMY_NEWS_DATA;
    }
  } catch (error) {
    console.error('Error fetching news data:', error);
    
    // Log specific error details for debugging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    // Return fallback dummy data
    return DUMMY_NEWS_DATA;
  }
};

/**
 * Fetch news articles filtered by category
 * @param {string} category - Category to filter by
 * @returns {Promise<Object>} - Object containing filtered articles
 */
export const fetchNewsByCategory = async (category) => {
  try {
    // Add category as query parameter
    const response = await axios.get(`${NEWS_API_URL}?category=${category}`);
    return normalizeNewsData(response.data);
  } catch (error) {
    console.error(`Error fetching ${category} news:`, error);
    
    // Filter dummy data by category (simulating category filtering)
    // In a real implementation, this would be more sophisticated
    const filteredArticles = DUMMY_NEWS_DATA.articles.slice(0, 4);
    return { articles: filteredArticles };
  }
};
