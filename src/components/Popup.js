import React, { useEffect, useState } from 'react';
import {
  X, Star, Calendar, Clock, Globe, Award, Users, Film,
  Heart, Share2, ExternalLink, Play, Loader2, AlertCircle
} from 'lucide-react';
import { useMovieDetails, useFavorites } from './hooks';
import { useFocusTrap } from './hooks';
import { formatRuntime, handleImageError } from './utils';

/**
 * Popup.js - Movie Details Modal Component
 * 
 * This component displays a detailed modal popup for individual movies/TV shows.
 * It shows comprehensive information including plot, cast, ratings, and production details.
 * 
 * Features:
 * - Full movie/TV show details with poster
 * - Ratings from multiple sources (IMDb, Rotten Tomatoes, etc.)
 * - Cast, crew, and production information
 * - Favorites toggle functionality
 * - Share functionality
 * - External links to IMDb
 * - Responsive design with mobile support
 * - Keyboard navigation and accessibility
 * - Focus trap for modal behavior
 * - Loading and error states
 */
function Popup() {
  const { selectedMovie, loadingDetails, detailsError, closeDetails } = useMovieDetails();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageLoaded, setImageLoaded] = useState(false);
  const focusTrapRef = useFocusTrap(!!selectedMovie);

  useEffect(() => {
    if (selectedMovie) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [selectedMovie]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeDetails();
      }
    };

    if (selectedMovie) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [selectedMovie, closeDetails]);

  // Reset image loaded state when movie changes
  useEffect(() => {
    if (selectedMovie) {
      setImageLoaded(false);
    }
  }, [selectedMovie]);

  if (!selectedMovie) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeDetails();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedMovie.Title,
          text: `Check out ${selectedMovie.Title} (${selectedMovie.Year})`,
          url: `https://www.imdb.com/title/${selectedMovie.imdbID}/`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `Check out ${selectedMovie.Title} (${selectedMovie.Year}): https://www.imdb.com/title/${selectedMovie.imdbID}/`
        );
        // You could add a toast notification here
      } catch (error) {
        console.log('Failed to copy to clipboard:', error);
      }
    }
  };

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(selectedMovie);
  };

  const isMovieFavorite = isFavorite(selectedMovie.imdbID);

  return (
    <div className="popup-overlay" onClick={handleBackdropClick}>
      <div className="popup-container" ref={focusTrapRef}>
        {/* Loading State */}
        {loadingDetails && (
          <div className="popup-loading">
            <Loader2 size={48} className="loading-spinner" />
            <span>Loading movie details...</span>
          </div>
        )}

        {/* Error State */}
        {detailsError && (
          <div className="popup-error">
            <AlertCircle size={48} className="error-icon" />
            <h3>Failed to load details</h3>
            <p>{detailsError}</p>
            <button onClick={closeDetails} className="close-button">
              Close
            </button>
          </div>
        )}

        {/* Movie Details */}
        {!loadingDetails && !detailsError && (
          <>
            {/* Header with close button */}
            <div className="popup-header">
              <div className="popup-actions">
                <button
                  type="button"
                  className={`favorite-button ${isMovieFavorite ? 'active' : ''}`}
                  onClick={handleFavoriteToggle}
                  aria-label={isMovieFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  title={isMovieFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart 
                    size={20}
                    fill={isMovieFavorite ? 'currentColor' : 'none'}
                  />
                </button>
                
                <button
                  type="button"
                  className="share-button"
                  onClick={handleShare}
                  aria-label="Share movie"
                  title="Share movie"
                >
                  <Share2 size={20} />
                </button>
              </div>
              
              <button
                type="button"
                className="close-button"
                onClick={closeDetails}
                aria-label="Close movie details"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="popup-content">
              {/* Hero Section */}
              <div className="popup-hero">
                <div className="poster-container">
                  {!imageLoaded && (
                    <div className="poster-skeleton">
                      <div className="skeleton-animation"></div>
                    </div>
                  )}
                  <img
                    src={selectedMovie.Poster}
                    alt={`${selectedMovie.Title} poster`}
                    className={`popup-poster ${imageLoaded ? 'loaded' : ''}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={handleImageError}
                  />
                </div>

                <div className="movie-info">
                  <div className="movie-header">
                    <h1 className="movie-title">{selectedMovie.Title}</h1>
                    <div className="movie-meta">
                      <span className="year">
                        <Calendar size={16} />
                        {selectedMovie.Year}
                      </span>
                      {selectedMovie.Runtime && selectedMovie.Runtime !== 'N/A' && (
                        <span className="runtime">
                          <Clock size={16} />
                          {formatRuntime(selectedMovie.Runtime)}
                        </span>
                      )}
                      {selectedMovie.Rated && selectedMovie.Rated !== 'N/A' && (
                        <span className="rating-badge">{selectedMovie.Rated}</span>
                      )}
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="ratings-container">
                    {selectedMovie.imdbRating && selectedMovie.imdbRating !== 'N/A' && (
                      <div className="rating-item">
                        <Star fill="currentColor" size={16} />
                        <span className="rating-value">{selectedMovie.imdbRating}</span>
                        <span className="rating-source">IMDb</span>
                      </div>
                    )}
                    {selectedMovie.Ratings && selectedMovie.Ratings.map((rating, index) => (
                      <div key={index} className="rating-item">
                        <Award size={16} />
                        <span className="rating-value">{rating.Value}</span>
                        <span className="rating-source">{rating.Source}</span>
                      </div>
                    ))}
                  </div>

                  {/* Genres */}
                  {selectedMovie.Genre && selectedMovie.Genre !== 'N/A' && (
                    <div className="genres">
                      {selectedMovie.Genre.split(', ').map((genre, index) => (
                        <span key={index} className="genre-tag">
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="quick-actions">
                    <a
                      href={`https://www.imdb.com/title/${selectedMovie.imdbID}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-button primary"
                    >
                      <ExternalLink size={16} />
                      View on IMDb
                    </a>
                    {selectedMovie.Type === 'movie' && (
                      <button className="action-button secondary">
                        <Play size={16} />
                        Watch Trailer
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Plot */}
              {selectedMovie.Plot && selectedMovie.Plot !== 'N/A' && (
                <div className="plot-section">
                  <h2>Plot</h2>
                  <p className="plot-text">{selectedMovie.Plot}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="details-grid">
                <div className="details-column">
                  <h3>Cast & Crew</h3>
                  
                  {selectedMovie.Director && selectedMovie.Director !== 'N/A' && (
                    <div className="detail-item">
                      <span className="detail-label">Director:</span>
                      <span className="detail-value">{selectedMovie.Director}</span>
                    </div>
                  )}
                  
                  {selectedMovie.Writer && selectedMovie.Writer !== 'N/A' && (
                    <div className="detail-item">
                      <span className="detail-label">Writer:</span>
                      <span className="detail-value">{selectedMovie.Writer}</span>
                    </div>
                  )}
                  
                  {selectedMovie.Actors && selectedMovie.Actors !== 'N/A' && (
                    <div className="detail-item">
                      <span className="detail-label">
                        <Users size={16} />
                        Cast:
                      </span>
                      <span className="detail-value">{selectedMovie.Actors}</span>
                    </div>
                  )}
                </div>

                <div className="details-column">
                  <h3>Production</h3>
                  
                  {selectedMovie.Country && selectedMovie.Country !== 'N/A' && (
                    <div className="detail-item">
                      <span className="detail-label">
                        <Globe size={16} />
                        Country:
                      </span>
                      <span className="detail-value">{selectedMovie.Country}</span>
                    </div>
                  )}
                  
                  {selectedMovie.Language && selectedMovie.Language !== 'N/A' && (
                    <div className="detail-item">
                      <span className="detail-label">Language:</span>
                      <span className="detail-value">{selectedMovie.Language}</span>
                    </div>
                  )}
                  
                  {selectedMovie.Production && selectedMovie.Production !== 'N/A' && (
                    <div className="detail-item">
                      <span className="detail-label">Production:</span>
                      <span className="detail-value">{selectedMovie.Production}</span>
                    </div>
                  )}
                  
                  {selectedMovie.Released && selectedMovie.Released !== 'N/A' && (
                    <div className="detail-item">
                      <span className="detail-label">Released:</span>
                      <span className="detail-value">{selectedMovie.Released}</span>
                    </div>
                  )}
                </div>

                <div className="details-column">
                  <h3>Technical</h3>
                  
                  {selectedMovie.Type && (
                    <div className="detail-item">
                      <span className="detail-label">
                        <Film size={16} />
                        Type:
                      </span>
                      <span className="detail-value capitalize">{selectedMovie.Type}</span>
                    </div>
                  )}
                  
                  {selectedMovie.BoxOffice && selectedMovie.BoxOffice !== 'N/A' && (
                    <div className="detail-item">
                      <span className="detail-label">Box Office:</span>
                      <span className="detail-value">{selectedMovie.BoxOffice}</span>
                    </div>
                  )}
                  
                  {selectedMovie.Awards && selectedMovie.Awards !== 'N/A' && (
                    <div className="detail-item">
                      <span className="detail-label">
                        <Award size={16} />
                        Awards:
                      </span>
                      <span className="detail-value">{selectedMovie.Awards}</span>
                    </div>
                  )}
                  
                  {selectedMovie.DVD && selectedMovie.DVD !== 'N/A' && (
                    <div className="detail-item">
                      <span className="detail-label">DVD Release:</span>
                      <span className="detail-value">{selectedMovie.DVD}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info for TV Series */}
              {selectedMovie.Type === 'series' && (
                <div className="series-info">
                  <h3>Series Information</h3>
                  <div className="series-details">
                    {selectedMovie.totalSeasons && selectedMovie.totalSeasons !== 'N/A' && (
                      <div className="series-stat">
                        <span className="stat-value">{selectedMovie.totalSeasons}</span>
                        <span className="stat-label">Seasons</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Popup;