import React, { useState } from 'react';
import Modal from '../common/Modal';
import { PrimaryButton, SecondaryButton, DangerButton, ModalFooter } from '../common/Button';
import { validateVlanForm } from '../../utils';

const VlanModal = React.memo(({ vlan, vlanId, onClose, onSave, onDelete, theme, existingVlans }) => {
  const isCreate = vlan === null;
  const [localVlan, setLocalVlan] = useState(vlan || {
    id: '', name: '', subnet: '', gateway: '', color: '#6b7280', description: ''
  });
  const [errors, setErrors] = useState({});

  const handleSave = () => {
    const validationErrors = validateVlanForm(localVlan, existingVlans, vlanId);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(vlanId, localVlan, isCreate);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete VLAN ${vlan.id} (${vlan.name})? This will remove it from all devices and connections.`)) {
      onDelete(vlanId);
    }
  };

  const footer = (
    <ModalFooter>
      {!isCreate && (
        <DangerButton onClick={handleDelete}>
          Delete VLAN
        </DangerButton>
      )}
      <div className="flex-1" />
      <SecondaryButton onClick={onClose} theme={theme}>
        Cancel
      </SecondaryButton>
      <PrimaryButton onClick={handleSave}>
        {isCreate ? 'Create' : 'Save'}
      </PrimaryButton>
    </ModalFooter>
  );

  return (
    <Modal
      title={isCreate ? "Create VLAN" : `Edit VLAN ${vlan?.id}`}
      onClose={onClose}
      theme={theme}
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        {/* VLAN ID */}
        <div>
          <label className="block text-sm font-medium mb-2">
            VLAN ID
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            value={localVlan.id}
            onChange={(e) => setLocalVlan({...localVlan, id: e.target.value})}
            disabled={!isCreate}
            placeholder="1-4094"
            className="w-full px-3 py-2 rounded-lg border"
            style={{
              background: theme.bg,
              borderColor: errors.id ? '#ef4444' : theme.border,
              opacity: !isCreate ? 0.6 : 1,
              cursor: !isCreate ? 'not-allowed' : 'text'
            }}
          />
          {errors.id && <div className="text-xs text-red-600 mt-1">{errors.id}</div>}
        </div>

        {/* VLAN Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            VLAN Name
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            value={localVlan.name}
            onChange={(e) => setLocalVlan({...localVlan, name: e.target.value})}
            placeholder="e.g., Management, Guest, VoIP"
            className="w-full px-3 py-2 rounded-lg border"
            style={{
              background: theme.bg,
              borderColor: errors.name ? '#ef4444' : theme.border
            }}
          />
          {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
        </div>

        {/* Subnet */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Subnet (CIDR)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            value={localVlan.subnet}
            onChange={(e) => setLocalVlan({...localVlan, subnet: e.target.value})}
            placeholder="10.0.10.0/24"
            className="w-full px-3 py-2 rounded-lg border font-mono text-sm"
            style={{
              background: theme.bg,
              borderColor: errors.subnet ? '#ef4444' : theme.border
            }}
          />
          {errors.subnet && <div className="text-xs text-red-600 mt-1">{errors.subnet}</div>}
        </div>

        {/* Gateway */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Gateway IP
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            value={localVlan.gateway}
            onChange={(e) => setLocalVlan({...localVlan, gateway: e.target.value})}
            placeholder="10.0.10.1"
            className="w-full px-3 py-2 rounded-lg border font-mono text-sm"
            style={{
              background: theme.bg,
              borderColor: errors.gateway ? '#ef4444' : theme.border
            }}
          />
          {errors.gateway && <div className="text-xs text-red-600 mt-1">{errors.gateway}</div>}
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium mb-2">Display Color</label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={localVlan.color}
              onChange={(e) => setLocalVlan({...localVlan, color: e.target.value})}
              className="h-10 w-20 rounded-lg border cursor-pointer"
              style={{ borderColor: theme.border }}
            />
            <div
              className="flex-1 px-3 py-2 rounded-lg text-xs font-mono"
              style={{ background: localVlan.color + '20', color: localVlan.color }}
            >
              Preview: VLAN {localVlan.id || '??'}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={localVlan.description}
            onChange={(e) => setLocalVlan({...localVlan, description: e.target.value})}
            placeholder="Optional description or notes about this VLAN"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
            style={{ background: theme.bg, borderColor: theme.border }}
          />
        </div>
      </div>
    </Modal>
  );
});

export default VlanModal;
