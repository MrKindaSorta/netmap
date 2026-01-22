import React from 'react';
import { formatConflictSummary } from '../../../utils/bulkEditConflicts';

/**
 * Reusable dropdown/select field component for bulk editing
 */
const BulkDropdownField = ({
  fieldPath,
  label,
  enabled,
  value,
  conflict,
  onEnabledChange,
  onValueChange,
  theme,
  validation,
  options = [], // Array of { value, label } objects
  placeholder = 'Select...',
  disabled = false
}) => {
  const hasConflict = conflict?.hasConflict || false;
  const hasError = validation?.error || false;

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

      {/* Select Field */}
      {enabled && (
        <div className="ml-6 space-y-2">
          <select
            value={value || ''}
            onChange={(e) => onValueChange(fieldPath, e.target.value || null)}
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{
              background: theme.bg,
              borderColor: hasError ? '#ef4444' : theme.border,
              color: theme.text
            }}
          >
            <option value="">{placeholder}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

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

export default BulkDropdownField;
