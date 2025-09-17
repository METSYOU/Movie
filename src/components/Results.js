import React, { useRef, useEffect } from 'react';
import { Loader2, AlertCircle, Search as SearchIcon } from 'lucide-react';
import Result from './Result';
import { useMovieState } from './MovieContext';
import { useMovieSearch } from './hooks';
import { useIntersectionObserver } from './hooks';

function Results() {
  const state = useMovieState();
  const { loadMore } = useMovieSearch();
  
  // Infinite scroll
  const [loadMoreRef, isLoadMoreVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });

  // Load more when the load more element is visible
  useEffect(() => {
    if (isLoadMoreVisible && state.hasMore && !state.loading) {
      loadMore();
    }
  }, [isLoadMoreVisible, state.hasMore, state.loading, loadMore]);

  // Error state
  if (state.error) {
    return (
      <div className="results-error">
        <AlertCircle size={48} className="error-icon" />
        <h3>Oops! Something went wrong</h3>
        <p>{state.error}</p>
        <button
          type="button"
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // No search performed yet
  if (!state.searchTerm && state.results.length === 0) {
    return (
      <div className="results-empty">
        <SearchIcon size={64} className="empty-icon" />
        <h3>Discover Movies & TV Shows</h3>
        <p>Search for your favorite movies, TV series, and episodes</p>
        <div className="search-suggestions">
          <span>Try searching for:</span>
          <div className="suggestion-tags">
            <span className="suggestion-tag">Inception</span>
            <span className="suggestion-tag">Breaking Bad</span>
            <span className="suggestion-tag">The Matrix</span>
            <span className="suggestion-tag">Game of Thrones</span>
          </div>
        </div>
      </div>
    );
  }

  // No results found
  if (state.searchTerm && state.results.length === 0 && !state.loading) {
    return (
      <div className="results-no-results">
        <SearchIcon size={48} className="no-results-icon" />
        <h3>No results found</h3>
        <p>
          No movies or TV shows found for "<strong>{state.searchTerm}</strong>"
        </p>
        <div className="search-tips">
          <h4>Search tips:</h4>
          <ul>
            <li>Check your spelling</li>
            <li>Try different keywords</li>
            <li>Use more general terms</li>
            <li>Remove filters to see more results</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      {/* Results Header */}
      {state.results.length > 0 && (
        <div className="results-header">
          <h2>
            {state.totalResults > 0 
              ? `Found ${state.totalResults.toLocaleString()} result${state.totalResults !== 1 ? 's' : ''}`
              : 'Search Results'
            }
            {state.searchTerm && (
              <span className="search-term"> for "{state.searchTerm}"</span>
            )}
          </h2>
          
          {/* Results stats */}
          <div className="results-stats">
            Showing {state.results.length} of {state.totalResults} results
            {state.hasMore && (
              <span className="load-more-info">
                â€¢ Scroll down for more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="results-grid">
        {state.results.map((result, index) => (
          <Result
            key={`${result.imdbID}-${index}`}
            result={result}
            index={index}
          />
        ))}
      </div>

      {/* Loading States */}
      {state.loading && (
        <div className="results-loading">
          <Loader2 size={32} className="loading-spinner" />
          <span>Loading more results...</span>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {state.hasMore && !state.loading && (
        <div ref={loadMoreRef} className="load-more-trigger">
          <div className="load-more-indicator">
            <Loader2 size={24} className="loading-spinner" />
            <span>Loading more...</span>
          </div>
        </div>
      )}

      {/* End of results indicator */}
      {!state.hasMore && state.results.length > 0 && (
        <div className="results-end">
          <div className="results-end-line"></div>
          <span className="results-end-text">
            That's all! You've seen all {state.totalResults} results.
          </span>
          <div className="results-end-line"></div>
        </div>
      )}
    </div>
  );
}

export default Results;