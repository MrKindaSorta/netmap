import React from 'react';
import Icon from '../common/Icon';

const EmptyStatePanel = ({ onCreateBuilding, onImport, theme }) => {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.bg
      }}
    >
      <div
        className="max-w-md p-8 rounded-xl text-center"
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: theme.bg }}
        >
          <Icon
            d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18"
            s={32}
            color={theme.textMuted}
          />
        </div>

        {/* Title */}
        <h2
          className="text-xl font-bold mb-2"
          style={{ color: theme.text }}
        >
          No Buildings Yet
        </h2>

        {/* Description */}
        <p
          className="mb-6"
          style={{ color: theme.textMuted }}
        >
          Create your first building to start mapping your network infrastructure.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onCreateBuilding}
            className="w-full py-3 px-4 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Create Your First Building
          </button>

          <button
            onClick={onImport}
            className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
            style={{
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              color: theme.text
            }}
          >
            Import Existing Topology
          </button>
        </div>

        {/* Quick Guide */}
        <div
          className="mt-6 p-4 rounded-lg text-left"
          style={{
            background: theme.bg,
            border: `1px solid ${theme.border}`
          }}
        >
          <h3
            className="text-sm font-semibold mb-2"
            style={{ color: theme.text }}
          >
            Quick Start Guide
          </h3>
          <ol
            className="text-xs space-y-1"
            style={{ color: theme.textMuted }}
          >
            <li>1. Create a building with dimensions</li>
            <li>2. Draw rooms for server rooms, IDFs, etc.</li>
            <li>3. Draw walls to define spaces</li>
            <li>4. Place devices in rooms</li>
            <li>5. Connect devices with cables</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EmptyStatePanel;
