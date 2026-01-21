import React from 'react';

const BuildingThumb = ({
  building,
  devices,
  isSelected,
  isDragging,
  theme,
  onBuildingClick,
  onDoubleClick,
  onMouseDown,
  onContextMenu
}) => {
  const b = building;
  const isLocked = b.locked;

  return (
    <g
      transform={`translate(${b.x},${b.y})`}
      onClick={() => onBuildingClick(b.id)}
      onDoubleClick={() => onDoubleClick(b.id)}
      onMouseDown={(e) => onMouseDown(e, b.id)}
      onContextMenu={(e) => onContextMenu(e, b.id)}
      style={{
        cursor: isLocked ? 'default' : (isDragging ? 'grabbing' : 'grab')
      }}
    >
      <rect
        width={b.width}
        height={b.height}
        fill={b.color}
        stroke={isSelected ? '#3b82f6' : theme.border}
        strokeWidth={isSelected ? 3 : 1}
        rx="4"
      />

      <text
        x={b.width / 2}
        y={-6}
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill={theme.text}
      >
        {b.name}
      </text>

      <text
        x={b.width / 2}
        y={b.height / 2}
        textAnchor="middle"
        fontSize="9"
        fill={theme.textMuted}
      >
        {Object.values(devices).filter(d => d.buildingId === b.id).length} devices
      </text>

      {isLocked && (
        <g transform={`translate(${b.width - 20}, 5)`}>
          <circle cx="8" cy="8" r="8" fill="#ef4444" opacity="0.9" />
          <path
            d="M8 4a2 2 0 012 2v1h-4V6a2 2 0 012-2zm3 4V6a3 3 0 00-6 0v2H4v6h8V8h-1z"
            fill="white"
            transform="scale(0.5) translate(4,0)"
          />
        </g>
      )}
    </g>
  );
};

// Custom comparison function for React.memo
const areEqual = (prevProps, nextProps) => {
  const b1 = prevProps.building;
  const b2 = nextProps.building;

  return (
    b1.id === b2.id &&
    b1.name === b2.name &&
    b1.x === b2.x &&
    b1.y === b2.y &&
    b1.width === b2.width &&
    b1.height === b2.height &&
    b1.color === b2.color &&
    b1.locked === b2.locked &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.theme === nextProps.theme &&
    // Only re-render if device count changes
    Object.values(prevProps.devices).filter(d => d.buildingId === b1.id).length ===
    Object.values(nextProps.devices).filter(d => d.buildingId === b2.id).length
  );
};

export default React.memo(BuildingThumb, areEqual);
