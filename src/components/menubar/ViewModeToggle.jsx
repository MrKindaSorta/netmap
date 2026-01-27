import React from 'react';
import { ToggleButton } from './MenuBarButton';

const ViewModeToggle = ({ viewMode, setViewMode, theme }) => {
  return (
    <div className="flex rounded overflow-hidden" style={{ background: theme.bg }}>
      <ToggleButton
        onClick={() => setViewMode('logical')}
        isActive={viewMode === 'logical'}
        label="Logical"
        theme={theme}
      />
      <ToggleButton
        onClick={() => setViewMode('physical')}
        isActive={viewMode === 'physical'}
        label="Physical"
        theme={theme}
      />
    </div>
  );
};

export default ViewModeToggle;
