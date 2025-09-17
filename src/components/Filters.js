import React from 'react';
import { ChevronDown, Calendar, Film, RotateCcw } from 'lucide-react';
import { useMovieState, useMovieDispatch, actions } from './MovieContext';
import { FILTER_OPTIONS } from './constants';

function Filters() {
  const state = useMovieState();
  const dispatch = useMovieDispatch();

  const handleFilterChange = (filterType, value) => {
    dispatch(actions.setFilters({ [filterType]: value }));
  };

  const resetFilters = () => {
    dispatch(actions.setFilters({
      type: '',
      year: '',
      sortBy: 'relevance'
    }));
  };

  const hasActiveFilters = state.filters.type || state.filters.year || state.filters.sortBy !== 'relevance';

  if (!state.showFilters) {
    return null;
  }

  return (
    <div className="filters-container">
      <div className="filters-header">
        <h3>Filter Results</h3>
        {hasActiveFilters && (
          <button
            type="button"
            className="reset-filters-button"
            onClick={resetFilters}
            aria-label="Reset all filters"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        )}
      </div>

      <div className="filters-grid">
        {/* Type Filter */}
        <div className="filter-group">
          <label htmlFor="type-filter" className="filter-label">
            <Film size={16} />
            Type
          </label>
          <div className="select-wrapper">
            <select
              id="type-filter"
              className="filter-select"
              value={state.filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              {FILTER_OPTIONS.TYPES.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="select-icon" />
          </div>
        </div>

        {/* Year Filter */}
        <div className="filter-group">
          <label htmlFor="year-filter" className="filter-label">
            <Calendar size={16} />
            Year
          </label>
          <div className="select-wrapper">
            <select
              id="year-filter"
              className="filter-select"
              value={state.filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
            >
              <option value="">Any Year</option>
              {FILTER_OPTIONS.YEARS.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="select-icon" />
          </div>
        </div>

        {/* Sort Filter */}
        <div className="filter-group">
          <label htmlFor="sort-filter" className="filter-label">
            Sort By
          </label>
          <div className="select-wrapper">
            <select
              id="sort-filter"
              className="filter-select"
              value={state.filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              {FILTER_OPTIONS.SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="select-icon" />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          <div className="active-filters-list">
            {state.filters.type && (
              <span className="filter-tag">
                Type: {FILTER_OPTIONS.TYPES.find(t => t.value === state.filters.type)?.label}
                <button
                  type="button"
                  onClick={() => handleFilterChange('type', '')}
                  className="remove-filter"
                  aria-label="Remove type filter"
                >
                  Ã—
                </button>
              </span>
            )}
            {state.filters.year && (
              <span className="filter-tag">
                Year: {state.filters.year}
                <button
                  type="button"
                  onClick={() => handleFilterChange('year', '')}
                  className="remove-filter"
                  aria-label="Remove year filter"
                >
                  Ã—
                </button>
              </span>
            )}
            {state.filters.sortBy !== 'relevance' && (
              <span className="filter-tag">
                Sort: {FILTER_OPTIONS.SORT_OPTIONS.find(s => s.value === state.filters.sortBy)?.label}
                <button
                  type="button"
                  onClick={() => handleFilterChange('sortBy', 'relevance')}
                  className="remove-filter"
                  aria-label="Remove sort filter"
                >
                  Ã—
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Filters;