import React from 'react';
import { BulkTextField, BulkDateField, BulkDropdownField } from '../bulk-edit-fields';

/**
 * Hardware Tab - Device hardware specifications
 * Manufacturer, model, serial number, firmware details
 */
const BulkHardwareTab = ({
  enabledFields,
  fieldValues,
  conflicts,
  validations,
  onEnabledChange,
  onValueChange,
  theme
}) => {
  const updateAvailableOptions = [
    { value: 'true', label: 'Yes - Update Available' },
    { value: 'false', label: 'No - Up to Date' }
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm" style={{ color: theme.textMuted }}>
        Hardware specifications and firmware information.
      </div>

      {/* Device Information */}
      <div
        className="p-3 rounded-lg"
        style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <div className="text-xs font-semibold mb-3" style={{ color: theme.textMuted }}>
          DEVICE INFORMATION
        </div>

        <BulkTextField
          fieldPath="hardware.manufacturer"
          label="Manufacturer"
          enabled={enabledFields['hardware.manufacturer'] || false}
          value={fieldValues['hardware.manufacturer']}
          conflict={conflicts['hardware.manufacturer']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['hardware.manufacturer']}
          placeholder="e.g., Cisco, HP, Dell"
        />

        <BulkTextField
          fieldPath="hardware.model"
          label="Model"
          enabled={enabledFields['hardware.model'] || false}
          value={fieldValues['hardware.model']}
          conflict={conflicts['hardware.model']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['hardware.model']}
          placeholder="e.g., Catalyst 9300, ProLiant DL380"
        />

        <BulkTextField
          fieldPath="hardware.serialNumber"
          label="Serial Number"
          enabled={enabledFields['hardware.serialNumber'] || false}
          value={fieldValues['hardware.serialNumber']}
          conflict={conflicts['hardware.serialNumber']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['hardware.serialNumber']}
          placeholder="Device serial number"
        />
      </div>

      {/* Firmware Information */}
      <div
        className="p-3 rounded-lg"
        style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <div className="text-xs font-semibold mb-3" style={{ color: theme.textMuted }}>
          FIRMWARE
        </div>

        <BulkTextField
          fieldPath="hardware.firmware.version"
          label="Firmware Version"
          enabled={enabledFields['hardware.firmware.version'] || false}
          value={fieldValues['hardware.firmware.version']}
          conflict={conflicts['hardware.firmware.version']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['hardware.firmware.version']}
          placeholder="e.g., 16.12.4, 2.8.1"
        />

        <BulkDateField
          fieldPath="hardware.firmware.lastUpdated"
          label="Last Firmware Update"
          enabled={enabledFields['hardware.firmware.lastUpdated'] || false}
          value={fieldValues['hardware.firmware.lastUpdated']}
          conflict={conflicts['hardware.firmware.lastUpdated']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['hardware.firmware.lastUpdated']}
        />

        <BulkDropdownField
          fieldPath="hardware.firmware.updateAvailable"
          label="Update Available"
          enabled={enabledFields['hardware.firmware.updateAvailable'] || false}
          value={fieldValues['hardware.firmware.updateAvailable'] === true ? 'true' :
                 fieldValues['hardware.firmware.updateAvailable'] === false ? 'false' : ''}
          conflict={conflicts['hardware.firmware.updateAvailable']}
          onEnabledChange={onEnabledChange}
          onValueChange={(path, value) => onValueChange(path, value === 'true')}
          theme={theme}
          validation={validations['hardware.firmware.updateAvailable']}
          options={updateAvailableOptions}
          placeholder="Select..."
        />

        <BulkTextField
          fieldPath="hardware.firmware.updateVersion"
          label="Available Update Version"
          enabled={enabledFields['hardware.firmware.updateVersion'] || false}
          value={fieldValues['hardware.firmware.updateVersion']}
          conflict={conflicts['hardware.firmware.updateVersion']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['hardware.firmware.updateVersion']}
          placeholder="Version available for update"
        />
      </div>
    </div>
  );
};

export default BulkHardwareTab;
