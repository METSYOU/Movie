import React, { useEffect } from 'react';
import { Loader2, TrendingUp, Star, ChevronRight, Play, AlertCircle, Calendar } from 'lucide-react';
import { useMovieState, useMovieDispatch, actions } from './MovieContext';
import { useMovieDetails, useFavorites } from './hooks';
import { handleImageError, truncateText } from './utils';
import movieService from './movieService';

/**
 * Home.js - Home Screen Component
 * 
 * Updated to show big Hollywood movie new releases from 2024-2025
 * Clean interface without emojis, "No Picture" placeholder for missing images
 */

// Movie Card Component for horizontal lists
function MovieCard({ movie, isHero = false }) {
  const { getMovieDetails } = useMovieDetails();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleClick = () => {
    getMovieDetails(movie.imdbID);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(movie);
  };

  const isMovieFavorite = isFavorite(movie.imdbID);

  // Check if poster is available
  const hasValidPoster = movie.Poster && movie.Poster !== 'N/A' && !movie.Poster.includes('placeholder');

  if (isHero) {
    return (
      <div className="hero-movie" onClick={handleClick}>
        <div className="hero-backdrop">
          {hasValidPoster ? (
            <img
              src={movie.Poster}
              alt={`${movie.Title} poster`}
              className="hero-image"
              onError={handleImageError}
            />
          ) : (
            <div className="hero-no-image">
              <span>No Picture</span>
            </div>
          )}
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">{movie.Title}</h1>
          <div className="hero-meta">
            <span className="hero-year">
              <Calendar size={16} />
              {movie.Year}
            </span>
            <span className="hero-type">{movie.Type}</span>
            {/* Show "New Release" badge for 2024-2025 content */}
            {parseInt(movie.Year) >= 2024 && (
              <span className="new-release-badge">New Release</span>
            )}
          </div>
          <div className="hero-description">
            <p>Latest {movie.Type} from {movie.Year}</p>
          </div>
          <div className="hero-actions">
            <button className="hero-play-button">
              <Play size={20} />
              View Details
            </button>
            <button 
              className={`hero-favorite-button ${isMovieFavorite ? 'active' : ''}`}
              onClick={handleFavoriteClick}
            >
              <Star fill={isMovieFavorite ? 'currentColor' : 'none'} size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-movie-card" onClick={handleClick}>
      <div className="home-movie-poster">
        {hasValidPoster ? (
          <img
            src={movie.Poster}
            alt={`${movie.Title} poster`}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="no-poster-placeholder">
            <span>No Picture</span>
          </div>
        )}
        <div className="home-movie-overlay">
          <div className="home-movie-info">
            <h4>{truncateText(movie.Title, 30)}</h4>
            <div className="home-movie-meta">
              <span>{movie.Year}</span>
              <span className="movie-type">{movie.Type}</span>
              {/* Show "New" badge for 2024-2025 releases */}
              {parseInt(movie.Year) >= 2024 && (
                <span className="new-badge">New</span>
              )}
            </div>
          </div>
          <button 
            className={`home-favorite-button ${isMovieFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
          >
            <Star fill={isMovieFavorite ? 'currentColor' : 'none'} size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Section Component
function MovieSection({ title, movies, loading, error, icon: Icon }) {
  if (loading) {
    return (
      <section className="home-section">
        <div className="section-header">
          <h2>
            {Icon && <Icon size={24} />}
            {title}
          </h2>
        </div>
        <div className="section-loading">
          <Loader2 size={32} className="loading-spinner" />
          <span>Loading {title.toLowerCase()}...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="home-section">
        <div className="section-header">
          <h2>
            {Icon && <Icon size={24} />}
            {title}
          </h2>
        </div>
        <div className="section-error">
          <AlertCircle size={32} />
          <span>Failed to load {title.toLowerCase()}</span>
        </div>
      </section>
    );
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="home-section">
      <div className="section-header">
        <h2>
          {Icon && <Icon size={24} />}
          {title}
        </h2>
        <ChevronRight size={20} className="section-arrow" />
      </div>
      <div className="movie-list">
        {movies.map((movie) => (
          <MovieCard key={movie.imdbID} movie={movie} />
        ))}
      </div>
    </section>
  );
}

function Home() {
  const state = useMovieState();
  const dispatch = useMovieDispatch();

  // Load home data on mount
  useEffect(() => {
    const loadHomeData = async () => {
      // Load trending Hollywood movies
      try {
        dispatch(actions.setLoadingTrending(true));
        const trendingMovies = await movieService.getTrendingMovies();
        dispatch(actions.setTrendingMovies(trendingMovies));
      } catch (error) {
        dispatch(actions.setTrendingError(error.message));
      }

      // Load new Hollywood releases
      try {
        dispatch(actions.setLoadingPopular(true));
        const newReleases = await movieService.getNewlyReleased();
        dispatch(actions.setPopularMovies(newReleases));
      } catch (error) {
        dispatch(actions.setPopularError(error.message));
      }
    };

    // Only load if we don't have data yet
    if (state.trendingMovies.length === 0 && state.popularMovies.length === 0) {
      loadHomeData();
    }
  }, [dispatch, state.trendingMovies.length, state.popularMovies.length]);

  // Get the most recent movie for hero (newest year first)
  const heroMovie = [...state.trendingMovies, ...state.popularMovies]
    .sort((a, b) => parseInt(b.Year) - parseInt(a.Year))[0];

  return (
    <div className="home-container">
      {/* Hero Section with new releases */}
      {heroMovie && (
        <section className="hero-section">
          <div className="hero-content-wrapper">
            <div className="hero-badge">
              Featured New Release {parseInt(heroMovie.Year) >= 2024 ? '2024-2025' : ''}
            </div>
            <MovieCard movie={heroMovie} isHero={true} />
          </div>
        </section>
      )}

      {/* Trending Hollywood Movies Section */}
      <MovieSection
        title="Trending Hollywood Movies"
        movies={state.trendingMovies.slice(1, 11)} // Skip first one used in hero
        loading={state.loadingTrending}
        error={state.trendingError}
        icon={TrendingUp}
      />

      {/* New Hollywood Releases Section */}
      <MovieSection
        title="New Hollywood Releases (2024-2025)"
        movies={state.popularMovies.filter(movie => parseInt(movie.Year) >= 2024)}
        loading={state.loadingPopular}
        error={state.popularError}
        icon={Calendar}
      />

      {/* Your Favorites */}
      {state.favorites.length > 0 && (
        <MovieSection
          title="Your Favorites"
          movies={state.favorites.slice(0, 10)}
          loading={false}
          error={null}
          icon={Star}
        />
      )}

      {/* Empty state for when no data is available */}
      {!state.loadingTrending && !state.loadingPopular && 
       state.trendingMovies.length === 0 && state.popularMovies.length === 0 && (
        <div className="home-empty">
          <div className="empty-content">
            <AlertCircle size={64} className="empty-icon" />
            <h3>Unable to load content</h3>
            <p>We're having trouble loading the latest Hollywood releases. Please try again later.</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;