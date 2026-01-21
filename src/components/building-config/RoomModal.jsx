import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { genId } from '../../utils';

const ROOM_TYPES = {
  'Server Room': { color: '#3b82f620', icon: 'M4 4h16v16H4z' },
  'IDF': { color: '#8b5cf620', icon: 'M4 4h16v16H4z' },
  'Office': { color: '#10b98120', icon: 'M3 3h18v18H3z' },
  'Conference Room': { color: '#f59e0b20', icon: 'M4 4h16v12H4z' },
  'Lobby': { color: '#6366f120', icon: 'M3 3h18v18H3z' },
  'Storage': { color: '#78716c20', icon: 'M4 4h16v16H4z' },
  'Warehouse': { color: '#fef9c3', icon: 'M3 3h18v18H3z' },
  'Other': { color: '#e5e7eb', icon: 'M3 3h18v18H3z' }
};

const RoomModal = ({ room, buildingId, floorId, onClose, onSave, onDelete, theme }) => {
  const isEdit = !!room;

  const [name, setName] = useState(room?.name || '');
  const [roomType, setRoomType] = useState(room?.type || 'Office');
  const [width, setWidth] = useState(room?.width || 200);
  const [height, setHeight] = useState(room?.height || 150);
  const [color, setColor] = useState(room?.color || ROOM_TYPES['Office'].color);
  const [errors, setErrors] = useState({});

  // Auto-update color when room type changes (only if not manually changed)
  useEffect(() => {
    if (!isEdit || !room) {
      setColor(ROOM_TYPES[roomType]?.color || '#e5e7eb');
    }
  }, [roomType, isEdit, room]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Room name is required';
    if (width < 20) newErrors.width = 'Width must be at least 20';
    if (height < 20) newErrors.height = 'Height must be at least 20';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const roomData = {
      id: room?.id || genId('room'),
      name: name.trim(),
      type: roomType,
      x: room?.x || 100,
      y: room?.y || 100,
      width: Number(width),
      height: Number(height),
      color
    };

    onSave(buildingId, floorId, roomData);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${room.name}"?`)) {
      onDelete(buildingId, floorId, room.id);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Room' : 'Create Room'} onClose={onClose} theme={theme}>
      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Room Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Server Room, IDF Closet 1"
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

        {/* Room Type Selector */}
        <div>
          <label className="block text-sm font-medium mb-1">Room Type</label>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full px-3 py-2 rounded border"
            style={{
              background: theme.bg,
              borderColor: theme.border,
              color: theme.text
            }}
          >
            {Object.keys(ROOM_TYPES).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Width</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              min="20"
              className="w-full px-3 py-2 rounded border"
              style={{
                background: theme.bg,
                borderColor: errors.width ? '#ef4444' : theme.border,
                color: theme.text
              }}
            />
            {errors.width && (
              <p className="text-xs text-red-500 mt-1">{errors.width}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Height</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min="20"
              className="w-full px-3 py-2 rounded border"
              style={{
                background: theme.bg,
                borderColor: errors.height ? '#ef4444' : theme.border,
                color: theme.text
              }}
            />
            {errors.height && (
              <p className="text-xs text-red-500 mt-1">{errors.height}</p>
            )}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium mb-1">Room Color</label>
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
              placeholder="#3b82f620"
              className="flex-1 px-3 py-2 rounded border font-mono text-sm"
              style={{
                background: theme.bg,
                borderColor: theme.border,
                color: theme.text
              }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
            Use transparency (e.g., #rrggbbaa) for better visibility
          </p>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium mb-2">Preview</label>
          <div
            className="w-full flex items-center justify-center rounded border p-4"
            style={{
              background: theme.bg,
              borderColor: theme.border,
              minHeight: '120px'
            }}
          >
            <svg width="200" height="150">
              <rect
                x="50"
                y="25"
                width={Math.min(width / 2, 100)}
                height={Math.min(height / 2, 100)}
                fill={color}
                stroke={theme.border}
                strokeDasharray="4,2"
                strokeWidth="2"
              />
              <text
                x="100"
                y="80"
                textAnchor="middle"
                fontSize="10"
                fill={theme.textMuted}
              >
                {name || 'Room Preview'}
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
            {isEdit ? 'Save Changes' : 'Create Room'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RoomModal;
