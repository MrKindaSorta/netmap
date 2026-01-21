import React from 'react';

const HANDLE_SIZE = 8;

const SelectionHandles = ({ room, onResizeStart, theme }) => {
  const handles = [
    { id: 'nw', x: 0, y: 0, cursor: 'nwse-resize' },
    { id: 'n', x: room.width / 2, y: 0, cursor: 'ns-resize' },
    { id: 'ne', x: room.width, y: 0, cursor: 'nesw-resize' },
    { id: 'e', x: room.width, y: room.height / 2, cursor: 'ew-resize' },
    { id: 'se', x: room.width, y: room.height, cursor: 'nwse-resize' },
    { id: 's', x: room.width / 2, y: room.height, cursor: 'ns-resize' },
    { id: 'sw', x: 0, y: room.height, cursor: 'nesw-resize' },
    { id: 'w', x: 0, y: room.height / 2, cursor: 'ew-resize' }
  ];

  return (
    <g>
      {/* Selection border */}
      <rect
        x={-2}
        y={-2}
        width={room.width + 4}
        height={room.height + 4}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="4,4"
        pointerEvents="none"
      />

      {/* Resize handles */}
      {handles.map(handle => (
        <rect
          key={handle.id}
          x={handle.x - HANDLE_SIZE / 2}
          y={handle.y - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="#3b82f6"
          stroke="white"
          strokeWidth="1"
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(room.id, handle.id, e);
          }}
        />
      ))}
    </g>
  );
};

export default SelectionHandles;
