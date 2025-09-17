import React from 'react';
import { Heart, Star, Calendar, Film, Trash2, X } from 'lucide-react';
import { useMovieState, useMovieDispatch, actions } from './MovieContext';
import { useMovieDetails, useFavorites } from './hooks';
import { handleImageError, truncateText } from './utils';

/**
 * Favorites.js - Favorites Display Component
 * 
 * This component displays the user's favorite movies and TV shows in a grid layout.
 * It provides functionality to view details, remove from favorites, and manage the favorites collection.
 * 
 * Features:
 * - Grid display of favorite movies/shows
 * - Remove individual favorites functionality
 * - Clear all favorites option
 * - Click to view detailed information
 * - Empty state when no favorites exist
 * - Responsive grid layout
 * - Movie poster with fallback handling
 * - Quick stats (rating, year, type)
 */
function Favorites({ onClose }) {
  const state = useMovieState();
  const dispatch = useMovieDispatch();
  const { getMovieDetails } = useMovieDetails();
  const { favorites, removeFromFavorites } = useFavorites();

  const handleMovieClick = (movie) => {
    getMovieDetails(movie.imdbID);
  };

  const handleRemoveFavorite = (e, movieId) => {
    e.stopPropagation();
    removeFromFavorites(movieId);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all favorites?')) {
      // Clear all favorites by removing each one
      favorites.forEach(movie => {
        removeFromFavorites(movie.imdbID);
      });
    }
  };

  return (
    <div className="favorites-overlay" onClick={onClose}>
      <div className="favorites-container" onClick={(e) => e.stopPropagation()}>
        <div className="favorites-header">
          <div className="favorites-title-section">
            <h2 className="favorites-title">
              <Heart className="heart-icon" size={24} />
              My Favorites
            </h2>
            <p className="favorites-subtitle">
              {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'} saved
            </p>
          </div>
          
          <div className="favorites-actions">
            {favorites.length > 0 && (
              <button
                type="button"
                className="clear-all-button"
                onClick={handleClearAll}
                title="Clear all favorites"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            )}
            <button
              type="button"
              className="close-favorites-button"
              onClick={onClose}
              title="Close favorites"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="favorites-content">
          {favorites.length === 0 ? (
            <div className="favorites-empty">
              <Heart size={64} className="empty-heart-icon" />
              <h3>No favorites yet</h3>
              <p>Start exploring movies and TV shows to build your collection!</p>
              <button
                type="button"
                className="start-exploring-button"
                onClick={onClose}
              >
                Start Exploring
              </button>
            </div>
          ) : (
            <div className="favorites-grid">
              {favorites.map((movie) => (
                <div
                  key={movie.imdbID}
                  className="favorite-card"
                  onClick={() => handleMovieClick(movie)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMovieClick(movie);
                    }
                  }}
                  aria-label={`View details for ${movie.Title}`}
                >
                  <div className="favorite-poster-container">
                    <img
                      src={movie.Poster}
                      alt={`${movie.Title} poster`}
                      className="favorite-poster"
                      onError={handleImageError}
                      loading="lazy"
                    />
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      className="remove-favorite-button"
                      onClick={(e) => handleRemoveFavorite(e, movie.imdbID)}
                      aria-label={`Remove ${movie.Title} from favorites`}
                      title="Remove from favorites"
                    >
                      <Heart fill="currentColor" size={16} />
                    </button>

                    {/* Type Badge */}
                    <div className="favorite-type-badge">
                      <Film size={12} />
                      <span>{movie.Type}</span>
                    </div>
                  </div>

                  <div className="favorite-content">
                    <h3 className="favorite-title">
                      {truncateText(movie.Title, 40)}
                    </h3>
                    
                    <div className="favorite-meta">
                      <div className="favorite-year">
                        <Calendar size={12} />
                        <span>{movie.Year}</span>
                      </div>
                      
                      {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                        <div className="favorite-rating">
                          <Star size={12} />
                          <span>{movie.imdbRating}</span>
                        </div>
                      )}
                    </div>

                    {/* Hover overlay */}
                    <div className="favorite-overlay">
                      <span className="view-details">View Details</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Favorites;