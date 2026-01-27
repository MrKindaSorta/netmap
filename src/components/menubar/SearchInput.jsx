import React from 'react';
import { Icon } from './MenuBarButton';

const SearchInput = ({ searchQuery, setSearchQuery, theme }) => {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-2 pointer-events-none" style={{ color: theme.textMuted }}>
        <Icon d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" s={12} />
      </div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search devices..."
        className="w-32 pl-7 pr-7 py-1 rounded text-xs border focus:w-48 transition-all"
        style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          style={{ color: theme.textMuted }}
          title="Clear search"
        >
          <Icon d="M18 6L6 18M6 6l12 12" s={12} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
