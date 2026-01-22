import React from 'react';
import { formatConflictSummary } from '../../../utils/bulkEditConflicts';

/**
 * Reusable multi-select field component for bulk editing
 * For fields that accept multiple values (e.g., DNS servers, NTP servers)
 */
const BulkMultiSelectField = ({
  fieldPath,
  label,
  enabled,
  value,
  conflict,
  onEnabledChange,
  onValueChange,
  theme,
  validation,
  placeholder = 'Enter values separated by commas',
  disabled = false,
  helpText = ''
}) => {
  const hasConflict = conflict?.hasConflict || false;
  const hasError = validation?.error || false;

  // Convert array to comma-separated string for display
  const displayValue = Array.isArray(value) ? value.join(', ') : value || '';

  const handleChange = (e) => {
    const text = e.target.value;
    // Convert comma-separated string to array
    const array = text.split(',').map(item => item.trim()).filter(Boolean);
    onValueChange(fieldPath, array);
  };

  return (
    <div className="mb-4">
      {/* Checkbox and Label */}
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          id={`bulk-${fieldPath}`}
          checked={enabled}
          onChange={(e) => onEnabledChange(fieldPath, e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 rounded"
        />
        <label
          htmlFor={`bulk-${fieldPath}`}
          className="text-sm font-medium flex items-center gap-1.5"
        >
          {label}
          {hasConflict && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: '#f59e0b20',
                color: '#f59e0b',
                border: '1px solid #f59e0b40'
              }}
              title={formatConflictSummary(conflict)}
            >
              ⚠️ Conflict
            </span>
          )}
        </label>
      </div>

      {/* Input Field */}
      {enabled && (
        <div className="ml-6 space-y-2">
          <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-lg border text-sm font-mono"
            style={{
              background: theme.bg,
              borderColor: hasError ? '#ef4444' : theme.border,
              color: theme.text
            }}
          />

          {/* Help Text */}
          {helpText && (
            <div className="text-xs" style={{ color: theme.textMuted }}>
              {helpText}
            </div>
          )}

          {/* Conflict Summary */}
          {hasConflict && (
            <div
              className="text-xs p-2 rounded"
              style={{
                background: '#f59e0b10',
                color: theme.textMuted,
                border: '1px solid #f59e0b20'
              }}
            >
              <strong>Different values detected:</strong> {formatConflictSummary(conflict, 3)}
            </div>
          )}

          {/* Validation Error */}
          {hasError && (
            <div
              className="text-xs p-2 rounded"
              style={{
                background: '#ef444410',
                color: '#ef4444',
                border: '1px solid #ef444420'
              }}
            >
              {validation.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkMultiSelectField;
