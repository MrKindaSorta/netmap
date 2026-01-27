import React from 'react';
import { DrawingToolButton, Icon, IconButton } from './MenuBarButton';

const PhysicalViewControls = ({
  drawingMode,
  setDrawingMode,
  canEdit,
  isReadOnly,
  fileInputRef,
  handleImageUpload,
  measurementUnit,
  setMeasurementUnit,
  showMeasurements,
  setShowMeasurements,
  visibilityMode,
  setVisibilityMode,
  visibilityModeSize,
  setVisibilityModeSize,
  theme
}) => {
  return (
    <>
      <div className="flex rounded p-0.5 gap-0.5" style={{ background: theme.bg }}>
        <DrawingToolButton
          onClick={() => canEdit && setDrawingMode(drawingMode === 'wall' ? null : 'wall')}
          isActive={drawingMode === 'wall'}
          tool="wall"
          disabled={isReadOnly}
          theme={theme}
          title={isReadOnly ? "Read-only mode" : "Draw Wall"}
          icon={<Icon d="M3 21V3h18v18" s={16} />}
        />
        <DrawingToolButton
          onClick={() => canEdit && setDrawingMode(drawingMode === 'room' ? null : 'room')}
          isActive={drawingMode === 'room'}
          tool="room"
          disabled={isReadOnly}
          theme={theme}
          title={isReadOnly ? "Read-only mode" : "Draw Room"}
          icon={<Icon d="M3 3h18v18H3zM9 3v18M15 3v18" s={16} />}
        />
        <DrawingToolButton
          onClick={() => setDrawingMode(drawingMode === 'measure' ? null : 'measure')}
          isActive={drawingMode === 'measure'}
          tool="measure"
          disabled={false}
          theme={theme}
          title="Measure"
          icon={<Icon d="M2 12h20M12 2v20" s={16} />}
        />
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          icon={<Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12M8 8l4-4 4 4" s={16} />}
          title="Upload Floor Plan"
          theme={theme}
        />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </div>
      <select
        value={measurementUnit}
        onChange={(e) => setMeasurementUnit(e.target.value)}
        className="px-2 py-1 rounded text-xs border"
        style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
      >
        <option value="imperial">Feet</option>
        <option value="metric">Meters</option>
      </select>
      <IconButton
        onClick={() => setShowMeasurements(!showMeasurements)}
        icon={<Icon d="M6 6l12 12M6 18L18 6" s={16} />}
        title="Measurements"
        active={showMeasurements}
        theme={theme}
      />
      <div className="w-px h-5" style={{ background: theme.border }} />
      <IconButton
        onClick={() => setVisibilityMode(!visibilityMode)}
        icon={<Icon d={visibilityMode ? "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z" : "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22"} s={16} />}
        title="Fixed Size Mode (V) - Maintains icon size when zooming"
        active={visibilityMode}
        theme={theme}
      />
      {visibilityMode && (
        <select
          value={visibilityModeSize}
          onChange={(e) => setVisibilityModeSize(e.target.value)}
          className="px-2 py-1 rounded text-xs border ml-1"
          style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
          title="Icon size in Fixed Size Mode"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      )}
    </>
  );
};

export default PhysicalViewControls;
