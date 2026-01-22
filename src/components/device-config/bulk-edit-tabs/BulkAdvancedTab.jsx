import React, { useState } from 'react';

/**
 * Advanced Tab - VLANs and type-specific fields
 * Contains existing VLAN functionality
 */
const BulkAdvancedTab = ({
  enabledFields,
  fieldValues,
  conflicts,
  validations,
  onEnabledChange,
  onValueChange,
  theme,
  vlans
}) => {
  const [vlanMode, setVlanMode] = useState('add');
  const [selectedVlans, setSelectedVlans] = useState([]);

  const toggleVlan = (vlanId) => {
    const newSelected = selectedVlans.includes(vlanId)
      ? selectedVlans.filter(v => v !== vlanId)
      : [...selectedVlans, vlanId];

    setSelectedVlans(newSelected);
    onValueChange('vlans', newSelected);
    onValueChange('vlanMode', vlanMode);

    // Enable VLANs field automatically when VLANs are selected
    if (newSelected.length > 0) {
      onEnabledChange('vlans', true);
    } else {
      onEnabledChange('vlans', false);
    }
  };

  const handleVlanModeChange = (mode) => {
    setVlanMode(mode);
    onValueChange('vlanMode', mode);
  };

  const hasConflict = conflicts['vlans']?.hasConflict || false;

  return (
    <div className="space-y-4">
      <div className="text-sm" style={{ color: theme.textMuted }}>
        VLAN assignments and advanced device-specific configuration.
      </div>

      {/* VLANs */}
      <div
        className="border rounded-lg p-4"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="bulk-vlans"
            checked={enabledFields['vlans'] || false}
            onChange={(e) => {
              onEnabledChange('vlans', e.target.checked);
              if (!e.target.checked) {
                setSelectedVlans([]);
                onValueChange('vlans', []);
              }
            }}
            className="w-4 h-4 rounded"
          />
          <label
            htmlFor="bulk-vlans"
            className="text-sm font-semibold flex items-center gap-1.5"
          >
            🔀 Change VLANs
            {hasConflict && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: '#f59e0b20',
                  color: '#f59e0b',
                  border: '1px solid #f59e0b40'
                }}
              >
                ⚠️ Conflict
              </span>
            )}
          </label>
        </div>

        {enabledFields['vlans'] && (
          <div className="ml-6 space-y-3">
            {/* Mode Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => handleVlanModeChange('add')}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: vlanMode === 'add' ? '#2563eb' : theme.bg,
                  border: `1px solid ${vlanMode === 'add' ? '#2563eb' : theme.border}`,
                  color: vlanMode === 'add' ? '#fff' : theme.text
                }}
              >
                Add to Existing
              </button>
              <button
                onClick={() => handleVlanModeChange('replace')}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: vlanMode === 'replace' ? '#2563eb' : theme.bg,
                  border: `1px solid ${vlanMode === 'replace' ? '#2563eb' : theme.border}`,
                  color: vlanMode === 'replace' ? '#fff' : theme.text
                }}
              >
                Replace All
              </button>
            </div>

            {/* VLAN List */}
            <div
              className="max-h-64 overflow-y-auto border rounded-lg p-2"
              style={{ borderColor: theme.border, background: theme.bg }}
            >
              {Object.values(vlans || {}).map(vlan => (
                <div
                  key={vlan.id}
                  onClick={() => toggleVlan(vlan.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-opacity-10 transition-colors"
                  style={{
                    background: selectedVlans.includes(vlan.id) ? `${vlan.color}20` : 'transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedVlans.includes(vlan.id)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded"
                  />
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: vlan.color }}
                  />
                  <span className="text-sm flex-1">{vlan.name}</span>
                  <span className="text-xs font-mono" style={{ color: theme.textMuted }}>
                    VLAN {vlan.id}
                  </span>
                </div>
              ))}
            </div>

            {/* Selected Count */}
            {selectedVlans.length > 0 && (
              <div
                className="text-xs p-2 rounded"
                style={{
                  background: '#3b82f620',
                  color: theme.text,
                  border: '1px solid #3b82f640'
                }}
              >
                {selectedVlans.length} VLAN{selectedVlans.length > 1 ? 's' : ''} selected
                ({vlanMode === 'add' ? 'will be added to' : 'will replace'} existing VLANs)
              </div>
            )}

            {/* Conflict Info */}
            {hasConflict && (
              <div
                className="text-xs p-2 rounded"
                style={{
                  background: '#f59e0b10',
                  color: theme.textMuted,
                  border: '1px solid #f59e0b20'
                }}
              >
                <strong>Different VLAN assignments detected.</strong> Your selection will override based on the mode chosen.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Type-Specific Fields Placeholder */}
      <div
        className="p-4 rounded-lg text-center"
        style={{ background: theme.bgSecondary, border: `1px dashed ${theme.border}` }}
      >
        <div className="text-sm" style={{ color: theme.textMuted }}>
          Type-specific fields can be added here in future updates
        </div>
      </div>
    </div>
  );
};

export default BulkAdvancedTab;
