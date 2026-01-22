import React, { useState } from 'react';
import Icon from '../common/Icon';

const BatchDeviceSuggestion = ({
  batchData,
  onApproveAll,
  onDeclineAll,
  theme,
  deviceTypes,
  getDevColor
}) => {
  const [expandedDevices, setExpandedDevices] = useState({});
  const { suggestions, messageText } = batchData;

  const toggleDevice = (idx) => {
    setExpandedDevices(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Calculate aggregate confidence (lowest)
  const lowestConfidence = suggestions.reduce((lowest, s) => {
    const confidenceRank = { high: 3, medium: 2, low: 1 };
    return confidenceRank[s.confidence] < confidenceRank[lowest] ? s.confidence : lowest;
  }, 'high');

  return (
    <div
      className="border-2 rounded-lg p-4 mb-3"
      style={{ background: theme.bg, borderColor: '#3b82f6' }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#3b82f620', color: '#3b82f6' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">
            {suggestions.length} Devices Detected
          </h4>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {messageText}
          </p>
        </div>
        <div
          className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0"
          style={{
            background: lowestConfidence === 'high' ? '#10b98120' : lowestConfidence === 'medium' ? '#f9731620' : '#ef444420',
            color: lowestConfidence === 'high' ? '#10b981' : lowestConfidence === 'medium' ? '#f97316' : '#ef4444'
          }}
        >
          {lowestConfidence} confidence
        </div>
      </div>

      {/* Device List */}
      <div className="mb-3 space-y-2 max-h-[400px] overflow-y-auto">
        {suggestions.map((suggestion, idx) => {
          const { device, connections, confidence } = suggestion;
          const deviceTypeInfo = deviceTypes.find(dt => dt.value === device.type);
          const isExpanded = expandedDevices[idx];

          return (
            <div
              key={idx}
              className="border rounded p-2"
              style={{ borderColor: theme.border, background: theme.surface }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: getDevColor({ type: device.type }) + '20' }}
                >
                  {deviceTypeInfo && (
                    <Icon d={deviceTypeInfo.icon} s={16} color={getDevColor({ type: device.type })} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{device.name}</div>
                  <div className="text-xs" style={{ color: theme.textMuted }}>
                    {deviceTypeInfo?.label || device.type}
                    {device.ip && ` • ${device.ip}`}
                    {connections && connections.length > 0 && ` • ${connections.length} connection${connections.length > 1 ? 's' : ''}`}
                  </div>
                </div>
                {suggestions.length > 3 && (
                  <button
                    onClick={() => toggleDevice(idx)}
                    className="text-xs px-2 py-1 rounded hover:opacity-80"
                    style={{ background: theme.bg, color: theme.textMuted }}
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                )}
              </div>

              {/* Expanded Details */}
              {(isExpanded || suggestions.length <= 3) && (
                <div className="mt-2 ml-10 space-y-1">
                  {device.hardware?.manufacturer && (
                    <div className="text-xs" style={{ color: theme.textMuted }}>
                      <span className="font-medium">Hardware:</span> {device.hardware.manufacturer}
                      {device.hardware.model && ` ${device.hardware.model}`}
                    </div>
                  )}
                  {connections && connections.length > 0 && (
                    <div className="text-xs" style={{ color: theme.textMuted }}>
                      <div className="font-medium">Connections:</div>
                      {connections.map((conn, i) => (
                        <div key={i} className="ml-2 truncate">
                          • {conn.fromPort || 'Port'} → {conn.toDeviceName} ({conn.toPort || 'Port'})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onApproveAll}
          className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
          style={{ background: '#10b981', color: '#ffffff' }}
        >
          <div className="flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Add All {suggestions.length} Devices
          </div>
        </button>
        <button
          onClick={onDeclineAll}
          className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-80"
          style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Decline All
          </div>
        </button>
      </div>
    </div>
  );
};

export default BatchDeviceSuggestion;
