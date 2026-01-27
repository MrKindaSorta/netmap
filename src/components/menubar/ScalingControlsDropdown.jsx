import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Icon } from './MenuBarButton';

const ScaleSlider = ({ label, scale, setScale, theme }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-xs" style={{ color: theme.text }}>{label}</span>
      <span className="text-xs font-medium" style={{ color: theme.text }}>{Math.round(scale * 100)}%</span>
    </div>
    <input
      type="range"
      min="50"
      max="250"
      value={scale * 100}
      onChange={(e) => setScale(e.target.value / 100)}
      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(scale * 100 - 50) / 2}%, ${theme.border} ${(scale * 100 - 50) / 2}%, ${theme.border} 100%)`
      }}
    />
  </div>
);

const ScalingControlsDropdown = ({
  circleScale,
  setCircleScale,
  deviceLabelScale,
  setDeviceLabelScale,
  portLabelScale,
  setPortLabelScale,
  viewMode,
  visibilityMode,
  theme
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isDisabled = viewMode === 'physical' && visibilityMode;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <IconButton
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        icon={<Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6" s={16} />}
        title={isDisabled ? "Disabled in Fixed Size Mode" : "Adjust scales (Ctrl+0)"}
        disabled={isDisabled}
        active={isOpen}
        theme={theme}
      />

      {isOpen && (
        <div
          className="absolute top-full mt-2 right-0 w-64 p-4 rounded-lg shadow-xl z-50"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`
          }}
        >
          <div className="space-y-4">
            <ScaleSlider
              label="Circles"
              scale={circleScale}
              setScale={setCircleScale}
              theme={theme}
            />
            <ScaleSlider
              label="Device Labels"
              scale={deviceLabelScale}
              setScale={setDeviceLabelScale}
              theme={theme}
            />
            <ScaleSlider
              label="Port Labels"
              scale={portLabelScale}
              setScale={setPortLabelScale}
              theme={theme}
            />
          </div>
          <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: theme.border, color: theme.textMuted }}>
            Keyboard shortcuts: ; {'/'}' {'/'}{'{'} {'/'}{'}'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScalingControlsDropdown;
