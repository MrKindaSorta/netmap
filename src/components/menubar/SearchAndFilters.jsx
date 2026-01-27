import React from 'react';
import SearchInput from './SearchInput';

const SearchAndFilters = ({ searchQuery, setSearchQuery, viewMode, showVlanPanel, setShowVlanPanel, filterVlan, theme }) => {
  return (
    <>
      <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} theme={theme} />
      {viewMode === 'logical' && (
        <button
          onClick={() => setShowVlanPanel(!showVlanPanel)}
          className="px-2 py-1 rounded text-xs font-medium transition-colors"
          style={showVlanPanel ? { background: '#2563eb', color: 'white' } : { background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}
        >
          VLANs {filterVlan !== null && <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-500 text-white text-xs">{filterVlan}</span>}
        </button>
      )}
    </>
  );
};

export default SearchAndFilters;
