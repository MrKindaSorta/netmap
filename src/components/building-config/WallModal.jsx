import React, { useState } from 'react';
import Modal from '../common/Modal';

const WALL_TYPES = {
  'Interior': { thickness: 3, color: '#64748b' },
  'Exterior': { thickness: 5, color: '#1e293b' },
  'Load-Bearing': { thickness: 6, color: '#0f172a' }
};

const WallModal = ({ wall, buildingId, floorId, onClose, onSave, onDelete, theme }) => {
  const [wallType, setWallType] = useState(wall?.type || 'Interior');
  const [thickness, setThickness] = useState(wall?.thickness || 3);

  const handleSave = () => {
    const wallData = {
      ...wall,
      type: wallType,
      thickness: Number(thickness)
    };
    onSave(buildingId, floorId, wallData);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this wall?')) {
      onDelete(buildingId, floorId, wall.id);
    }
  };

  return (
    <Modal title="Edit Wall" onClose={onClose} theme={theme}>
      <div className="space-y-4">
        {/* Wall Type Selector */}
        <div>
          <label className="block text-sm font-medium mb-1">Wall Type</label>
          <select
            value={wallType}
            onChange={(e) => {
              setWallType(e.target.value);
              setThickness(WALL_TYPES[e.target.value].thickness);
            }}
            className="w-full px-3 py-2 rounded border"
            style={{
              background: theme.bg,
              borderColor: theme.border,
              color: theme.text
            }}
          >
            {Object.keys(WALL_TYPES).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Thickness Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Wall Thickness (pixels)
          </label>
          <input
            type="number"
            value={thickness}
            onChange={(e) => setThickness(e.target.value)}
            min="1"
            max="10"
            className="w-full px-3 py-2 rounded border"
            style={{
              background: theme.bg,
              borderColor: theme.border,
              color: theme.text
            }}
          />
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium mb-2">Preview</label>
          <div
            className="w-full flex items-center justify-center rounded border p-4"
            style={{
              background: theme.bg,
              borderColor: theme.border,
              minHeight: '80px'
            }}
          >
            <svg width="200" height="60">
              <line
                x1="20"
                y1="30"
                x2="180"
                y2="30"
                stroke={WALL_TYPES[wallType].color}
                strokeWidth={thickness}
              />
            </svg>
          </div>
        </div>

        {/* Wall Info */}
        <div
          className="p-3 rounded text-xs"
          style={{
            background: theme.bg,
            border: `1px solid ${theme.border}`
          }}
        >
          <div className="flex justify-between mb-1">
            <span style={{ color: theme.textMuted }}>Start Point:</span>
            <span>({Math.round(wall.x1)}, {Math.round(wall.y1)})</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: theme.textMuted }}>End Point:</span>
            <span>({Math.round(wall.x2)}, {Math.round(wall.y2)})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded font-medium bg-red-600 text-white hover:bg-red-700"
          >
            Delete Wall
          </button>
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
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WallModal;
