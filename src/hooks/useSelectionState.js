import { useState, useCallback } from 'react';

/**
 * useSelectionState Hook
 *
 * Manages all selection-related state including:
 * - Device, connection, room, wall, building selection
 * - Selection box for multi-select
 * - Floor selection
 */
export const useSelectionState = () => {
  const [selectedDevices, setSelectedDevices] = useState(new Set());
  const [selectedRooms, setSelectedRooms] = useState(new Set());
  const [selectedWalls, setSelectedWalls] = useState(new Set());
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectionBox, setSelectionBox] = useState(null);

  // Helper functions
  const clearAllSelections = useCallback(() => {
    setSelectedDevices(new Set());
    setSelectedRooms(new Set());
    setSelectedWalls(new Set());
    setSelectedConnection(null);
    setSelectionBox(null);
  }, []);

  const selectAllDevices = useCallback((devices) => {
    setSelectedDevices(new Set(Object.keys(devices)));
  }, []);

  return {
    // Device selection
    selectedDevices,
    setSelectedDevices,

    // Room and wall selection
    selectedRooms,
    setSelectedRooms,
    selectedWalls,
    setSelectedWalls,

    // Connection selection
    selectedConnection,
    setSelectedConnection,

    // Building and floor selection
    selectedBuilding,
    setSelectedBuilding,
    selectedFloor,
    setSelectedFloor,

    // Selection box
    selectionBox,
    setSelectionBox,

    // Helpers
    clearAllSelections,
    selectAllDevices
  };
};

export default useSelectionState;
