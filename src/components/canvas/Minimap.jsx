import React, { useMemo } from 'react';
import { getDevColor } from '../../constants';

const Minimap = ({
  devices,
  connections,
  selectedDevices,
  pan,
  zoom,
  svgRef,
  theme
}) => {
  const allDevices = Object.values(devices);

  // Memoize bounds calculation
  const bounds = useMemo(() => {
    if (allDevices.length === 0) return null;

    const minX = Math.min(...allDevices.map(d => d.x)) - 50;
    const maxX = Math.max(...allDevices.map(d => d.x)) + 50;
    const minY = Math.min(...allDevices.map(d => d.y)) - 50;
    const maxY = Math.max(...allDevices.map(d => d.y)) + 50;
    const width = maxX - minX || 100;
    const height = maxY - minY || 100;
    const scale = Math.min(140 / width, 100 / height);

    return { minX, minY, width, height, scale };
  }, [allDevices]);

  if (!bounds) return null;

  const { minX, minY, width, height, scale } = bounds;

  // Get actual viewport dimensions
  const svgWidth = svgRef.current?.clientWidth || 800;
  const svgHeight = svgRef.current?.clientHeight || 600;

  return (
    <div
      className="absolute bottom-4 right-80 rounded-lg shadow-lg p-2 border"
      style={{ background: theme.surface, borderColor: theme.border }}
    >
      <svg width="150" height="110" style={{ background: theme.bg, borderRadius: 4 }}>
        <g
          transform={`translate(${5 + (140 - width * scale) / 2}, ${5 + (100 - height * scale) / 2}) scale(${scale})`}
        >
          {/* Connections */}
          {Object.values(connections).map(conn => {
            const from = devices[conn.from];
            const to = devices[conn.to];
            if (!from || !to) return null;
            return (
              <line
                key={conn.id}
                x1={from.x - minX}
                y1={from.y - minY}
                x2={to.x - minX}
                y2={to.y - minY}
                stroke={theme.textMuted}
                strokeWidth={1 / scale}
                opacity="0.5"
              />
            );
          })}

          {/* Devices */}
          {allDevices.map(d => (
            <circle
              key={d.id}
              cx={d.x - minX}
              cy={d.y - minY}
              r={4 / scale}
              fill={selectedDevices.has(d.id) ? '#3b82f6' : getDevColor(d)}
            />
          ))}
        </g>

        {/* Viewport rectangle */}
        <rect
          x={(-pan.x / zoom - minX) * scale + 5}
          y={(-pan.y / zoom - minY) * scale + 5}
          width={svgWidth / zoom * scale}
          height={svgHeight / zoom * scale}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
    </div>
  );
};

// Custom comparison function for React.memo
const areEqual = (prevProps, nextProps) => {
  // Check if device positions changed
  const prevDevices = Object.values(prevProps.devices);
  const nextDevices = Object.values(nextProps.devices);

  if (prevDevices.length !== nextDevices.length) return false;

  // Check if any device positions changed
  const positionsChanged = prevDevices.some((prevDev, idx) => {
    const nextDev = nextDevices[idx];
    return prevDev?.x !== nextDev?.x || prevDev?.y !== nextDev?.y || prevDev?.id !== nextDev?.id;
  });

  if (positionsChanged) return false;

  // Check if connections changed
  if (Object.keys(prevProps.connections).length !== Object.keys(nextProps.connections).length) {
    return false;
  }

  // Check if selection changed
  if (prevProps.selectedDevices.size !== nextProps.selectedDevices.size) return false;
  for (const id of prevProps.selectedDevices) {
    if (!nextProps.selectedDevices.has(id)) return false;
  }

  // Check if pan/zoom changed
  if (
    prevProps.pan.x !== nextProps.pan.x ||
    prevProps.pan.y !== nextProps.pan.y ||
    prevProps.zoom !== nextProps.zoom
  ) {
    return false;
  }

  // Check if theme changed
  if (prevProps.theme !== nextProps.theme) return false;

  return true;
};

export default React.memo(Minimap, areEqual);
