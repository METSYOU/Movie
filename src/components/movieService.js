import { API_CONFIG, ERROR_MESSAGES } from './constants';
import { formatMovieData } from './utils';

class MovieService {
  constructor() {
    this.cache = new Map();
  }

  // Build API URL
  buildUrl(endpoint, params = {}) {
    const url = new URL(API_CONFIG.BASE_URL);
    url.searchParams.append('apikey', API_CONFIG.API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
    
    return url.toString();
  }

  async apiCall(url, cacheKey = null) {
    try {
      if (cacheKey && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 300000) {
          return cached.data;
        }
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.Error) {
        throw new Error(data.Error);
      }

      if (cacheKey) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      
      if (error.message === 'Failed to fetch') {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      
      if (error.message === 'Movie not found!') {
        throw new Error(ERROR_MESSAGES.NO_RESULTS);
      }
      
      throw new Error(error.message || ERROR_MESSAGES.API_ERROR);
    }
  }

  // Search movies
  async searchMovies(searchTerm, filters = {}, page = 1) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }

    const params = {
      s: searchTerm.trim(),
      page: page.toString(),
      ...filters
    };

    const url = this.buildUrl('', params);
    const cacheKey = `search-${JSON.stringify(params)}`;
    
    const data = await this.apiCall(url, cacheKey);
    
    if (!data.Search || data.Search.length === 0) {
      return {
        movies: [],
        totalResults: 0,
        currentPage: page
      };
    }

    return {
      movies: data.Search.map(formatMovieData),
      totalResults: parseInt(data.totalResults) || 0,
      currentPage: page
    };
  }

  async getMovieDetails(imdbId) {
    if (!imdbId) {
      throw new Error('Movie ID is required');
    }

    const params = { i: imdbId, plot: 'full' };
    const url = this.buildUrl('', params);
    const cacheKey = `movie-${imdbId}`;
    
    const data = await this.apiCall(url, cacheKey);
    return formatMovieData(data);
  }

  // Get movie suggestions (similar movies by searching for keywords)
  async getMovieSuggestions(title, excludeId) {
    try {
      const keywords = title.split(' ').slice(0, 2).join(' ');
      const data = await this.searchMovies(keywords);
      
      return data.movies
        .filter(movie => movie.imdbID !== excludeId)
        .slice(0, 6);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export default new MovieService();