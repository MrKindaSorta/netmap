import React, { useRef } from 'react';
import { Icon } from './MenuBarButton';

const DataActions = ({
  importData,
  exportData,
  handleSaveNetwork,
  hasUnsavedChanges,
  canEdit,
  currentNetwork,
  isPremium,
  isSaving,
  theme
}) => {
  const fileInputRef = useRef(null);

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-2 py-1 rounded text-xs font-medium transition-colors"
        style={{ color: theme.text }}
        onMouseEnter={(e) => e.currentTarget.style.background = theme.hover}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        title="Import network from JSON"
      >
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importData}
        className="hidden"
      />

      <button
        onClick={exportData}
        className="px-2 py-1 rounded text-xs font-medium text-white transition-colors"
        style={{ background: theme.primary || '#2563eb' }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        title="Export network to JSON"
      >
        Export
      </button>

      {/* Save Button (only show when unsaved changes and can edit) */}
      {hasUnsavedChanges && canEdit && currentNetwork && isPremium && (
        <button
          onClick={handleSaveNetwork}
          disabled={isSaving}
          className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
          style={{
            background: isSaving ? '#9ca3af' : '#10b981',
            color: 'white',
            cursor: isSaving ? 'not-allowed' : 'pointer'
          }}
          title="Save changes to cloud (Ctrl+S)"
        >
          <Icon d={isSaving ? "M3 15a9 9 0 0118 0M12 20l-3-3m6 0l-3 3" : "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"} s={14} />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      )}
    </>
  );
};

export default DataActions;
