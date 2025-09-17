import { API_CONFIG } from './constants';

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Format movie data
export const formatMovieData = (movie) => {
  return {
    ...movie,
    Poster: movie.Poster === 'N/A' ? API_CONFIG.POSTER_FALLBACK : movie.Poster,
    Year: movie.Year === 'N/A' ? 'Unknown' : movie.Year,
    imdbRating: movie.imdbRating === 'N/A' ? 'Not rated' : movie.imdbRating,
    Plot: movie.Plot === 'N/A' ? 'No plot available.' : movie.Plot
  };
};

// Sort movies
export const sortMovies = (movies, sortBy) => {
  const moviesCopy = [...movies];
  
  switch (sortBy) {
    case 'year_desc':
      return moviesCopy.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    case 'year_asc':
      return moviesCopy.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    case 'title':
      return moviesCopy.sort((a, b) => a.Title.localeCompare(b.Title));
    default:
      return moviesCopy;
  }
};

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Generate cache key
export const generateCacheKey = (searchTerm, filters = {}) => {
  return `${searchTerm}-${JSON.stringify(filters)}`;
};

// Check if cache is valid
export const isCacheValid = (timestamp, duration) => {
  return Date.now() - timestamp < duration;
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Format runtime
export const formatRuntime = (runtime) => {
  if (!runtime || runtime === 'N/A') return 'Unknown';
  const minutes = parseInt(runtime);
  if (isNaN(minutes)) return runtime;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${remainingMinutes}min`;
};

// Validate search term
export const isValidSearchTerm = (term) => {
  return term && term.trim().length >= 2;
};

// Handle image load error
export const handleImageError = (event) => {
  event.target.src = API_CONFIG.POSTER_FALLBACK;
  event.target.onerror = null; // Prevent infinite loop
};