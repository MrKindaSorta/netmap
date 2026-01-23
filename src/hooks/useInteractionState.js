import { useState, useCallback } from 'react';

/**
 * useInteractionState Hook
 *
 * Manages all user interaction state including:
 * - Dragging devices/buildings
 * - Connecting devices
 * - Drawing rooms/walls
 * - Panning and measuring
 * - Tool selection
 */
export const useInteractionState = () => {
  const [dragging, setDragging] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [tool, setTool] = useState('select');
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [mouseDownPos, setMouseDownPos] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawingStart, setDrawingStart] = useState(null);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [resizingRoom, setResizingRoom] = useState(null);
  const [movingRooms, setMovingRooms] = useState(null);
  const [draggingBuilding, setDraggingBuilding] = useState(null);

  // Helper functions
  const cancelAllInteractions = useCallback(() => {
    setDragging(null);
    setConnecting(null);
    setIsPanning(false);
    setMouseDownPos(null);
    setMousePosition(null);
    setDrawingMode(null);
    setDrawingStart(null);
    setResizingRoom(null);
    setMovingRooms(null);
    setDraggingBuilding(null);
  }, []);

  const clearMeasurePoints = useCallback(() => {
    setMeasurePoints([]);
  }, []);

  return {
    // Device dragging
    dragging,
    setDragging,

    // Connection mode
    connecting,
    setConnecting,

    // Tool selection
    tool,
    setTool,

    // Panning
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    mouseDownPos,
    setMouseDownPos,
    mousePosition,
    setMousePosition,

    // Drawing mode
    drawingMode,
    setDrawingMode,
    drawingStart,
    setDrawingStart,

    // Measuring
    measurePoints,
    setMeasurePoints,

    // Room interactions
    resizingRoom,
    setResizingRoom,
    movingRooms,
    setMovingRooms,

    // Building interactions
    draggingBuilding,
    setDraggingBuilding,

    // Helpers
    cancelAllInteractions,
    clearMeasurePoints
  };
};

export default useInteractionState;
