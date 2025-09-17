import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { APP_CONFIG } from './constants';
import { storage } from './utils';
import movieService from './movieService';

// Initial state
const initialState = {
  // Search state
  searchTerm: '',
  results: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalResults: 0,
  hasMore: false,
  
  // Movie details
  selectedMovie: null,
  loadingDetails: false,
  detailsError: null,
  
  // Filters
  filters: {
    type: '',
    year: '',
    sortBy: 'relevance'
  },
  
  // User data
  favorites: storage.get(APP_CONFIG.STORAGE_KEYS.FAVORITES, []),
  searchHistory: storage.get(APP_CONFIG.STORAGE_KEYS.SEARCH_HISTORY, []),
  
  // UI state
  showFilters: false,
  theme: storage.get(APP_CONFIG.STORAGE_KEYS.THEME, 'dark')
};

// Action types
const ActionTypes = {
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_RESULTS: 'SET_RESULTS',
  APPEND_RESULTS: 'APPEND_RESULTS',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_SELECTED_MOVIE: 'SET_SELECTED_MOVIE',
  SET_LOADING_DETAILS: 'SET_LOADING_DETAILS',
  SET_DETAILS_ERROR: 'SET_DETAILS_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  TOGGLE_FILTERS: 'TOGGLE_FILTERS',
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  ADD_TO_SEARCH_HISTORY: 'ADD_TO_SEARCH_HISTORY',
  CLEAR_SEARCH_HISTORY: 'CLEAR_SEARCH_HISTORY',
  SET_THEME: 'SET_THEME',
  RESET_SEARCH: 'RESET_SEARCH'
};

// Reducer
function movieReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
      
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case ActionTypes.SET_RESULTS:
      return {
        ...state,
        results: action.payload.results,
        totalResults: action.payload.totalResults,
        currentPage: action.payload.currentPage,
        hasMore: action.payload.results.length < action.payload.totalResults,
        loading: false,
        error: null
      };
      
    case ActionTypes.APPEND_RESULTS:
      return {
        ...state,
        results: [...state.results, ...action.payload.results],
        currentPage: action.payload.currentPage,
        hasMore: state.results.length + action.payload.results.length < state.totalResults,
        loading: false
      };
      
    case ActionTypes.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
      
    case ActionTypes.SET_SELECTED_MOVIE:
      return { ...state, selectedMovie: action.payload };
      
    case ActionTypes.SET_LOADING_DETAILS:
      return { ...state, loadingDetails: action.payload };
      
    case ActionTypes.SET_DETAILS_ERROR:
      return { ...state, detailsError: action.payload, loadingDetails: false };
      
    case ActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
      
    case ActionTypes.TOGGLE_FILTERS:
      return { ...state, showFilters: !state.showFilters };
      
    case ActionTypes.ADD_TO_FAVORITES:
      const newFavorites = [...state.favorites, action.payload];
      storage.set(APP_CONFIG.STORAGE_KEYS.FAVORITES, newFavorites);
      return { ...state, favorites: newFavorites };
      
    case ActionTypes.REMOVE_FROM_FAVORITES:
      const filteredFavorites = state.favorites.filter(
        movie => movie.imdbID !== action.payload
      );
      storage.set(APP_CONFIG.STORAGE_KEYS.FAVORITES, filteredFavorites);
      return { ...state, favorites: filteredFavorites };
      
    case ActionTypes.ADD_TO_SEARCH_HISTORY:
      const newHistory = [
        action.payload,
        ...state.searchHistory.filter(term => term !== action.payload)
      ].slice(0, APP_CONFIG.MAX_SEARCH_HISTORY);
      storage.set(APP_CONFIG.STORAGE_KEYS.SEARCH_HISTORY, newHistory);
      return { ...state, searchHistory: newHistory };
      
    case ActionTypes.CLEAR_SEARCH_HISTORY:
      storage.remove(APP_CONFIG.STORAGE_KEYS.SEARCH_HISTORY);
      return { ...state, searchHistory: [] };
      
    case ActionTypes.SET_THEME:
      storage.set(APP_CONFIG.STORAGE_KEYS.THEME, action.payload);
      return { ...state, theme: action.payload };
      
    case ActionTypes.RESET_SEARCH:
      return {
        ...state,
        searchTerm: '',
        results: [],
        error: null,
        currentPage: 1,
        totalResults: 0,
        hasMore: false
      };
      
    default:
      return state;
  }
}

// Create contexts
const MovieStateContext = createContext();
const MovieDispatchContext = createContext();

// Provider component
export function MovieProvider({ children }) {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  return (
    <MovieStateContext.Provider value={state}>
      <MovieDispatchContext.Provider value={dispatch}>
        {children}
      </MovieDispatchContext.Provider>
    </MovieStateContext.Provider>
  );
}

// Custom hooks for using context
export function useMovieState() {
  const context = useContext(MovieStateContext);
  if (!context) {
    throw new Error('useMovieState must be used within MovieProvider');
  }
  return context;
}

export function useMovieDispatch() {
  const context = useContext(MovieDispatchContext);
  if (!context) {
    throw new Error('useMovieDispatch must be used within MovieProvider');
  }
  return context;
}

// Action creators
export const actions = {
  setSearchTerm: (term) => ({
    type: ActionTypes.SET_SEARCH_TERM,
    payload: term
  }),
  
  setLoading: (loading) => ({
    type: ActionTypes.SET_LOADING,
    payload: loading
  }),
  
  setError: (error) => ({
    type: ActionTypes.SET_ERROR,
    payload: error
  }),
  
  setResults: (results, totalResults, currentPage) => ({
    type: ActionTypes.SET_RESULTS,
    payload: { results, totalResults, currentPage }
  }),
  
  appendResults: (results, currentPage) => ({
    type: ActionTypes.APPEND_RESULTS,
    payload: { results, currentPage }
  }),
  
  setSelectedMovie: (movie) => ({
    type: ActionTypes.SET_SELECTED_MOVIE,
    payload: movie
  }),
  
  setLoadingDetails: (loading) => ({
    type: ActionTypes.SET_LOADING_DETAILS,
    payload: loading
  }),
  
  setDetailsError: (error) => ({
    type: ActionTypes.SET_DETAILS_ERROR,
    payload: error
  }),
  
  setFilters: (filters) => ({
    type: ActionTypes.SET_FILTERS,
    payload: filters
  }),
  
  toggleFilters: () => ({
    type: ActionTypes.TOGGLE_FILTERS
  }),
  
  addToFavorites: (movie) => ({
    type: ActionTypes.ADD_TO_FAVORITES,
    payload: movie
  }),
  
  removeFromFavorites: (imdbId) => ({
    type: ActionTypes.REMOVE_FROM_FAVORITES,
    payload: imdbId
  }),
  
  addToSearchHistory: (term) => ({
    type: ActionTypes.ADD_TO_SEARCH_HISTORY,
    payload: term
  }),
  
  clearSearchHistory: () => ({
    type: ActionTypes.CLEAR_SEARCH_HISTORY
  }),
  
  setTheme: (theme) => ({
    type: ActionTypes.SET_THEME,
    payload: theme
  }),
  
  resetSearch: () => ({
    type: ActionTypes.RESET_SEARCH
  })
};