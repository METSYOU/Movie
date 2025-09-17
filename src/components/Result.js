import React, { useState } from 'react';
import { Heart, Star, Calendar, Film } from 'lucide-react';
import { useMovieDetails, useFavorites } from './hooks';
import { useIntersectionObserver } from './hooks';
import { handleImageError, truncateText } from './utils';

function Result({ result, index }) {
  const { getMovieDetails } = useMovieDetails();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Lazy loading
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  const handleClick = () => {
    getMovieDetails(result.imdbID);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(result);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageErrorEvent = (e) => {
    setImageError(true);
    handleImageError(e);
  };

  const isMovieFavorite = isFavorite(result.imdbID);

  return (
    <div 
      ref={ref}
      className={`result-card ${imageLoaded ? 'loaded' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`View details for ${result.Title}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="result-poster-container">
        {isIntersecting && (
          <>
            {!imageLoaded && !imageError && (
              <div className="poster-skeleton">
                <div className="skeleton-animation"></div>
              </div>
            )}
            <img
              src={result.Poster}
              alt={`${result.Title} poster`}
              className={`result-poster ${imageLoaded ? 'loaded' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageErrorEvent}
              loading="lazy"
            />
          </>
        )}
        
        {/* Favorite Button */}
        <button
          type="button"
          className={`favorite-button ${isMovieFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isMovieFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            size={20} 
            fill={isMovieFavorite ? 'currentColor' : 'none'}
          />
        </button>

        {/* Type Badge */}
        <div className="type-badge">
          <Film size={12} />
          <span>{result.Type}</span>
        </div>
      </div>

      <div className="result-content">
        <h3 className="result-title">
          {truncateText(result.Title, 50)}
        </h3>
        
        <div className="result-meta">
          <div className="result-year">
            <Calendar size={14} />
            <span>{result.Year}</span>
          </div>
          
          {result.imdbRating && result.imdbRating !== 'N/A' && (
            <div className="result-rating">
              <Star size={14} />
              <span>{result.imdbRating}</span>
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div className="result-overlay">
          <span className="view-details">View Details</span>
        </div>
      </div>
    </div>
  );
}

// Memoized version to prevent unnecessary re-renders
export default React.memo(Result);