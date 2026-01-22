import React from 'react';
import { BulkDropdownField } from '../bulk-edit-fields';
import { deviceTypes } from '../../../constants/deviceTypes';

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

  // Get device type options
  const typeOptions = deviceTypes.map(t => ({ value: t.value, label: t.label }));

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

      {/* Device Type */}
      <BulkDropdownField
        fieldPath="type"
        label="Device Type"
        enabled={enabledFields['type'] || false}
        value={fieldValues['type']}
        conflict={conflicts['type']}
        onEnabledChange={onEnabledChange}
        onValueChange={onValueChange}
        theme={theme}
        validation={validations['type']}
        options={typeOptions}
        placeholder="Select device type..."
      />

      {/* Info message when type is enabled */}
      {enabledFields['type'] && (
        <div
          className="ml-6 text-xs p-2 rounded"
          style={{
            background: '#3b82f620',
            color: theme.text,
            border: '1px solid #3b82f640'
          }}
        >
          ℹ️ Changing device type will initialize default configuration for the new type.
          Device-specific settings (VoIP, WiFi, DHCP) may need to be configured individually.
        </div>
      )}

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
