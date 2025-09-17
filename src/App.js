import React, { useEffect, useState } from 'react';
import { Moon, Sun, Heart, Settings } from 'lucide-react';
import { MovieProvider, useMovieState, useMovieDispatch, actions } from './components/MovieContext';
import ErrorBoundary from './components/ErrorBoundary';
import Search from './components/Search';
import Filters from './components/Filters';
import Results from './components/Results';
import Popup from './components/Popup';
import Favorites from './components/Favorites';
import { storage } from './components/utils';
import { APP_CONFIG } from './components/constants';

/**
 * App.js - Main Application Component
 * 
 * This is the root component that orchestrates the entire movie search application.
 * It manages global state, routing between different views, and provides the main layout structure.
 * 
 * Features:
 * - Application header with branding and navigation
 * - Theme switching (dark/light mode)
 * - Favorites counter and access
 * - Main content area with search and results
 * - Modal management for movie details and favorites
 * - Error boundary wrapping for crash protection
 * - Context provider setup for state management
 * - Responsive layout structure
 */

// Header Component
function Header() {
  const state = useMovieState();
  const dispatch = useMovieDispatch();
  const [showFavorites, setShowFavorites] = useState(false);

  const toggleTheme = () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    dispatch(actions.setTheme(newTheme));
  };

  const handleShowFavorites = () => {
    setShowFavorites(true);
  };

  const handleCloseFavorites = () => {
    setShowFavorites(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="app-title">
            MovieDB
            </h1>
            <p className="app-subtitle">Discover movies and TV shows</p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="header-button favorites-button"
              onClick={handleShowFavorites}
              aria-label={`View ${state.favorites.length} favorites`}
              title={`${state.favorites.length} favorites`}
            >
              <Heart size={20} fill={state.favorites.length > 0 ? 'currentColor' : 'none'} />
              {state.favorites.length > 0 && (
                <span className="favorites-count">{state.favorites.length}</span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              className="header-button theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {state.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Favorites Modal */}
      {showFavorites && (
        <Favorites onClose={handleCloseFavorites} />
      )}
    </>
  );
}

function AppContent() {
  const state = useMovieState();

  // Set initial theme class
  useEffect(() => {
    document.documentElement.className = `theme-${state.theme}`;
  }, [state.theme]);

  return (
    <div className="app">
      <Header />
      
      <main className="app-main">
        <div className="main-content">
          {/* Search Section */}
          <section className="search-section">
            <Search />
            <Filters />
          </section>

          {/* Results Section */}
          <section className="results-section">
            <Results />
          </section>
        </div>
      </main>

      {/* Movie Details Popup */}
      <Popup />

      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
    </div>
  );
}

// Root App Component with Provider
function App() {
  return (
    <ErrorBoundary>
      <MovieProvider>
        <AppContent />
      </MovieProvider>
    </ErrorBoundary>
  );
}

export default App;