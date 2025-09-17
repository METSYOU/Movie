// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://www.omdbapi.com/',
  API_KEY: 'dfe6d885',
  POSTER_FALLBACK: '/api/placeholder/300/445'
};

// App Constants
export const APP_CONFIG = {
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  DEBOUNCE_DELAY: 300,
  RESULTS_PER_PAGE: 10,
  MAX_SEARCH_HISTORY: 10,
  STORAGE_KEYS: {
    SEARCH_HISTORY: 'movieSearchHistory',
    FAVORITES: 'movieFavorites',
    THEME: 'movieAppTheme'
  }
};

// Filter Options
export const FILTER_OPTIONS = {
  TYPES: [
    { value: '', label: 'All Types' },
    { value: 'movie', label: 'Movies' },
    { value: 'series', label: 'TV Series' },
  ],
  YEARS: Array.from({ length: new Date().getFullYear() - 1929 }, (_, i) => 
    new Date().getFullYear() - i
  ),
  SORT_OPTIONS: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'year_desc', label: 'Year (Newest)' },
    { value: 'year_asc', label: 'Year (Oldest)' },
    { value: 'title', label: 'Title (A-Z)' }
  ]
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  NO_RESULTS: 'No movies found. Try a different search term.',
  API_ERROR: 'Something went wrong. Please try again later.',
  LOADING_FAILED: 'Failed to load movie details.'
};