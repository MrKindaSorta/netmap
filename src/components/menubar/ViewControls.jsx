import React from 'react';
import { IconButton, Icon } from './MenuBarButton';

const ViewControls = ({ showGrid, setShowGrid, darkMode, setDarkMode, showMinimap, setShowMinimap, viewMode, theme }) => {
  return (
    <>
      <IconButton
        onClick={() => setShowGrid(g => !g)}
        icon={<Icon d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" s={16} />}
        title="Toggle grid (G)"
        active={showGrid}
        theme={theme}
      />
      <IconButton
        onClick={() => setDarkMode(d => !d)}
        icon={<Icon d={darkMode ? 'M12 3v1M12 20v1M4.2 4.2l.7.7M18.4 18.4l.7.7M3 12h1M20 12h1' : 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'} s={16} />}
        title="Toggle dark mode"
        theme={theme}
      />
      {viewMode === 'logical' && (
        <>
          <div className="w-px h-5" style={{ background: theme.border }} />
          <IconButton
            onClick={() => setShowMinimap(m => !m)}
            icon={<Icon d="M9 9h6v6H9zM3 3h18v18H3z" s={16} />}
            title="Minimap"
            active={showMinimap}
            theme={theme}
          />
        </>
      )}
    </>
  );
};

export default ViewControls;
