import React from 'react';
import { getDevColor, deviceTypes, statusColors } from '../../constants';

const DevNode = ({
  device,
  isSelected,
  isHighlighted,
  isConnecting,
  isValidTarget,
  highlightedPath,
  theme,
  circleScale,
  deviceLabelScale,
  isPhysical,
  visibilityMode,
  visibilityModeSize,
  zoom,
  onMouseDown,
  onDoubleClick,
  onContextMenu
}) => {
  const d = device;
  const col = getDevColor(d);
  const stCol = statusColors[d.status] || statusColors.unknown;
  const ti = deviceTypes.find(t => t.value === d.type);
  const [x, y] = isPhysical ? [d.physicalX, d.physicalY] : [d.x, d.y];

  // Calculate counter-scale for visibility mode
  const minZoom = 0.15;
  const maxCounterScale = 1 / minZoom;

  // Visibility mode size multipliers: small=1x, medium=2x, large=3x
  const visModeSizeMultiplier = visibilityModeSize === 'large' ? 3 : visibilityModeSize === 'medium' ? 2 : 1;
  const screenSizeScale = (isPhysical && visibilityMode) ? Math.min((1 / zoom) * visModeSizeMultiplier, maxCounterScale) : 1;

  // Base size - scale transform will handle visibility mode sizing
  const sz = (isPhysical ? 20 : 32) * circleScale;
  const maxChars = Math.floor((isPhysical ? 6 : 10) * circleScale);
  const truncateAt = Math.floor((isPhysical ? 5 : 8) * circleScale);
  const isLocked = d.locked;

  // Calculate opacity for dimming non-highlighted elements
  const opacity = (highlightedPath && !isHighlighted) ? 0.35 : 1;

  return (
    <g
      transform={`translate(${x},${y}) scale(${screenSizeScale})`}
      onMouseDown={(e) => onMouseDown(e, d.id)}
      onDoubleClick={() => onDoubleClick(d.id)}
      onContextMenu={(e) => onContextMenu(e, d.id)}
      style={{ cursor: isLocked ? 'default' : 'move' }}
      opacity={opacity}
    >
      {/* Pulsing glow when highlighted */}
      {isHighlighted && (
        <circle r={sz + 8} fill={col} opacity="0.3">
          <animate
            attributeName="r"
            values={`${sz + 6};${sz + 12};${sz + 6}`}
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.4;0.2"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Valid target glow (when in connection mode) */}
      {isValidTarget && (
        <circle r={sz + 8} fill="#22c55e" opacity="0.3">
          <animate
            attributeName="opacity"
            values="0.2;0.4;0.2"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Connecting animation */}
      {isConnecting && (
        <circle r={sz + 10} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3">
          <animate
            attributeName="r"
            values={`${sz + 6};${sz + 14};${sz + 6}`}
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Selection/highlight background */}
      {(isSelected || isHighlighted) && (
        <circle r={sz + 4} fill={col} opacity={isHighlighted ? "0.4" : "0.2"} />
      )}

      {/* Main device circle */}
      <circle
        r={sz}
        fill={isSelected ? col : theme.surface}
        stroke={col}
        strokeWidth={isSelected ? 3 : 2}
      />

      {/* Status indicator */}
      <circle
        cx={sz * 0.6}
        cy={-sz * 0.6}
        r={isPhysical ? 3 : 5}
        fill={stCol}
        stroke={theme.surface}
        strokeWidth="1.5"
      />

      {/* Device icon */}
      <g style={{ color: isSelected ? '#fff' : col }}>
        <svg
          x={-sz / 3}
          y={-sz / 1.8}
          width={sz * 0.7}
          height={sz * 0.7}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={ti?.icon || ''} />
        </svg>
      </g>

      {/* Labels (only show if not in path or if highlighted) */}
      {(!highlightedPath || isHighlighted) && (
        <>
          {/* Device name */}
          <text
            y={sz * 0.55}
            textAnchor="middle"
            fontSize={Math.max(6, (isPhysical ? 7 : 9) * deviceLabelScale)}
            fontWeight="600"
            fill={isSelected ? '#fff' : theme.text}
          >
            {d.name.length > maxChars ? d.name.substring(0, truncateAt) + '…' : d.name}
          </text>

          {/* IP address (logical view only) */}
          {!isPhysical && d.ip && (
            <text
              y={sz * 0.8}
              textAnchor="middle"
              fontSize="7"
              fill={isSelected ? 'rgba(255,255,255,0.7)' : theme.textMuted}
            >
              {d.ip}
            </text>
          )}

          {/* Root badge */}
          {d.isRoot && !isPhysical && (
            <g transform={`translate(0,${-sz - 12})`}>
              <rect x="-18" y="-7" width="36" height="12" fill="#22c55e" rx="6" />
              <text textAnchor="middle" y="2" fontSize="7" fill="#fff" fontWeight="600">
                ★ ROOT
              </text>
            </g>
          )}

          {/* WAN badge */}
          {d.type === 'wan' && !isPhysical && (
            <g transform={`translate(0,${-sz - 12})`}>
              <rect x="-18" y="-7" width="36" height="12" fill="#16a34a" rx="6" />
              <text textAnchor="middle" y="2" fontSize="7" fill="#fff" fontWeight="600">
                ⬆ WAN
              </text>
            </g>
          )}
        </>
      )}
    </g>
  );
};

// Custom comparison function for React.memo
const areEqual = (prevProps, nextProps) => {
  const d1 = prevProps.device;
  const d2 = nextProps.device;

  return (
    d1.id === d2.id &&
    d1.name === d2.name &&
    d1.type === d2.type &&
    d1.ip === d2.ip &&
    d1.status === d2.status &&
    d1.x === d2.x &&
    d1.y === d2.y &&
    d1.physicalX === d2.physicalX &&
    d1.physicalY === d2.physicalY &&
    d1.isRoot === d2.isRoot &&
    d1.locked === d2.locked &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.isConnecting === nextProps.isConnecting &&
    prevProps.isValidTarget === nextProps.isValidTarget &&
    prevProps.circleScale === nextProps.circleScale &&
    prevProps.deviceLabelScale === nextProps.deviceLabelScale &&
    prevProps.isPhysical === nextProps.isPhysical &&
    prevProps.visibilityMode === nextProps.visibilityMode &&
    prevProps.visibilityModeSize === nextProps.visibilityModeSize &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.theme === nextProps.theme &&
    (prevProps.highlightedPath === nextProps.highlightedPath ||
      (prevProps.highlightedPath?.devices.has(d1.id) === nextProps.highlightedPath?.devices.has(d2.id)))
  );
};

export default React.memo(DevNode, areEqual);
