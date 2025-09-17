import React, { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, X, Clock, Filter } from 'lucide-react';
import { useMovieState, useMovieDispatch, actions } from './MovieContext';
import { useKeyboardNavigation } from './hooks';

function Search() {
  const state = useMovieState();
  const dispatch = useMovieDispatch();
  const [showHistory, setShowHistory] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(state.searchTerm);
  const inputRef = useRef(null);
  const historyRef = useRef(null);

  const { activeIndex, setActiveIndex, activeRef } = useKeyboardNavigation(
    state.searchHistory,
    (selectedTerm) => {
      handleHistorySelect(selectedTerm);
    }
  );

  // Update local state when global state changes
  useEffect(() => {
    setLocalSearchTerm(state.searchTerm);
  }, [state.searchTerm]);

  // Close history when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setActiveIndex]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    dispatch(actions.setSearchTerm(value));
    
    // Show history when input is focused and has no value
    if (!value && state.searchHistory.length > 0) {
      setShowHistory(true);
    } else {
      setShowHistory(false);
    }
  };

  const handleInputFocus = () => {
    if (!localSearchTerm && state.searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showHistory) {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowHistory(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleSearch = () => {
    if (localSearchTerm.trim()) {
      dispatch(actions.setSearchTerm(localSearchTerm.trim()));
      setShowHistory(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    dispatch(actions.setSearchTerm(''));
    dispatch(actions.resetSearch());
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const handleHistorySelect = (term) => {
    setLocalSearchTerm(term);
    dispatch(actions.setSearchTerm(term));
    setShowHistory(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleHistoryDelete = (e, termToDelete) => {
    e.stopPropagation();
    const newHistory = state.searchHistory.filter(term => term !== termToDelete);
    // This would need to be handled in the context
    console.log('Delete history item:', termToDelete);
  };

  const toggleFilters = () => {
    dispatch(actions.toggleFilters());
  };

  return (
    <div className="search-container" ref={historyRef}>
      <div className="search-input-wrapper">
        <div className="search-input-container">
          <SearchIcon className="search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for movies, TV shows..."
            className="search-input"
            value={localSearchTerm}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleInputFocus}
            aria-label="Search movies"
            aria-expanded={showHistory}
            aria-haspopup="listbox"
            role="combobox"
            autoComplete="off"
          />
          {localSearchTerm && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <div className="search-actions">
          <button
            type="button"
            className="search-button"
            onClick={handleSearch}
            disabled={!localSearchTerm.trim()}
            aria-label="Search"
          >
            <SearchIcon size={20} />
          </button>
          
          <button
            type="button"
            className={`filter-button ${state.showFilters ? 'active' : ''}`}
            onClick={toggleFilters}
            aria-label="Toggle filters"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {showHistory && state.searchHistory.length > 0 && (
        <div className="search-history" role="listbox">
          <div className="search-history-header">
            <span>Recent Searches</span>
            <button
              type="button"
              className="clear-history-button"
              onClick={() => dispatch(actions.clearSearchHistory())}
            >
              Clear All
            </button>
          </div>
          <ul className="search-history-list">
            {state.searchHistory.map((term, index) => (
              <li
                key={term}
                className={`search-history-item ${
                  index === activeIndex ? 'active' : ''
                }`}
                onClick={() => handleHistorySelect(term)}
                ref={index === activeIndex ? activeRef : null}
                role="option"
                aria-selected={index === activeIndex}
              >
                <Clock size={16} className="history-icon" />
                <span className="history-term">{term}</span>
                <button
                  type="button"
                  className="delete-history-button"
                  onClick={(e) => handleHistoryDelete(e, term)}
                  aria-label={`Remove ${term} from history`}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading indicator */}
      {state.loading && (
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <span>Searching...</span>
        </div>
      )}
    </div>
  );
}

export default Search;