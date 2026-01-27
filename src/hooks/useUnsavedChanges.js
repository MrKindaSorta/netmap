import { useState, useEffect, useRef, useCallback } from 'react';

export const useUnsavedChanges = (
  devices,
  connections,
  vlans,
  buildings,
  circleScale,
  deviceLabelScale,
  portLabelScale,
  currentNetwork
) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const savedStateRef = useRef(null);

  // Create a snapshot of the current state
  const createSnapshot = useCallback(() => {
    return JSON.stringify({
      devices,
      connections,
      vlans,
      buildings,
      viewState: { circleScale, deviceLabelScale, portLabelScale }
    });
  }, [devices, connections, vlans, buildings, circleScale, deviceLabelScale, portLabelScale]);

  // Mark current state as saved
  const markAsSaved = useCallback(() => {
    savedStateRef.current = createSnapshot();
    setHasUnsavedChanges(false);
  }, [createSnapshot]);

  // Clear saved state (for network switches)
  const clearSavedState = useCallback(() => {
    savedStateRef.current = null;
    setHasUnsavedChanges(false);
  }, []);

  // Compare current state to saved state whenever data changes
  useEffect(() => {
    // Skip comparison if no network loaded or no saved state yet
    if (!currentNetwork || savedStateRef.current === null) {
      setHasUnsavedChanges(false);
      return;
    }

    // Compare current state to saved snapshot
    const currentSnapshot = createSnapshot();
    const hasChanges = currentSnapshot !== savedStateRef.current;
    setHasUnsavedChanges(hasChanges);
  }, [devices, connections, vlans, buildings, circleScale, deviceLabelScale, portLabelScale, currentNetwork, createSnapshot]);

  return {
    hasUnsavedChanges,
    markAsSaved,
    clearSavedState
  };
};
