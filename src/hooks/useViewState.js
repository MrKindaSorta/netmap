import { useState, useCallback } from 'react';

/**
 * useViewState Hook
 *
 * Manages all view-related state including:
 * - View mode (logical/physical)
 * - Zoom and pan
 * - Grid and display settings
 * - Scale controls
 * - Panel visibility
 */
export const useViewState = () => {
  const [viewMode, setViewMode] = useState('logical');
  const [measurementUnit, setMeasurementUnit] = useState('imperial');
  const [showGrid, setShowGrid] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [circleScale, setCircleScale] = useState(1);
  const [deviceLabelScale, setDeviceLabelScale] = useState(1);
  const [portLabelScale, setPortLabelScale] = useState(1);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showVlanPanel, setShowVlanPanel] = useState(false);
  const [visibilityMode, setVisibilityMode] = useState(false);
  const [visibilityModeSize, setVisibilityModeSize] = useState('medium');

  // Helper functions
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const resetScales = useCallback(() => {
    setCircleScale(1);
    setDeviceLabelScale(1);
    setPortLabelScale(1);
  }, []);

  return {
    // View mode
    viewMode,
    setViewMode,
    measurementUnit,
    setMeasurementUnit,

    // Display settings
    showGrid,
    setShowGrid,
    darkMode,
    setDarkMode,

    // Zoom and pan
    zoom,
    setZoom,
    pan,
    setPan,

    // Scale controls
    circleScale,
    setCircleScale,
    deviceLabelScale,
    setDeviceLabelScale,
    portLabelScale,
    setPortLabelScale,

    // Panel visibility
    showMinimap,
    setShowMinimap,
    showVlanPanel,
    setShowVlanPanel,

    // Visibility mode (physical view)
    visibilityMode,
    setVisibilityMode,
    visibilityModeSize,
    setVisibilityModeSize,

    // Helpers
    resetView,
    resetScales
  };
};

export default useViewState;
