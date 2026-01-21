import { useCallback } from 'react';

/**
 * useCanvasMouseEvents Hook
 *
 * Handles all mouse interactions for the canvas including:
 * - Pan and zoom
 * - Device dragging
 * - Box selection
 * - Room/wall drawing and resizing
 * - Building dragging
 */
export const useCanvasMouseEvents = ({
  // Refs
  svgRef,

  // View state
  viewMode,
  zoom,
  setZoom,
  pan,
  setPan,
  showGrid,

  // Selection state
  selectedDevices,
  setSelectedDevices,
  selectedConnection,
  setSelectedConnection,
  selectionBox,
  setSelectionBox,
  selectedBuilding,
  selectedFloor,

  // Interaction state
  dragging,
  setDragging,
  isPanning,
  setIsPanning,
  panStart,
  setPanStart,
  connecting,
  setConnecting,
  mouseDownPos,
  setMouseDownPos,
  drawingMode,
  drawingStart,
  setDrawingStart,
  resizingRoom,
  setResizingRoom,
  movingRooms,
  setMovingRooms,
  draggingBuilding,
  setDraggingBuilding,

  // Data
  devices,
  setDevices,
  buildings,
  setBuildings,
  setConnections,

  // Context menu
  setContextMenu,

  // Utilities
  getSvgPt,
  genId
}) => {
  const handleWheel = useCallback((e) => {
    e.preventDefault();

    // Smooth zoom with scroll wheel, zooming to pointer location
    const zoomIntensity = 0.05; // Lower = smoother
    const delta = -e.deltaY;
    const zoomFactor = delta > 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setZoom(prevZoom => {
      const newZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.15), 5);

      // Calculate the point in SVG coordinates before zoom
      const svgX = (mouseX - pan.x) / prevZoom;
      const svgY = (mouseY - pan.y) / prevZoom;

      // Adjust pan so the same SVG point stays under the mouse
      const newPanX = mouseX - svgX * newZoom;
      const newPanY = mouseY - svgY * newZoom;

      setPan({ x: newPanX, y: newPanY });

      return newZoom;
    });
  }, [pan, svgRef, setPan, setZoom]);

  const handleMouseDown = useCallback((e) => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    const pt = getSvgPt(e);

    if (e.target === svgRef.current || e.target.classList.contains('bg-layer')) {
      if (drawingMode === 'wall' || drawingMode === 'room') {
        setDrawingStart(pt);
      }
      else if (drawingMode === 'measure') {
        // Measure mode - not handled here
      }
      else {
        if (e.ctrlKey || e.metaKey) {
          setSelectionBox({ startX: pt.x, startY: pt.y, endX: pt.x, endY: pt.y });
        } else {
          // Store mouse down position for distance calculation
          setMouseDownPos({ x: e.clientX, y: e.clientY, cleared: false });
          setIsPanning(true);
          setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
          // Don't clear selection here - wait to see if it's a click or drag
        }
      }
      setConnecting(null);
    }
  }, [
    getSvgPt, pan, viewMode, selectedBuilding, selectedFloor, drawingMode,
    svgRef, setMouseDownPos, setContextMenu, setDrawingStart, setSelectionBox,
    setIsPanning, setPanStart, setConnecting
  ]);

  const handleMouseMove = useCallback((e) => {
    if (resizingRoom) {
      const pt = getSvgPt(e);
      const b = buildings[selectedBuilding];
      const dx = pt.x - resizingRoom.startX - b.x;
      const dy = pt.y - resizingRoom.startY - b.y;
      const { startRoom, handleId } = resizingRoom;

      let newX = startRoom.x;
      let newY = startRoom.y;
      let newWidth = startRoom.width;
      let newHeight = startRoom.height;

      // Update dimensions based on which handle is being dragged
      switch (handleId) {
        case 'nw':
          newX = startRoom.x + dx;
          newY = startRoom.y + dy;
          newWidth = Math.max(20, startRoom.width - dx);
          newHeight = Math.max(20, startRoom.height - dy);
          break;
        case 'n':
          newY = startRoom.y + dy;
          newHeight = Math.max(20, startRoom.height - dy);
          break;
        case 'ne':
          newY = startRoom.y + dy;
          newWidth = Math.max(20, startRoom.width + dx);
          newHeight = Math.max(20, startRoom.height - dy);
          break;
        case 'e':
          newWidth = Math.max(20, startRoom.width + dx);
          break;
        case 'se':
          newWidth = Math.max(20, startRoom.width + dx);
          newHeight = Math.max(20, startRoom.height + dy);
          break;
        case 's':
          newHeight = Math.max(20, startRoom.height + dy);
          break;
        case 'sw':
          newX = startRoom.x + dx;
          newWidth = Math.max(20, startRoom.width - dx);
          newHeight = Math.max(20, startRoom.height + dy);
          break;
        case 'w':
          newX = startRoom.x + dx;
          newWidth = Math.max(20, startRoom.width - dx);
          break;
        default:
          break;
      }

      // Update room dimensions
      setBuildings(p => {
        const building = p[selectedBuilding];
        return {
          ...p,
          [selectedBuilding]: {
            ...building,
            floors: building.floors.map(f =>
              f.id === selectedFloor
                ? {
                    ...f,
                    rooms: f.rooms.map(r =>
                      r.id === resizingRoom.roomId
                        ? { ...r, x: newX, y: newY, width: newWidth, height: newHeight }
                        : r
                    )
                  }
                : f
            )
          }
        };
      });
    }
    else if (movingRooms) {
      const pt = getSvgPt(e);
      const b = buildings[selectedBuilding];
      const dx = pt.x - movingRooms.startX - b.x;
      const dy = pt.y - movingRooms.startY - b.y;

      // Update positions for all moving rooms
      setBuildings(p => {
        const building = p[selectedBuilding];
        return {
          ...p,
          [selectedBuilding]: {
            ...building,
            floors: building.floors.map(f =>
              f.id === selectedFloor
                ? {
                    ...f,
                    rooms: f.rooms.map(r =>
                      movingRooms.roomIds.includes(r.id)
                        ? {
                            ...r,
                            x: Math.max(0, Math.min(building.width - r.width, movingRooms.startPositions[r.id].x + dx)),
                            y: Math.max(0, Math.min(building.height - r.height, movingRooms.startPositions[r.id].y + dy))
                          }
                        : r
                    )
                  }
                : f
            )
          }
        };
      });
    }
    else if (draggingBuilding) {
      const pt = getSvgPt(e);
      const dx = pt.x - draggingBuilding.startX;
      const dy = pt.y - draggingBuilding.startY;

      // Update building position
      const newBuildingX = draggingBuilding.startBuildingPos.x + dx;
      const newBuildingY = draggingBuilding.startBuildingPos.y + dy;

      setBuildings(p => ({
        ...p,
        [draggingBuilding.buildingId]: {
          ...p[draggingBuilding.buildingId],
          x: newBuildingX,
          y: newBuildingY
        }
      }));

      // Update all devices in this building to maintain their relative positions
      setDevices(p => {
        const updated = { ...p };
        Object.values(updated).forEach(dev => {
          if (dev.buildingId === draggingBuilding.buildingId) {
            // Calculate device's relative position within building
            const relativeX = dev.physicalX - draggingBuilding.startBuildingPos.x;
            const relativeY = dev.physicalY - draggingBuilding.startBuildingPos.y;
            // Update to new absolute position
            updated[dev.id] = {
              ...dev,
              physicalX: newBuildingX + relativeX,
              physicalY: newBuildingY + relativeY
            };
          }
        });
        return updated;
      });
    }
    else if (selectionBox) {
      const pt = getSvgPt(e);
      setSelectionBox(prev => ({ ...prev, endX: pt.x, endY: pt.y }));
    }
    else if (isPanning && !dragging) {
      // Check if we've moved enough to consider this a drag (not a click)
      if (mouseDownPos && !mouseDownPos.cleared) {
        const dx = e.clientX - mouseDownPos.x;
        const dy = e.clientY - mouseDownPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If moved more than 5 pixels, it's a drag - don't clear selection
        if (distance > 5) {
          setMouseDownPos(prev => ({ ...prev, cleared: true }));
        }
      }
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
    else if (dragging) {
      const pt = getSvgPt(e);
      const [xk, yk] = viewMode === 'logical' ? ['x', 'y'] : ['physicalX', 'physicalY'];
      const snap = viewMode === 'logical' ? 20 : 10;
      const sx = showGrid ? Math.round(pt.x / snap) * snap : pt.x;
      const sy = showGrid ? Math.round(pt.y / snap) * snap : pt.y;

      if (selectedDevices.size > 1 && selectedDevices.has(dragging)) {
        const dd = devices[dragging];
        const dx = sx - dd[xk];
        const dy = sy - dd[yk];
        setDevices(p => {
          const u = { ...p };
          selectedDevices.forEach(i => {
            u[i] = { ...u[i], [xk]: u[i][xk] + dx, [yk]: u[i][yk] + dy };
          });
          return u;
        });
      } else {
        setDevices(p => ({ ...p, [dragging]: { ...p[dragging], [xk]: sx, [yk]: sy } }));
      }
    }
  }, [
    selectionBox, isPanning, panStart, dragging, getSvgPt, showGrid, viewMode,
    selectedDevices, devices, mouseDownPos, resizingRoom, movingRooms,
    draggingBuilding, buildings, selectedBuilding, selectedFloor,
    setSelectionBox, setPan, setMouseDownPos, setDevices, setBuildings
  ]);

  const handleMouseUp = useCallback((e) => {
    if (resizingRoom) {
      setResizingRoom(null);
      return;
    }
    if (movingRooms) {
      setMovingRooms(null);
      return;
    }
    if (draggingBuilding) {
      setDraggingBuilding(null);
      return;
    }

    if (selectionBox) {
      const { startX, startY, endX, endY } = selectionBox;
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      const [xk, yk] = viewMode === 'logical' ? ['x', 'y'] : ['physicalX', 'physicalY'];
      const devicesInBox = Object.values(devices).filter(d => {
        const x = d[xk];
        const y = d[yk];
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      }).map(d => d.id);

      setSelectedDevices(new Set(devicesInBox));
      setSelectionBox(null);
    }
    else if (drawingStart && viewMode === 'physical') {
      const pt = getSvgPt(e);
      const b = buildings[selectedBuilding];

      if (drawingMode === 'wall') {
        const w = {
          id: genId('w'),
          x1: drawingStart.x - b.x,
          y1: drawingStart.y - b.y,
          x2: pt.x - b.x,
          y2: pt.y - b.y
        };
        setBuildings(p => {
          const building = p[selectedBuilding];
          return {
            ...p,
            [selectedBuilding]: {
              ...building,
              floors: building.floors.map(f =>
                f.id === selectedFloor
                  ? { ...f, walls: [...(f.walls || []), w] }
                  : f
              )
            }
          };
        });
      }
      else if (drawingMode === 'room') {
        const r = {
          id: genId('r'),
          name: 'New Room',
          x: Math.min(drawingStart.x, pt.x) - b.x,
          y: Math.min(drawingStart.y, pt.y) - b.y,
          width: Math.abs(pt.x - drawingStart.x),
          height: Math.abs(pt.y - drawingStart.y),
          color: '#3b82f620'
        };

        if (r.width > 20 && r.height > 20) {
          setBuildings(p => {
            const building = p[selectedBuilding];
            return {
              ...p,
              [selectedBuilding]: {
                ...building,
                floors: building.floors.map(f =>
                  f.id === selectedFloor
                    ? { ...f, rooms: [...(f.rooms || []), r] }
                    : f
                )
              }
            };
          });
        }
      }
      setDrawingStart(null);
    }

    // Only clear selection if it was a short click (not a drag)
    if (mouseDownPos && !mouseDownPos.cleared && !e.shiftKey && !selectionBox) {
      const dx = e.clientX - mouseDownPos.x;
      const dy = e.clientY - mouseDownPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If moved less than 5 pixels, it's a click - clear selection
      if (distance < 5) {
        setSelectedDevices(new Set());
        setSelectedConnection(null);
      }
    }

    setMouseDownPos(null);
    setIsPanning(false);
    setDragging(null);
  }, [
    selectionBox, drawingStart, viewMode, getSvgPt, buildings, selectedBuilding,
    drawingMode, devices, mouseDownPos, resizingRoom, movingRooms,
    draggingBuilding, selectedFloor, genId,
    setSelectedDevices, setSelectedConnection, setSelectionBox, setDrawingStart,
    setBuildings, setMouseDownPos, setIsPanning, setDragging,
    setResizingRoom, setMovingRooms, setDraggingBuilding
  ]);

  const handleDevDown = useCallback((e, id) => {
    e.stopPropagation();
    const device = devices[id];

    if (!device?.locked) {
      setDragging(id);
    }

    if (e.shiftKey) {
      setSelectedDevices(p => {
        const n = new Set(p);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
      });
    } else if (!selectedDevices.has(id)) {
      setSelectedDevices(new Set([id]));
    }

    setSelectedConnection(null);
  }, [selectedDevices, devices, setDragging, setSelectedDevices, setSelectedConnection]);

  const handleConnClick = useCallback((e, id) => {
    e.stopPropagation();
    setSelectedConnection(id);
    setSelectedDevices(new Set());
  }, [setSelectedConnection, setSelectedDevices]);

  return {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDevDown,
    handleConnClick
  };
};

export default useCanvasMouseEvents;
