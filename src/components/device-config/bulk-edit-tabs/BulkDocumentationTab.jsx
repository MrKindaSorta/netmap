import React, { useState } from 'react';
import { BulkTextAreaField, BulkTextField } from '../bulk-edit-fields';

/**
 * Documentation Tab - Notes and location details
 * Notes (with append mode), room, rack information
 */
const BulkDocumentationTab = ({
  enabledFields,
  fieldValues,
  conflicts,
  validations,
  onEnabledChange,
  onValueChange,
  theme
}) => {
  const [notesMode, setNotesMode] = useState('replace');

  const handleNotesModeChange = (mode) => {
    setNotesMode(mode);
    // Store the mode so it can be used during update
    onValueChange('_notesMode', mode);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm" style={{ color: theme.textMuted }}>
        Documentation, notes, and physical location details.
      </div>

      {/* Notes */}
      <div
        className="p-3 rounded-lg"
        style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <div className="text-xs font-semibold mb-3" style={{ color: theme.textMuted }}>
          NOTES
        </div>

        <BulkTextAreaField
          fieldPath="notes"
          label="Device Notes"
          enabled={enabledFields['notes'] || false}
          value={fieldValues['notes']}
          conflict={conflicts['notes']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['notes']}
          placeholder="Add notes about this device..."
          rows={6}
          mode={notesMode}
          onModeChange={handleNotesModeChange}
        />

        {notesMode === 'append' && (
          <div
            className="text-xs p-2 rounded mt-2"
            style={{
              background: '#3b82f620',
              color: theme.text,
              border: '1px solid #3b82f640'
            }}
          >
            ℹ️ Append mode: New notes will be added to existing notes with a line break separator.
          </div>
        )}
      </div>

      {/* Physical Location */}
      <div
        className="p-3 rounded-lg"
        style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <div className="text-xs font-semibold mb-3" style={{ color: theme.textMuted }}>
          PHYSICAL LOCATION
        </div>

        <BulkTextField
          fieldPath="location.room"
          label="Room"
          enabled={enabledFields['location.room'] || false}
          value={fieldValues['location.room']}
          conflict={conflicts['location.room']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['location.room']}
          placeholder="e.g., Server Room A, Telecom Closet 2"
        />

        <BulkTextField
          fieldPath="location.rack"
          label="Rack"
          enabled={enabledFields['location.rack'] || false}
          value={fieldValues['location.rack']}
          conflict={conflicts['location.rack']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['location.rack']}
          placeholder="e.g., Rack 4, Cabinet B-12"
        />

        <BulkTextField
          fieldPath="location.rackUnit"
          label="Rack Unit (U)"
          enabled={enabledFields['location.rackUnit'] || false}
          value={fieldValues['location.rackUnit']}
          conflict={conflicts['location.rackUnit']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['location.rackUnit']}
          placeholder="e.g., 24-26"
        />

        <BulkTextField
          fieldPath="location.coordinates"
          label="Physical Coordinates"
          enabled={enabledFields['location.coordinates'] || false}
          value={fieldValues['location.coordinates']}
          conflict={conflicts['location.coordinates']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['location.coordinates']}
          placeholder="GPS or building coordinates"
        />
      </div>
    </div>
  );
};

export default BulkDocumentationTab;
