import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { genId } from '../../utils';

// Conversion factors: 10 pixels = 1 foot, 32.8 pixels = 1 meter
const PX_PER_FOOT = 10;
const PX_PER_METER = 32.8;

const BuildingModal = ({ building, onClose, onSave, onDelete, theme }) => {
  const isEdit = !!building;

  const [name, setName] = useState(building?.name || '');
  const [unit, setUnit] = useState('feet');

  // Convert initial dimensions from pixels to the selected unit
  const getConversionFactor = (unitType) => {
    switch(unitType) {
      case 'feet': return PX_PER_FOOT;
      case 'meters': return PX_PER_METER;
      default: return 1; // pixels
    }
  };

  const initialWidth = building?.width || 800;
  const initialHeight = building?.height || 600;

  const [width, setWidth] = useState(
    unit === 'pixels' ? initialWidth : Math.round(initialWidth / getConversionFactor(unit))
  );
  const [height, setHeight] = useState(
    unit === 'pixels' ? initialHeight : Math.round(initialHeight / getConversionFactor(unit))
  );

  const [color, setColor] = useState(building?.color || '#f1f5f9');
  const [locked, setLocked] = useState(building?.locked || false);
  const [floorName, setFloorName] = useState(
    building?.floors?.[0]?.name || 'Ground Floor'
  );
  const [errors, setErrors] = useState({});

  // Update dimensions when unit changes
  const currentWidthInPixels = unit === 'pixels' ? width : width * getConversionFactor(unit);
  const currentHeightInPixels = unit === 'pixels' ? height : height * getConversionFactor(unit);

  const handleUnitChange = (newUnit) => {
    const oldFactor = getConversionFactor(unit);
    const newFactor = getConversionFactor(newUnit);

    // Convert current values to new unit
    const widthInPixels = unit === 'pixels' ? width : width * oldFactor;
    const heightInPixels = unit === 'pixels' ? height : height * oldFactor;

    setWidth(newUnit === 'pixels' ? widthInPixels : Math.round(widthInPixels / newFactor));
    setHeight(newUnit === 'pixels' ? heightInPixels : Math.round(heightInPixels / newFactor));
    setUnit(newUnit);
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Building name is required';
    const minDimension = unit === 'pixels' ? 100 : unit === 'feet' ? 10 : 3;
    if (width < minDimension) newErrors.width = `Width must be at least ${minDimension}`;
    if (height < minDimension) newErrors.height = `Height must be at least ${minDimension}`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Convert dimensions to pixels for storage
    const widthInPixels = unit === 'pixels' ? Number(width) : Math.round(Number(width) * getConversionFactor(unit));
    const heightInPixels = unit === 'pixels' ? Number(height) : Math.round(Number(height) * getConversionFactor(unit));

    const buildingData = {
      id: building?.id || genId('bld'),
      name: name.trim(),
      x: building?.x || 50,
      y: building?.y || 50,
      width: widthInPixels,
      height: heightInPixels,
      color,
      locked,
      floors: building?.floors || [
        {
          id: 1,
          name: floorName.trim() || 'Ground Floor',
          rooms: [],
          walls: []
        }
      ]
    };

    onSave(buildingData);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${building.name}"? All devices will be unassigned from this building.`)) {
      onDelete(building.id);
    }
  };

  const previewScale = Math.min(200 / currentWidthInPixels, 150 / currentHeightInPixels);

  return (
    <Modal title={isEdit ? 'Edit Building' : 'Create Building'} onClose={onClose} theme={theme}>
      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Building Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Main Office, Warehouse"
            className="w-full px-3 py-2 rounded border"
            style={{
              background: theme.bg,
              borderColor: errors.name ? '#ef4444' : theme.border,
              color: theme.text
            }}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Unit Selector */}
        <div>
          <label className="block text-sm font-medium mb-1">Measurement Unit</label>
          <select
            value={unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="w-full px-3 py-2 rounded border"
            style={{
              background: theme.bg,
              borderColor: theme.border,
              color: theme.text
            }}
          >
            <option value="pixels">Pixels (for precise control)</option>
            <option value="feet">Feet</option>
            <option value="meters">Meters</option>
          </select>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Width
            </label>
            <div className="relative">
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                min={unit === 'pixels' ? 100 : unit === 'feet' ? 10 : 3}
                step="1"
                className="w-full px-3 py-2 pr-12 rounded border"
                style={{
                  background: theme.bg,
                  borderColor: errors.width ? '#ef4444' : theme.border,
                  color: theme.text
                }}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: theme.textMuted }}
              >
                {unit === 'pixels' ? 'px' : unit === 'feet' ? 'ft' : 'm'}
              </span>
            </div>
            {errors.width && (
              <p className="text-xs text-red-500 mt-1">{errors.width}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Height
            </label>
            <div className="relative">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min={unit === 'pixels' ? 100 : unit === 'feet' ? 10 : 3}
                step="1"
                className="w-full px-3 py-2 pr-12 rounded border"
                style={{
                  background: theme.bg,
                  borderColor: errors.height ? '#ef4444' : theme.border,
                  color: theme.text
                }}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: theme.textMuted }}
              >
                {unit === 'pixels' ? 'px' : unit === 'feet' ? 'ft' : 'm'}
              </span>
            </div>
            {errors.height && (
              <p className="text-xs text-red-500 mt-1">{errors.height}</p>
            )}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium mb-1">Building Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 rounded border cursor-pointer"
              style={{ borderColor: theme.border }}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#f1f5f9"
              className="flex-1 px-3 py-2 rounded border font-mono text-sm"
              style={{
                background: theme.bg,
                borderColor: theme.border,
                color: theme.text
              }}
            />
          </div>
        </div>

        {/* Lock Toggle */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={locked}
              onChange={(e) => setLocked(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <div>
              <span className="text-sm font-medium">Lock Building Position</span>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Prevent accidental dragging and repositioning
              </p>
            </div>
          </label>
        </div>

        {/* Floor Name (only for new buildings) */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium mb-1">
              First Floor Name
            </label>
            <input
              type="text"
              value={floorName}
              onChange={(e) => setFloorName(e.target.value)}
              placeholder="e.g., Ground Floor, Floor 1"
              className="w-full px-3 py-2 rounded border"
              style={{
                background: theme.bg,
                borderColor: theme.border,
                color: theme.text
              }}
            />
          </div>
        )}

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium mb-2">Preview</label>
          <div
            className="w-full flex items-center justify-center rounded border p-4"
            style={{
              background: theme.bg,
              borderColor: theme.border,
              minHeight: '180px'
            }}
          >
            <svg
              width={currentWidthInPixels * previewScale}
              height={currentHeightInPixels * previewScale}
              className="border"
              style={{ borderColor: theme.border }}
            >
              <rect
                width={currentWidthInPixels * previewScale}
                height={currentHeightInPixels * previewScale}
                fill={color}
                stroke={theme.border}
                strokeWidth="2"
                rx="4"
              />
              <text
                x={(currentWidthInPixels * previewScale) / 2}
                y={(currentHeightInPixels * previewScale) / 2}
                textAnchor="middle"
                fontSize="12"
                fill={theme.textMuted}
              >
                {name || 'Building Preview'}
              </text>
              <text
                x={(currentWidthInPixels * previewScale) / 2}
                y={(currentHeightInPixels * previewScale) + 15}
                textAnchor="middle"
                fontSize="10"
                fill={theme.textMuted}
              >
                {width} {unit} × {height} {unit}
              </text>
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isEdit && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded font-medium bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded font-medium"
            style={{
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              color: theme.text
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            {isEdit ? 'Save Changes' : 'Create Building'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BuildingModal;
