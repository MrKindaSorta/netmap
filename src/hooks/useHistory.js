import { useState, useCallback, useRef } from 'react';

export const useHistory = (devices, connections, buildings) => {
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const lastSavedStateRef = useRef(null);

  const saveHistory = useCallback(() => {
    const state = JSON.stringify({ devices, connections, buildings });

    // Skip if state hasn't changed
    if (state === lastSavedStateRef.current) return;

    lastSavedStateRef.current = state;

    // Use functional updates to avoid dependency on history/historyIdx
    setHistory(prev => {
      const newHist = prev.slice(0, historyIdx + 1);
      newHist.push(state);
      return newHist.length > 40 ? newHist.slice(1) : newHist;
    });

    setHistoryIdx(prev => {
      const newIdx = prev + 1;
      return newIdx >= 40 ? 39 : newIdx;
    });
  }, [devices, connections, buildings, historyIdx]);

  const undo = useCallback((currentHistory, currentIdx) => {
    if (currentIdx > 0) {
      const state = JSON.parse(currentHistory[currentIdx - 1]);
      setHistoryIdx(currentIdx - 1);
      return state;
    }
    return null;
  }, []);

  const redo = useCallback((currentHistory, currentIdx) => {
    if (currentIdx < currentHistory.length - 1) {
      const state = JSON.parse(currentHistory[currentIdx + 1]);
      setHistoryIdx(currentIdx + 1);
      return state;
    }
    return null;
  }, []);

  return {
    saveHistory,
    undo: () => undo(history, historyIdx),
    redo: () => redo(history, historyIdx),
    canUndo: historyIdx > 0,
    canRedo: historyIdx < history.length - 1,
    history,
    historyIdx
  };
};
