import React from 'react';
import { BulkTextField, BulkNumberField, BulkDateField } from '../bulk-edit-fields';

/**
 * Asset Management Tab - Financial and lifecycle tracking
 * Asset tag, purchase info, warranty, EOL/EOS dates
 */
const BulkAssetTab = ({
  enabledFields,
  fieldValues,
  conflicts,
  validations,
  onEnabledChange,
  onValueChange,
  theme
}) => {
  return (
    <div className="space-y-4">
      <div className="text-sm" style={{ color: theme.textMuted }}>
        Asset tracking, purchase information, and warranty details.
      </div>

      {/* Asset Tracking */}
      <div
        className="p-3 rounded-lg"
        style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <div className="text-xs font-semibold mb-3" style={{ color: theme.textMuted }}>
          ASSET TRACKING
        </div>

        <BulkTextField
          fieldPath="asset.assetTag"
          label="Asset Tag"
          enabled={enabledFields['asset.assetTag'] || false}
          value={fieldValues['asset.assetTag']}
          conflict={conflicts['asset.assetTag']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['asset.assetTag']}
          placeholder="Unique asset identifier"
        />

        <BulkTextField
          fieldPath="asset.owner"
          label="Owner"
          enabled={enabledFields['asset.owner'] || false}
          value={fieldValues['asset.owner']}
          conflict={conflicts['asset.owner']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['asset.owner']}
          placeholder="Department or person responsible"
        />
      </div>

      {/* Purchase Information */}
      <div
        className="p-3 rounded-lg"
        style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <div className="text-xs font-semibold mb-3" style={{ color: theme.textMuted }}>
          PURCHASE INFORMATION
        </div>

        <BulkDateField
          fieldPath="asset.purchaseDate"
          label="Purchase Date"
          enabled={enabledFields['asset.purchaseDate'] || false}
          value={fieldValues['asset.purchaseDate']}
          conflict={conflicts['asset.purchaseDate']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['asset.purchaseDate']}
        />

        <BulkNumberField
          fieldPath="asset.purchasePrice"
          label="Purchase Price ($)"
          enabled={enabledFields['asset.purchasePrice'] || false}
          value={fieldValues['asset.purchasePrice']}
          conflict={conflicts['asset.purchasePrice']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['asset.purchasePrice']}
          placeholder="0.00"
          min={0}
          step={0.01}
        />

        <BulkTextField
          fieldPath="asset.vendor"
          label="Vendor"
          enabled={enabledFields['asset.vendor'] || false}
          value={fieldValues['asset.vendor']}
          conflict={conflicts['asset.vendor']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['asset.vendor']}
          placeholder="Purchase vendor"
        />

        <BulkTextField
          fieldPath="asset.costCenter"
          label="Cost Center"
          enabled={enabledFields['asset.costCenter'] || false}
          value={fieldValues['asset.costCenter']}
          conflict={conflicts['asset.costCenter']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['asset.costCenter']}
          placeholder="Department or project code"
        />
      </div>

      {/* Warranty & Support */}
      <div
        className="p-3 rounded-lg"
        style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <div className="text-xs font-semibold mb-3" style={{ color: theme.textMuted }}>
          WARRANTY & SUPPORT
        </div>

        <BulkDateField
          fieldPath="asset.warrantyExpires"
          label="Warranty Expiration"
          enabled={enabledFields['asset.warrantyExpires'] || false}
          value={fieldValues['asset.warrantyExpires']}
          conflict={conflicts['asset.warrantyExpires']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['asset.warrantyExpires']}
        />

        <BulkTextField
          fieldPath="asset.warrantyType"
          label="Warranty Type"
          enabled={enabledFields['asset.warrantyType'] || false}
          value={fieldValues['asset.warrantyType']}
          conflict={conflicts['asset.warrantyType']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['asset.warrantyType']}
          placeholder="e.g., Standard, Extended, On-Site"
        />

        <BulkTextField
          fieldPath="asset.maintenanceContract"
          label="Maintenance Contract"
          enabled={enabledFields['asset.maintenanceContract'] || false}
          value={fieldValues['asset.maintenanceContract']}
          conflict={conflicts['asset.maintenanceContract']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['asset.maintenanceContract']}
          placeholder="Contract number or details"
        />
      </div>

      {/* Lifecycle Dates */}
      <div
        className="p-3 rounded-lg"
        style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <div className="text-xs font-semibold mb-3" style={{ color: theme.textMuted }}>
          LIFECYCLE DATES
        </div>

        <BulkDateField
          fieldPath="asset.eolDate"
          label="End of Life (EOL) Date"
          enabled={enabledFields['asset.eolDate'] || false}
          value={fieldValues['asset.eolDate']}
          conflict={conflicts['asset.eolDate']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['asset.eolDate']}
        />

        <BulkDateField
          fieldPath="asset.eosDate"
          label="End of Support (EOS) Date"
          enabled={enabledFields['asset.eosDate'] || false}
          value={fieldValues['asset.eosDate']}
          conflict={conflicts['asset.eosDate']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['asset.eosDate']}
        />
      </div>
    </div>
  );
};

export default BulkAssetTab;
