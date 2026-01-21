import React from 'react';
import { getFieldLabel } from '../../services/aiEditParser';

/**
 * Pending Change Approval Component
 * Displays proposed network changes for user approval
 */
const PendingChangeApproval = ({
  pendingChange,
  onApprove,
  onDismiss,
  theme,
  devices
}) => {
  if (!pendingChange) return null;

  const { deviceIds, updates, summary, affectedDevices, validation } = pendingChange;

  return (
    <div
      className="border-2 rounded-lg p-4 mb-3"
      style={{
        background: theme.bg,
        borderColor: validation.valid ? '#3b82f6' : '#ef4444'
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: validation.valid ? '#3b82f620' : '#ef444420',
            color: validation.valid ? '#3b82f6' : '#ef4444'
          }}
        >
          {validation.valid ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">
            {validation.valid ? 'Proposed Change' : 'Invalid Change'}
          </h4>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {summary}
          </p>
        </div>
      </div>

      {/* Device List */}
      <div className="mb-3 space-y-2">
        {affectedDevices.map((device, idx) => {
          const deviceData = devices[device.id];
          return (
            <div
              key={device.id}
              className="border rounded p-2"
              style={{ borderColor: theme.border, background: theme.surface }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: theme.bg, color: theme.text }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{device.name}</div>
                  <div className="text-xs truncate" style={{ color: theme.textMuted }}>
                    {deviceData?.type} • {deviceData?.ip || 'No IP'}
                  </div>
                </div>
              </div>

              {/* Changes */}
              {device.changes && Object.keys(device.changes).length > 0 && (
                <div className="space-y-1 ml-8">
                  {Object.entries(device.changes).map(([field, change]) => (
                    <div key={field} className="text-xs">
                      <span className="font-medium">{getFieldLabel(field)}:</span>{' '}
                      <span style={{ color: theme.textMuted }}>
                        {change.old !== undefined && change.old !== null
                          ? String(change.old)
                          : 'none'}
                      </span>
                      {' → '}
                      <span style={{ color: '#3b82f6' }}>
                        {change.new !== undefined && change.new !== null
                          ? String(change.new)
                          : 'none'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Validation Errors */}
      {!validation.valid && (
        <div
          className="mb-3 p-2 rounded text-xs"
          style={{
            background: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fca5a5'
          }}
        >
          <div className="font-semibold mb-1">Validation Errors:</div>
          {Object.entries(validation.errors).map(([field, error]) => (
            <div key={field}>
              • {field}: {error}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          disabled={!validation.valid}
          className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: validation.valid ? '#10b981' : theme.bg,
            color: validation.valid ? '#ffffff' : theme.textMuted
          }}
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Approve Change{deviceIds.length > 1 ? 's' : ''}
          </div>
        </button>
        <button
          onClick={onDismiss}
          className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-80"
          style={{
            background: theme.bg,
            color: theme.text,
            border: `1px solid ${theme.border}`
          }}
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Continue Chatting
          </div>
        </button>
      </div>
    </div>
  );
};

export default PendingChangeApproval;
