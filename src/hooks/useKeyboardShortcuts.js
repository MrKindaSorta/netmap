import { useEffect } from 'react';

/**
 * useKeyboardShortcuts Hook
 *
 * Handles all keyboard shortcuts for the network topology editor.
 * Prevents shortcuts from triggering when typing in inputs/textareas.
 */
export const useKeyboardShortcuts = ({
  // Navigation & View
  viewMode,
  setViewMode,
  visibilityMode,
  setVisibilityMode,
  showGrid,
  setShowGrid,
  zoom,
  setZoom,
  setPan,

  // Scaling
  circleScale,
  setCircleScale,
  deviceLabelScale,
  setDeviceLabelScale,
  portLabelScale,
  setPortLabelScale,

  // Selection
  selectedDevices,
  setSelectedDevices,
  selectedConnection,
  setSelectedConnection,
  selectedRooms,
  setSelectedRooms,
  selectedWalls,
  setSelectedWalls,
  selectedBuilding,
  selectedFloor,
  devices,

  // Drawing & Tools
  tool,
  setTool,
  drawingMode,
  setDrawingMode,
  measurePoints,
  setMeasurePoints,
  resizingRoom,
  setResizingRoom,
  movingRooms,
  setMovingRooms,
  connecting,
  setConnecting,

  // Context Menu
  contextMenu,
  setContextMenu,

  // AI Chat
  aiChatOpen,
  setAiChatOpen,

  // Actions
  undo,
  redo,
  duplicateSelected,
  copyDevices,
  delDevices,
  setConnections,
  handleRoomDelete,
  handleWallDelete,
  onSave
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keyboard shortcuts when typing in inputs/textareas
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Ctrl/Cmd + Z/Y - Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }

      // Ctrl/Cmd + D - Duplicate
      else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelected();
      }

      // Ctrl/Cmd + A - Select All
      else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedDevices(new Set(Object.keys(devices)));
      }

      // Ctrl/Cmd + C - Copy Devices
      else if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedDevices.size > 0) {
        e.preventDefault();
        copyDevices();
      }

      // Ctrl/Cmd + S - Save
      else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) {
          onSave();
        }
      }

      // Delete/Backspace - Delete Selected
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDevices.size) {
          delDevices([...selectedDevices]);
        }
        else if (selectedConnection) {
          setConnections(prev => {
            const newConns = { ...prev };
            delete newConns[selectedConnection];
            return newConns;
          });
          setSelectedConnection(null);
        }
        else if (selectedRooms.size > 0) {
          selectedRooms.forEach(roomId => handleRoomDelete(selectedBuilding, selectedFloor, roomId));
          setSelectedRooms(new Set());
        }
        else if (selectedWalls.size > 0) {
          selectedWalls.forEach(wallId => handleWallDelete(selectedBuilding, selectedFloor, wallId));
          setSelectedWalls(new Set());
        }
      }

      // Escape - Clear Selection & Cancel Actions
      else if (e.key === 'Escape') {
        setContextMenu(prev => ({ ...prev, visible: false }));
        setSelectedDevices(new Set());
        setSelectedRooms(new Set());
        setSelectedWalls(new Set());
        setSelectedConnection(null);
        setConnecting(null);
        setTool('select');
        setDrawingMode(null);
        setMeasurePoints([]);
        setResizingRoom(null);
        setMovingRooms(null);
      }

      // G - Toggle Grid
      else if (e.key === 'g') {
        setShowGrid(prev => !prev);
      }

      // M - Toggle Measure Mode
      else if (e.key === 'm') {
        setDrawingMode(mode => mode === 'measure' ? null : 'measure');
      }

      // 1 - Logical View
      else if (e.key === '1') {
        setViewMode('logical');
      }

      // 2 - Physical View
      else if (e.key === '2') {
        setViewMode('physical');
      }

      // V - Toggle Visibility Mode (Physical View Only)
      else if (e.key === 'v' && viewMode === 'physical') {
        setVisibilityMode(prev => !prev);
      }

      // + or = - Zoom In
      else if (e.key === '+' || e.key === '=') {
        setZoom(z => Math.min(z * 1.2, 5));
      }

      // - - Zoom Out
      else if (e.key === '-') {
        setZoom(z => Math.max(z * 0.8, 0.15));
      }

      // 0 - Reset Zoom & Pan
      else if (e.key === '0') {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }

      // [ - Decrease Circle Scale
      else if (e.key === '[' && !(viewMode === 'physical' && visibilityMode)) {
        setCircleScale(s => Math.max(s - 0.1, 0.5));
      }

      // ] - Increase Circle Scale
      else if (e.key === ']' && !(viewMode === 'physical' && visibilityMode)) {
        setCircleScale(s => Math.min(s + 0.1, 2.5));
      }

      // Shift + ) - Reset Circle Scale
      else if (e.shiftKey && e.key === ')' && !(viewMode === 'physical' && visibilityMode)) {
        setCircleScale(1);
      }

      // ; - Decrease Device Label Scale
      else if (e.key === ';' && !(viewMode === 'physical' && visibilityMode)) {
        setDeviceLabelScale(s => Math.max(s - 0.1, 0.5));
      }

      // ' - Increase Device Label Scale
      else if (e.key === "'" && !(viewMode === 'physical' && visibilityMode)) {
        setDeviceLabelScale(s => Math.min(s + 0.1, 2.5));
      }

      // Shift + " - Reset Device Label Scale
      else if (e.shiftKey && e.key === '"' && !(viewMode === 'physical' && visibilityMode)) {
        setDeviceLabelScale(1);
      }

      // Shift + { - Decrease Port Label Scale
      else if (e.shiftKey && e.key === '{' && !(viewMode === 'physical' && visibilityMode)) {
        setPortLabelScale(s => Math.max(s - 0.1, 0.5));
      }

      // Shift + } - Increase Port Label Scale
      else if (e.shiftKey && e.key === '}' && !(viewMode === 'physical' && visibilityMode)) {
        setPortLabelScale(s => Math.min(s + 0.1, 2.5));
      }

      // Shift + | - Reset Port Label Scale
      else if (e.shiftKey && e.key === '|' && !(viewMode === 'physical' && visibilityMode)) {
        setPortLabelScale(1);
      }

      // Ctrl/Cmd + I - Toggle AI Chat
      else if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setAiChatOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    // All dependencies needed by the keyboard handler
    selectedDevices,
    selectedConnection,
    selectedRooms,
    selectedWalls,
    selectedBuilding,
    selectedFloor,
    viewMode,
    visibilityMode,
    devices,
    undo,
    redo,
    duplicateSelected,
    copyDevices,
    delDevices,
    setSelectedDevices,
    setSelectedConnection,
    setSelectedRooms,
    setSelectedWalls,
    setConnections,
    setConnecting,
    setTool,
    setDrawingMode,
    setMeasurePoints,
    setResizingRoom,
    setMovingRooms,
    setContextMenu,
    setViewMode,
    setVisibilityMode,
    setShowGrid,
    setZoom,
    setPan,
    setCircleScale,
    setDeviceLabelScale,
    setPortLabelScale,
    setAiChatOpen,
    handleRoomDelete,
    handleWallDelete
  ]);
};

export default useKeyboardShortcuts;
