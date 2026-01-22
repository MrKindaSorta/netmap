import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { PrimaryButton, SecondaryButton, ModalFooter } from '../common/Button';
import { detectAllConflicts, setNestedValue } from '../../utils/bulkEditConflicts';
import { validateAllFields, validateIP, hasCriticalFields } from '../../utils/bulkEditValidation';
import {
  BulkBasicTab,
  BulkHardwareTab,
  BulkAssetTab,
  BulkNetworkTab,
  BulkDocumentationTab,
  BulkAdvancedTab
} from './bulk-edit-tabs';

const BulkEditModal = ({ selectedDeviceIds, devices, buildings, vlans, onClose, onUpdate, theme }) => {
  const selectedCount = selectedDeviceIds.length;

  // Tab navigation
  const [activeTab, setActiveTab] = useState('basic');

  // Field state management
  const [enabledFields, setEnabledFields] = useState({});
  const [fieldValues, setFieldValues] = useState({});
  const [conflicts, setConflicts] = useState({});
  const [validations, setValidations] = useState({});

  // Define all fields that can be edited
  const allFields = useMemo(() => [
    // Basic
    'status', 'type', 'buildingId', 'floor', 'locked',
    // Hardware
    'hardware.manufacturer', 'hardware.model', 'hardware.serialNumber',
    'hardware.firmware.version', 'hardware.firmware.lastUpdated',
    'hardware.firmware.updateAvailable', 'hardware.firmware.updateVersion',
    // Asset
    'asset.assetTag', 'asset.owner', 'asset.purchaseDate', 'asset.purchasePrice',
    'asset.vendor', 'asset.costCenter', 'asset.warrantyExpires', 'asset.warrantyType',
    'asset.maintenanceContract', 'asset.eolDate', 'asset.eosDate',
    // Network
    'network.hostname', 'network.fqdn', 'network.managementIP', 'network.managementVLAN',
    'network.ipv6Address', 'network.defaultGateway', 'network.dnsServers',
    'network.ntpServers', 'network.syslogServer',
    // Documentation
    'notes', 'location.room', 'location.rack', 'location.rackUnit', 'location.coordinates',
    // Advanced
    'vlans'
  ], []);

  // Critical fields that require confirmation
  const criticalFields = ['network.managementIP', 'network.defaultGateway', 'network.ipv6Address'];

  // Field validators
  const fieldValidators = {
    'network.managementIP': validateIP,
    'network.defaultGateway': validateIP
  };

  // Initialize conflict detection on mount
  useEffect(() => {
    const detectedConflicts = detectAllConflicts(selectedDeviceIds, devices, allFields);
    setConflicts(detectedConflicts);
  }, [selectedDeviceIds, devices, allFields]);

  // Handlers
  const handleEnabledChange = (fieldPath, enabled) => {
    setEnabledFields(prev => ({ ...prev, [fieldPath]: enabled }));

    // Clear validation error when disabling field
    if (!enabled) {
      setValidations(prev => {
        const newValidations = { ...prev };
        delete newValidations[fieldPath];
        return newValidations;
      });
    }
  };

  const handleValueChange = (fieldPath, value) => {
    setFieldValues(prev => ({ ...prev, [fieldPath]: value }));

    // Clear validation error when value changes
    setValidations(prev => {
      const newValidations = { ...prev };
      delete newValidations[fieldPath];
      return newValidations;
    });
  };

  const handleApply = async () => {
    // Validate all enabled fields
    const errors = validateAllFields(enabledFields, fieldValues, fieldValidators);

    if (Object.keys(errors).length > 0) {
      setValidations(errors);
      alert('Please fix validation errors before applying changes.');
      return;
    }

    // Check for critical field changes
    if (hasCriticalFields(enabledFields, criticalFields)) {
      const confirmed = window.confirm(
        `⚠️ You are about to modify network settings for ${selectedCount} device${selectedCount > 1 ? 's' : ''}.\n\n` +
        'This could affect connectivity. Are you sure you want to continue?'
      );

      if (!confirmed) {
        return;
      }
    }

    // Build updates object
    const updates = {};

    Object.keys(enabledFields).forEach(fieldPath => {
      if (!enabledFields[fieldPath]) return;

      const value = fieldValues[fieldPath];

      // Handle nested fields with dot notation
      if (fieldPath.includes('.')) {
        setNestedValue(updates, fieldPath, value);
      } else {
        updates[fieldPath] = value;
      }
    });

    // Call the update handler
    onUpdate(selectedDeviceIds, updates);
    onClose();
  };

  // Count enabled fields per tab
  const enabledCounts = useMemo(() => {
    const counts = {
      basic: 0,
      hardware: 0,
      asset: 0,
      network: 0,
      documentation: 0,
      advanced: 0
    };

    Object.keys(enabledFields).forEach(field => {
      if (!enabledFields[field]) return;

      if (['status', 'buildingId', 'floor', 'locked'].includes(field)) {
        counts.basic++;
      } else if (field.startsWith('hardware.')) {
        counts.hardware++;
      } else if (field.startsWith('asset.')) {
        counts.asset++;
      } else if (field.startsWith('network.')) {
        counts.network++;
      } else if (field === 'notes' || field.startsWith('location.')) {
        counts.documentation++;
      } else if (field === 'vlans') {
        counts.advanced++;
      }
    });

    return counts;
  }, [enabledFields]);

  const hasChanges = Object.values(enabledFields).some(enabled => enabled);

  // Tab definitions
  const tabs = [
    { id: 'basic', label: 'Basic', icon: '⚙️' },
    { id: 'hardware', label: 'Hardware', icon: '🔧' },
    { id: 'asset', label: 'Asset', icon: '💼' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'documentation', label: 'Documentation', icon: '📝' },
    { id: 'advanced', label: 'Advanced', icon: '⚡' }
  ];

  const footer = (
    <ModalFooter>
      <SecondaryButton onClick={onClose} theme={theme}>
        Cancel
      </SecondaryButton>
      <PrimaryButton
        onClick={handleApply}
        disabled={!hasChanges}
      >
        Apply to {selectedCount} Device{selectedCount > 1 ? 's' : ''}
      </PrimaryButton>
    </ModalFooter>
  );

  return (
    <Modal
      title={`Bulk Edit ${selectedCount} Device${selectedCount > 1 ? 's' : ''}`}
      onClose={onClose}
      theme={theme}
      size="xl"
      footer={footer}
    >
      <div className="space-y-5">
        <p className="text-sm" style={{ color: theme.textMuted }}>
          Select which properties to update for all selected devices. Uncheck options to leave them unchanged.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-1 pb-3 border-b" style={{ borderColor: theme.border }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 relative"
              style={{
                background: activeTab === tab.id ? theme.bgSecondary : 'transparent',
                color: activeTab === tab.id ? theme.text : theme.textMuted,
                border: `1px solid ${activeTab === tab.id ? theme.border : 'transparent'}`
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {enabledCounts[tab.id] > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-bold"
                  style={{
                    background: '#2563eb',
                    color: '#fff'
                  }}
                >
                  {enabledCounts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px] max-h-[500px] overflow-y-auto pr-2">
          {activeTab === 'basic' && (
            <BulkBasicTab
              enabledFields={enabledFields}
              fieldValues={fieldValues}
              conflicts={conflicts}
              validations={validations}
              onEnabledChange={handleEnabledChange}
              onValueChange={handleValueChange}
              theme={theme}
              buildings={buildings}
              selectedDeviceIds={selectedDeviceIds}
            />
          )}

          {activeTab === 'hardware' && (
            <BulkHardwareTab
              enabledFields={enabledFields}
              fieldValues={fieldValues}
              conflicts={conflicts}
              validations={validations}
              onEnabledChange={handleEnabledChange}
              onValueChange={handleValueChange}
              theme={theme}
            />
          )}

          {activeTab === 'asset' && (
            <BulkAssetTab
              enabledFields={enabledFields}
              fieldValues={fieldValues}
              conflicts={conflicts}
              validations={validations}
              onEnabledChange={handleEnabledChange}
              onValueChange={handleValueChange}
              theme={theme}
            />
          )}

          {activeTab === 'network' && (
            <BulkNetworkTab
              enabledFields={enabledFields}
              fieldValues={fieldValues}
              conflicts={conflicts}
              validations={validations}
              onEnabledChange={handleEnabledChange}
              onValueChange={handleValueChange}
              theme={theme}
            />
          )}

          {activeTab === 'documentation' && (
            <BulkDocumentationTab
              enabledFields={enabledFields}
              fieldValues={fieldValues}
              conflicts={conflicts}
              validations={validations}
              onEnabledChange={handleEnabledChange}
              onValueChange={handleValueChange}
              theme={theme}
            />
          )}

          {activeTab === 'advanced' && (
            <BulkAdvancedTab
              enabledFields={enabledFields}
              fieldValues={fieldValues}
              conflicts={conflicts}
              validations={validations}
              onEnabledChange={handleEnabledChange}
              onValueChange={handleValueChange}
              theme={theme}
              vlans={vlans}
            />
          )}
        </div>

        {/* Summary */}
        {hasChanges && (
          <div
            className="text-sm p-3 rounded-lg"
            style={{
              background: '#3b82f620',
              color: theme.text,
              border: '1px solid #3b82f640'
            }}
          >
            <strong>Summary:</strong> {Object.values(enabledFields).filter(Boolean).length} field
            {Object.values(enabledFields).filter(Boolean).length > 1 ? 's' : ''} will be updated for {selectedCount} device
            {selectedCount > 1 ? 's' : ''}.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BulkEditModal;
