import React from 'react';
import Icon from '../common/Icon';

/**
 * Device Suggestion Card Component
 * Displays AI-detected device with approval buttons
 */
const DeviceSuggestionCard = ({
  suggestionData,
  onAddDevice,
  onDecline,
  theme,
  deviceTypes,
  getDevColor
}) => {
  const { device, connections, reasoning, confidence } = suggestionData;

  // Find device type info
  const deviceTypeInfo = deviceTypes.find(dt => dt.value === device.type);

  return (
    <div
      className="rounded-lg p-3 mb-2 border-2"
      style={{
        background: theme.surface,
        borderColor: '#3b82f6'
      }}
    >
      {/* Device Card */}
      <div className="flex items-start gap-3 mb-2">
        {/* Device Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: getDevColor({ type: device.type }) + '20'
          }}
        >
          {deviceTypeInfo && (
            <Icon
              d={deviceTypeInfo.icon}
              s={20}
              color={getDevColor({ type: device.type })}
            />
          )}
        </div>

        {/* Device Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{device.name}</div>
          <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
            {deviceTypeInfo?.label || device.type}
            {device.hardware?.manufacturer && (
              <>
                {' • '}
                {device.hardware.manufacturer}
                {device.hardware.model && ` ${device.hardware.model}`}
              </>
            )}
          </div>
          {device.ip && (
            <div
              className="text-xs font-mono mt-1"
              style={{ color: theme.textMuted }}
            >
              IP: {device.ip}
            </div>
          )}

          {/* Connections */}
          {connections && connections.length > 0 && (
            <div className="text-xs mt-2" style={{ color: theme.textMuted }}>
              <div className="font-medium mb-1">Connections:</div>
              {connections.map((conn, i) => (
                <div key={i} className="ml-2 truncate">
                  • {conn.fromPort || 'Port'} → {conn.toDeviceName} ({conn.toPort || 'Port'})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confidence Badge */}
        <div
          className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0"
          style={{
            background:
              confidence === 'high'
                ? '#10b98120'
                : confidence === 'medium'
                ? '#f9731620'
                : '#ef444420',
            color:
              confidence === 'high'
                ? '#10b981'
                : confidence === 'medium'
                ? '#f97316'
                : '#ef4444'
          }}
        >
          {confidence} confidence
        </div>
      </div>

      {/* Reasoning */}
      {reasoning && (
        <div
          className="text-xs p-2 rounded mb-2"
          style={{ background: theme.bg, color: theme.textMuted }}
        >
          <span className="font-medium">Detection reasoning:</span> {reasoning}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onAddDevice}
          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
          style={{ background: '#3b82f6', color: '#ffffff' }}
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Device
          </div>
        </button>
        <button
          onClick={onDecline}
          className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
          style={{
            background: 'transparent',
            color: theme.textMuted,
            border: `1px solid ${theme.border}`
          }}
        >
          No Thanks
        </button>
      </div>
    </div>
  );
};

export default DeviceSuggestionCard;
