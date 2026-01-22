import React from 'react';
import { formatConflictSummary } from '../../../utils/bulkEditConflicts';

/**
 * Reusable textarea field component for bulk editing
 */
const BulkTextAreaField = ({
  fieldPath,
  label,
  enabled,
  value,
  conflict,
  onEnabledChange,
  onValueChange,
  theme,
  validation,
  placeholder = '',
  rows = 4,
  maxLength = null,
  disabled = false,
  mode = 'replace', // 'replace' or 'append'
  onModeChange = null
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

      {/* Textarea Field */}
      {enabled && (
        <div className="ml-6 space-y-2">
          {/* Mode selector for append/replace */}
          {onModeChange && (
            <div className="flex gap-2">
              <button
                onClick={() => onModeChange('replace')}
                className="flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all"
                style={{
                  background: mode === 'replace' ? '#2563eb' : theme.bg,
                  border: `1px solid ${mode === 'replace' ? '#2563eb' : theme.border}`,
                  color: mode === 'replace' ? '#fff' : theme.text
                }}
              >
                Replace Existing
              </button>
              <button
                onClick={() => onModeChange('append')}
                className="flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all"
                style={{
                  background: mode === 'append' ? '#2563eb' : theme.bg,
                  border: `1px solid ${mode === 'append' ? '#2563eb' : theme.border}`,
                  color: mode === 'append' ? '#fff' : theme.text
                }}
              >
                Append to Existing
              </button>
            </div>
          )}

          <textarea
            value={value || ''}
            onChange={(e) => onValueChange(fieldPath, e.target.value)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className="w-full px-3 py-2 rounded-lg border text-sm font-mono"
            style={{
              background: theme.bg,
              borderColor: hasError ? '#ef4444' : theme.border,
              color: theme.text,
              resize: 'vertical'
            }}
          />

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
              <strong>Different values detected:</strong> {formatConflictSummary(conflict, 2)}
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

export default BulkTextAreaField;
