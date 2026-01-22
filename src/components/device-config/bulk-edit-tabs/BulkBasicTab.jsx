import React from 'react';
import { BulkDropdownField } from '../bulk-edit-fields';

/**
 * Basic Info Tab - Contains original bulk edit properties
 * Status, Building/Floor, Lock positions
 */
const BulkBasicTab = ({
  enabledFields,
  fieldValues,
  conflicts,
  validations,
  onEnabledChange,
  onValueChange,
  theme,
  buildings,
  selectedDeviceIds
}) => {
  const statusOptions = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'warning', label: 'Warning' },
    { value: 'unknown', label: 'Unknown' }
  ];

  // Get building options
  const buildingOptions = [
    { value: 'none', label: 'No Building (Unassign)' },
    ...Object.values(buildings || {}).map(b => ({ value: b.id, label: b.name }))
  ];

  // Get floor options based on selected building
  const selectedBuilding = fieldValues['buildingId'];
  const availableFloors = selectedBuilding && selectedBuilding !== 'none' && buildings[selectedBuilding]
    ? buildings[selectedBuilding].floors.map(f => ({ value: f.id, label: f.name }))
    : [];

  const lockOptions = [
    { value: 'true', label: '🔒 Lock Positions' },
    { value: 'false', label: '🔓 Unlock Positions' }
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm" style={{ color: theme.textMuted }}>
        Basic device properties and assignments. {selectedDeviceIds.length} device{selectedDeviceIds.length > 1 ? 's' : ''} selected.
      </div>

      {/* Status */}
      <BulkDropdownField
        fieldPath="status"
        label="Status"
        enabled={enabledFields['status'] || false}
        value={fieldValues['status']}
        conflict={conflicts['status']}
        onEnabledChange={onEnabledChange}
        onValueChange={onValueChange}
        theme={theme}
        validation={validations['status']}
        options={statusOptions}
        placeholder="Select status..."
      />

      {/* Building Assignment */}
      <BulkDropdownField
        fieldPath="buildingId"
        label="Building Assignment"
        enabled={enabledFields['buildingId'] || false}
        value={fieldValues['buildingId']}
        conflict={conflicts['buildingId']}
        onEnabledChange={onEnabledChange}
        onValueChange={(path, value) => {
          onValueChange(path, value === 'none' ? null : value);
          // Reset floor when building changes
          if (value !== selectedBuilding) {
            onValueChange('floor', null);
            onEnabledChange('floor', false);
          }
        }}
        theme={theme}
        validation={validations['buildingId']}
        options={buildingOptions}
        placeholder="Select building..."
      />

      {/* Floor Assignment (only if building selected) */}
      {fieldValues['buildingId'] && fieldValues['buildingId'] !== 'none' && availableFloors.length > 0 && (
        <BulkDropdownField
          fieldPath="floor"
          label="Floor Assignment"
          enabled={enabledFields['floor'] || false}
          value={fieldValues['floor']}
          conflict={conflicts['floor']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['floor']}
          options={availableFloors}
          placeholder="Select floor..."
        />
      )}

      {/* Lock Positions */}
      <BulkDropdownField
        fieldPath="locked"
        label="Lock Position"
        enabled={enabledFields['locked'] || false}
        value={fieldValues['locked'] === true ? 'true' : fieldValues['locked'] === false ? 'false' : ''}
        conflict={conflicts['locked']}
        onEnabledChange={onEnabledChange}
        onValueChange={(path, value) => onValueChange(path, value === 'true')}
        theme={theme}
        validation={validations['locked']}
        options={lockOptions}
        placeholder="Select lock status..."
      />
    </div>
  );
};

export default BulkBasicTab;
