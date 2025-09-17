import { useState, useEffect, useCallback, useRef } from 'react';
import { useMovieState, useMovieDispatch, actions } from './MovieContext';
import { APP_CONFIG } from './constants';
import { sortMovies, isValidSearchTerm } from './utils';
import movieService from './movieService';

// Debounce hook
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Movie search hook
export function useMovieSearch() {
  const state = useMovieState();
  const dispatch = useMovieDispatch();
  
  const debouncedSearchTerm = useDebounce(
    state.searchTerm, 
    APP_CONFIG.DEBOUNCE_DELAY
  );

  // Search movies
  const searchMovies = useCallback(async (term, filters = {}, page = 1, append = false) => {
    if (!isValidSearchTerm(term)) {
      dispatch(actions.setError('Please enter at least 2 characters'));
      return;
    }

    try {
      dispatch(actions.setLoading(true));
      dispatch(actions.setError(null));

      const result = await movieService.searchMovies(term, filters, page);
      
      // Sort results if needed
      const sortedResults = sortMovies(result.movies, filters.sortBy || 'relevance');

      if (append) {
        dispatch(actions.appendResults(sortedResults, page));
      } else {
        dispatch(actions.setResults(sortedResults, result.totalResults, page));
        // Add to search history
        dispatch(actions.addToSearchHistory(term));
      }
    } catch (error) {
      dispatch(actions.setError(error.message));
    }
  }, [dispatch]);

  // Auto search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm && isValidSearchTerm(debouncedSearchTerm)) {
      searchMovies(debouncedSearchTerm, state.filters, 1, false);
    }
  }, [debouncedSearchTerm, state.filters, searchMovies]);

  // Load more results
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loading) {
      const nextPage = state.currentPage + 1;
      searchMovies(state.searchTerm, state.filters, nextPage, true);
    }
  }, [state.hasMore, state.loading, state.currentPage, state.searchTerm, state.filters, searchMovies]);

  // Manual search (for search button or enter key)
  const performSearch = useCallback((term) => {
    if (isValidSearchTerm(term)) {
      dispatch(actions.setSearchTerm(term));
      searchMovies(term, state.filters, 1, false);
    }
  }, [state.filters, searchMovies, dispatch]);

  return {
    searchMovies: performSearch,
    loadMore,
    state
  };
}

// Movie details hook
export function useMovieDetails() {
  const state = useMovieState();
  const dispatch = useMovieDispatch();

  const getMovieDetails = useCallback(async (imdbId) => {
    try {
      dispatch(actions.setLoadingDetails(true));
      dispatch(actions.setDetailsError(null));

      const movie = await movieService.getMovieDetails(imdbId);
      dispatch(actions.setSelectedMovie(movie));
    } catch (error) {
      dispatch(actions.setDetailsError(error.message));
    }
  }, [dispatch]);

  const closeDetails = useCallback(() => {
    dispatch(actions.setSelectedMovie(null));
    dispatch(actions.setDetailsError(null));
  }, [dispatch]);

  return {
    getMovieDetails,
    closeDetails,
    selectedMovie: state.selectedMovie,
    loadingDetails: state.loadingDetails,
    detailsError: state.detailsError
  };
}

// Favorites hook
export function useFavorites() {
  const state = useMovieState();
  const dispatch = useMovieDispatch();

  const addToFavorites = useCallback((movie) => {
    dispatch(actions.addToFavorites(movie));
  }, [dispatch]);

  const removeFromFavorites = useCallback((imdbId) => {
    dispatch(actions.removeFromFavorites(imdbId));
  }, [dispatch]);

  const isFavorite = useCallback((imdbId) => {
    return state.favorites.some(movie => movie.imdbID === imdbId);
  }, [state.favorites]);

  const toggleFavorite = useCallback((movie) => {
    if (isFavorite(movie.imdbID)) {
      removeFromFavorites(movie.imdbID);
    } else {
      addToFavorites(movie);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  return {
    favorites: state.favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite
  };
}

// Keyboard navigation hook
export function useKeyboardNavigation(items, onSelect) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const activeRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex(prev => 
            prev < items.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex(prev => 
            prev > 0 ? prev - 1 : items.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (activeIndex >= 0 && onSelect) {
            onSelect(items[activeIndex]);
          }
          break;
        case 'Escape':
          setActiveIndex(-1);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, activeIndex, onSelect]);

  // Scroll active item into view
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeIndex]);

  return { activeIndex, setActiveIndex, activeRef };
}

// Local storage hook
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return [ref, isIntersecting];
}

// Focus trap hook for modals
export function useFocusTrap(isActive) {
  const ref = useRef();

  useEffect(() => {
    if (!isActive) return;

    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return ref;
}