import React from 'react';
import { IconButton, Icon } from './MenuBarButton';

const HistoryControls = ({ undo, redo, historyIdx, history, theme }) => {
  return (
    <>
      <IconButton
        onClick={undo}
        icon={<Icon d="M9 14l-4-4 4-4M5 10h11a4 4 0 110 8h-1" s={16} />}
        title="Undo (Ctrl+Z)"
        disabled={historyIdx <= 0}
        theme={theme}
      />
      <IconButton
        onClick={redo}
        icon={<Icon d="M15 14l4-4-4-4M19 10H8a4 4 0 100 8h1" s={16} />}
        title="Redo (Ctrl+Y)"
        disabled={historyIdx >= history.length - 1}
        theme={theme}
      />
    </>
  );
};

export default HistoryControls;
