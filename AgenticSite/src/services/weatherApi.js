import axios from 'axios';

// Using Open-Meteo API which doesn't require an API key
const BASE_URL = 'https://api.open-meteo.com/v1';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
// National Weather Service API for precipitation data
const NWS_API_URL = 'https://api.weather.gov';

// Mock data as fallback in case API fails
const MOCK_WEATHER_DATA = {
  location: "San Francisco",
  current: {
    temp: 68,
    condition: "Partly Cloudy",
    icon: "partly-cloudy",
    humidity: 62,
    wind: 8,
    feelsLike: 67,
    precipProb: 20 // Added precipitation probability instead of UV index
  },
  forecast: [
    { day: "Today", high: 70, low: 58, condition: "partly-cloudy" },
    { day: "Tomorrow", high: 72, low: 60, condition: "sunny" },
    { day: "Wed", high: 65, low: 55, condition: "rainy" },
  ]
};

/**
 * Maps weather code from Open-Meteo WMO codes to our app's condition types
 * @param {number} weatherCode - WMO weather code
 * @return {string} Mapped condition type for our app
 * @see https://open-meteo.com/en/docs
 */
const mapWeatherCondition = (weatherCode) => {
  // Map based on WMO Weather interpretation codes
  // Clear
  if ([0, 1].includes(weatherCode)) {
    return 'sunny';
  }
  // Partly cloudy
  else if ([2, 3].includes(weatherCode)) {
    return 'partly-cloudy';
  }
  // Fog
  else if ([45, 48].includes(weatherCode)) {
    return 'foggy';
  }
  // Drizzle, rain
  else if (weatherCode >= 51 && weatherCode <= 67) {
    return 'rainy';
  }
  // Snow
  else if (weatherCode >= 71 && weatherCode <= 86) {
    return 'snowy';
  }
  // Thunderstorm
  else if (weatherCode >= 95 && weatherCode <= 99) {
    return 'stormy';
  }
  
  // Default to cloudy for any other codes
  return 'cloudy';
};

/**
 * Get human-readable weather condition from WMO code
 * @param {number} weatherCode - WMO weather code
 * @return {string} Human-readable condition
 */
const getWeatherConditionText = (weatherCode) => {
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return conditions[weatherCode] || 'Unknown';
};

/**
 * Get day name from date string
 * @param {string} dateStr - Date string in ISO format
 * @return {string} Day name (e.g., "Mon", "Tue", etc.)
 */
const getDayName = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  
  // Check if date is today or tomorrow
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }
  
  // Otherwise return abbreviated day name
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Look up coordinates for a location name
 * @param {string} location - City or location name
 * @return {Promise<Object>} Coordinates and location name
 */
const getCoordinates = async (location) => {
  try {
    const response = await axios.get(GEO_URL, {
      params: {
        name: location,
        count: 1,
        language: 'en',
        format: 'json'
      }
    });
    
    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: result.name,
        country: result.country
      };
    }
    
    throw new Error('Location not found');
    
  } catch (error) {
    console.error('Geocoding error:', error);
    // Default to San Francisco coordinates
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      name: 'San Francisco',
      country: 'United States'
    };
  }
};

/**
 * Fetch precipitation data from National Weather Service API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @return {Promise<Object>} Precipitation data
 */
const fetchNWSPrecipitationData = async (latitude, longitude) => {
  try {
    // Step 1: Get the grid endpoint for the coordinates
    const pointsResponse = await axios.get(`${NWS_API_URL}/points/${latitude},${longitude}`);
    const { gridId, gridX, gridY } = pointsResponse.data.properties;
    
    // Step 2: Get the forecast using the grid information
    const forecastResponse = await axios.get(`${NWS_API_URL}/gridpoints/${gridId}/${gridX},${gridY}/forecast`);
    
    // Step 3: Extract precipitation data from the response
    const currentPeriod = forecastResponse.data.properties.periods[0];
    
    // Parse precipitation probability from forecast text
    let precipProbability = 0;
    
    // Try to extract percentage from forecast text using regex
    const precipMatch = currentPeriod.detailedForecast.match(/(\d+)\s*% chance of precipitation/i) || 
                       currentPeriod.detailedForecast.match(/precipitation is (\d+)%/i) ||
                       currentPeriod.detailedForecast.match(/chance of rain (\d+)%/i);
    
    if (precipMatch && precipMatch[1]) {
      precipProbability = parseInt(precipMatch[1], 10);
    } else if (currentPeriod.detailedForecast.toLowerCase().includes('rain') || 
              currentPeriod.detailedForecast.toLowerCase().includes('shower')) {
      precipProbability = 60; // Default value if rain is mentioned but no percentage
    }
    
    return {
      precipProb: precipProbability,
      forecastText: currentPeriod.detailedForecast
    };
  } catch (error) {
    console.error('Error fetching NWS precipitation data:', error);
    return {
      precipProb: 20, // Default value if API fails
      forecastText: 'Precipitation data unavailable'
    };
  }
};

/**
 * Fetch weather data for a location
 * @param {string|Object} location - City name or coordinates object {latitude, longitude}
 * @return {Promise<Object>} Weather data formatted for our UI
 */
export const fetchWeatherData = async (location = 'San Francisco') => {
  try {
    let coords;
    
    // Check if we're receiving coordinates directly
    if (typeof location === 'object' && location.latitude && location.longitude) {
      coords = {
        latitude: location.latitude,
        longitude: location.longitude,
        name: 'Current Location', // Default name for user's location
        country: ''
      };
    } else {
      // Get coordinates from location name
      coords = await getCoordinates(location);
    }
    
    // Fetch weather data using coordinates - now including hourly data
    const weatherResponse = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
        hourly: 'temperature_2m,precipitation_probability',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
        timezone: 'auto',
        forecast_days: 5,
        temperature_unit: 'fahrenheit',
        wind_speed_unit: 'mph'
      }
    });
    
    // Fetch precipitation data from NWS API
    const precipData = await fetchNWSPrecipitationData(coords.latitude, coords.longitude);
    
    const data = weatherResponse.data;
    
    // Process current weather
    const current = {
      temp: Math.round(data.current.temperature_2m),
      condition: getWeatherConditionText(data.current.weather_code),
      icon: mapWeatherCondition(data.current.weather_code),
      humidity: data.current.relative_humidity_2m,
      wind: Math.round(data.current.wind_speed_10m),
      feelsLike: Math.round(data.current.apparent_temperature),
      // Use precipitation data from NWS API
      precipProb: precipData.precipProb,
      forecastText: precipData.forecastText
    };
    
    // Process forecast data
    const forecast = data.daily.time.map((date, index) => ({
      day: getDayName(date),
      high: Math.round(data.daily.temperature_2m_max[index]),
      low: Math.round(data.daily.temperature_2m_min[index]),
      condition: mapWeatherCondition(data.daily.weather_code[index])
    }));
    
    // Process hourly forecast data for all 5 days, grouped by day
    const hourlyForecast = [];
    const dayCount = 5;
    const hoursPerDay = 24;

    for (let day = 0; day < dayCount; day++) {
      const startIndex = day * hoursPerDay;
      const endIndex = startIndex + hoursPerDay;
      
      const dayData = data.hourly.time.slice(startIndex, endIndex).map((time, index) => ({
        time,
        temperature: data.hourly.temperature_2m[startIndex + index],
        precipitationChance: data.hourly.precipitation_probability[startIndex + index] || 0,
        dayIndex: day
      }));
      
      const dayDate = new Date(data.hourly.time[startIndex]);
      const formattedDate = dayDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric'
      });
      
      hourlyForecast.push({
        date: formattedDate,
        dayIndex: day,
        hourlyData: dayData
      });
    }

    // Get location name for coordinates if we're using user's location
    let locationDisplay = `${coords.name}`;
    if (coords.country) {
      locationDisplay += `, ${coords.country}`;
    }
    
    // Return formatted data
    return {
      location: locationDisplay,
      current,
      forecast,
      hourlyForecast
    };
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return mock data on error
    return MOCK_WEATHER_DATA;
  }
};
