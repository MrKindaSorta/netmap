import React from 'react';
import { getConnStyle } from '../../constants';

const ConnLine = ({
  connection,
  fromDevice,
  toDevice,
  isSelected,
  isHovered,
  isHighlighted,
  highlightedPath,
  theme,
  circleScale,
  portLabelScale,
  isPhysical,
  showMeasurements,
  measurementUnit,
  onConnClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  onContextMenu
}) => {
  if (!fromDevice || !toDevice) return null;

  const c = connection;
  const st = getConnStyle(c.type);
  const [x1, y1] = isPhysical ? [fromDevice.physicalX, fromDevice.physicalY] : [fromDevice.x, fromDevice.y];
  const [x2, y2] = isPhysical ? [toDevice.physicalX, toDevice.physicalY] : [toDevice.x, toDevice.y];
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // Dynamic port label offset calculation
  const baseCircleRadius = isPhysical ? 20 : 32;
  const scaledRadius = baseCircleRadius * circleScale;
  const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const minDistance = scaledRadius + 20;
  const dynamicOffset = Math.max(0.2, minDistance / lineLength);
  const offset = Math.min(dynamicOffset, 0.45);

  const getUnit = () => (measurementUnit === 'metric' ? 'm' : 'ft');

  return (
    <g
      onClick={(e) => onConnClick(e, c.id)}
      onDoubleClick={() => onDoubleClick(c.id)}
      onMouseEnter={() => onMouseEnter(c.id)}
      onMouseLeave={() => onMouseLeave()}
      onContextMenu={(e) => onContextMenu(e, c.id)}
      style={{ cursor: 'pointer' }}
    >
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="14" />

      {/* Pulsing glow when highlighted */}
      {isHighlighted && (
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={st.color} strokeWidth={6} opacity="0.4">
          <animate attributeName="stroke-width" values="4;8;4" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
        </line>
      )}

      {(isSelected || isHovered) && (
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={st.color} strokeWidth="8" opacity="0.2" />
      )}

      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isHighlighted ? st.color : (isSelected || isHovered ? '#3b82f6' : st.color)}
        strokeWidth={isHighlighted ? 4 : (c.type === 'lacp' ? 4 : 2)}
        strokeDasharray={st.dash}
        opacity={isHighlighted ? 1 : undefined}
      />

      {/* From port label */}
      {!isPhysical && (c.fromPort || isHovered) && (!highlightedPath || isHighlighted) && (
        <g transform={`translate(${x1 + (x2 - x1) * offset}, ${y1 + (y2 - y1) * offset})`}>
          <rect
            x={-18 * portLabelScale}
            y="-9"
            width={36 * portLabelScale}
            height="16"
            fill={theme.surface}
            rx="3"
            stroke={st.color}
            strokeWidth="1"
          />
          <text
            textAnchor="middle"
            y="3"
            fontSize={Math.max(6, 9 * portLabelScale)}
            fill={theme.text}
            fontFamily="monospace"
          >
            {c.fromPort || '—'}
          </text>
        </g>
      )}

      {/* To port label */}
      {!isPhysical && (c.toPort || isHovered) && (!highlightedPath || isHighlighted) && (
        <g transform={`translate(${x2 - (x2 - x1) * offset}, ${y2 - (y2 - y1) * offset})`}>
          <rect
            x={-18 * portLabelScale}
            y="-9"
            width={36 * portLabelScale}
            height="16"
            fill={theme.surface}
            rx="3"
            stroke={st.color}
            strokeWidth="1"
          />
          <text
            textAnchor="middle"
            y="3"
            fontSize={Math.max(6, 9 * portLabelScale)}
            fill={theme.text}
            fontFamily="monospace"
          >
            {c.toPort || '—'}
          </text>
        </g>
      )}

      {/* Speed badge */}
      {!isPhysical && c.speed && (
        <g transform={`translate(${mx},${my})`}>
          <rect x="-14" y="-8" width="28" height="14" fill={st.color} rx="7" />
          <text textAnchor="middle" y="3" fontSize="8" fill="white" fontWeight="600">
            {c.speed}
          </text>
        </g>
      )}

      {/* VLANs on hover */}
      {!isPhysical && isHovered && c.vlans?.length > 0 && (
        <g transform={`translate(${mx}, ${my + 20})`}>
          <rect
            x={-c.vlans.length * 14}
            y="-8"
            width={c.vlans.length * 28}
            height="16"
            fill={theme.surface}
            rx="4"
            stroke={theme.border}
          />
          <text textAnchor="middle" y="4" fontSize="8" fill={theme.textMuted}>
            VLANs: {c.vlans.join(', ')}
          </text>
        </g>
      )}

      {/* Cable length in physical view */}
      {isPhysical && showMeasurements && c.cableLength > 0 && (
        <g transform={`translate(${mx},${my})`}>
          <rect x="-20" y="-8" width="40" height="14" fill={theme.surface} stroke={st.color} rx="4" />
          <text textAnchor="middle" y="3" fontSize="8" fill={theme.text}>
            {c.cableLength}{getUnit()}
          </text>
        </g>
      )}
    </g>
  );
};

// Custom comparison function for React.memo
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.connection.id === nextProps.connection.id &&
    prevProps.connection.type === nextProps.connection.type &&
    prevProps.connection.fromPort === nextProps.connection.fromPort &&
    prevProps.connection.toPort === nextProps.connection.toPort &&
    prevProps.connection.speed === nextProps.connection.speed &&
    prevProps.connection.cableLength === nextProps.connection.cableLength &&
    JSON.stringify(prevProps.connection.vlans) === JSON.stringify(nextProps.connection.vlans) &&
    prevProps.fromDevice?.x === nextProps.fromDevice?.x &&
    prevProps.fromDevice?.y === nextProps.fromDevice?.y &&
    prevProps.fromDevice?.physicalX === nextProps.fromDevice?.physicalX &&
    prevProps.fromDevice?.physicalY === nextProps.fromDevice?.physicalY &&
    prevProps.toDevice?.x === nextProps.toDevice?.x &&
    prevProps.toDevice?.y === nextProps.toDevice?.y &&
    prevProps.toDevice?.physicalX === nextProps.toDevice?.physicalX &&
    prevProps.toDevice?.physicalY === nextProps.toDevice?.physicalY &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.circleScale === nextProps.circleScale &&
    prevProps.portLabelScale === nextProps.portLabelScale &&
    prevProps.isPhysical === nextProps.isPhysical &&
    prevProps.showMeasurements === nextProps.showMeasurements &&
    prevProps.measurementUnit === nextProps.measurementUnit &&
    prevProps.theme === nextProps.theme
  );
};

export default React.memo(ConnLine, areEqual);
