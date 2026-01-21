import React, { useState } from 'react';
import Modal from '../common/Modal';
import { PrimaryButton, SecondaryButton, ModalFooter } from '../common/Button';

const BulkEditModal = ({ selectedDeviceIds, devices, buildings, vlans, onClose, onUpdate, theme }) => {
  const selectedCount = selectedDeviceIds.length;

  const [changeBuilding, setChangeBuilding] = useState(false);
  const [changeFloor, setChangeFloor] = useState(false);
  const [changeStatus, setChangeStatus] = useState(false);
  const [changeVlans, setChangeVlans] = useState(false);
  const [changeLock, setChangeLock] = useState(false);

  const [newBuilding, setNewBuilding] = useState('');
  const [newFloor, setNewFloor] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newLocked, setNewLocked] = useState(false);
  const [vlanMode, setVlanMode] = useState('add'); // 'add' or 'replace'
  const [selectedVlans, setSelectedVlans] = useState([]);

  const statusOptions = [
    { value: 'online', label: 'Online', color: '#22c55e' },
    { value: 'offline', label: 'Offline', color: '#ef4444' },
    { value: 'warning', label: 'Warning', color: '#f59e0b' },
    { value: 'unknown', label: 'Unknown', color: '#6b7280' }
  ];

  const handleApply = () => {
    const updates = {};

    if (changeBuilding) {
      updates.buildingId = newBuilding === 'none' ? null : newBuilding;
      if (changeFloor && newBuilding !== 'none') {
        updates.floor = parseInt(newFloor) || 1;
      } else if (newBuilding === 'none') {
        updates.floor = null;
      }
    } else if (changeFloor && newFloor) {
      updates.floor = parseInt(newFloor) || null;
    }

    if (changeStatus) {
      updates.status = newStatus;
    }

    if (changeVlans && selectedVlans.length > 0) {
      updates.vlans = selectedVlans.map(v => parseInt(v));
      updates.vlanMode = vlanMode;
    }

    if (changeLock) {
      updates.locked = newLocked;
    }

    onUpdate(selectedDeviceIds, updates);
    onClose();
  };

  const toggleVlan = (vlanId) => {
    setSelectedVlans(prev =>
      prev.includes(vlanId)
        ? prev.filter(v => v !== vlanId)
        : [...prev, vlanId]
    );
  };

  const availableFloors = newBuilding && newBuilding !== 'none' && buildings[newBuilding]
    ? buildings[newBuilding].floors
    : [];

  const hasChanges = changeBuilding || changeStatus || changeVlans || changeLock;

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
      size="lg"
      footer={footer}
    >
      <div className="space-y-5">
        <p className="text-sm" style={{ color: theme.textMuted }}>
          Select which properties to update for all selected devices. Uncheck options to leave them unchanged.
        </p>

        {/* Building Assignment */}
        <div className="border rounded-lg p-4" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="change-building"
              checked={changeBuilding}
              onChange={(e) => setChangeBuilding(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="change-building" className="text-sm font-semibold">
              📍 Change Building Assignment
            </label>
          </div>
          {changeBuilding && (
            <div className="ml-6 space-y-3">
              <select
                value={newBuilding}
                onChange={(e) => {
                  setNewBuilding(e.target.value);
                  setNewFloor('');
                }}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              >
                <option value="">Select Building...</option>
                <option value="none">No Building (Unassign)</option>
                {Object.values(buildings).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              {newBuilding && newBuilding !== 'none' && availableFloors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="change-floor"
                      checked={changeFloor}
                      onChange={(e) => setChangeFloor(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="change-floor" className="text-xs font-medium">
                      Also change floor
                    </label>
                  </div>
                  {changeFloor && (
                    <select
                      value={newFloor}
                      onChange={(e) => setNewFloor(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ background: theme.bg, borderColor: theme.border }}
                    >
                      <option value="">Select Floor...</option>
                      {availableFloors.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="border rounded-lg p-4" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="change-status"
              checked={changeStatus}
              onChange={(e) => setChangeStatus(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="change-status" className="text-sm font-semibold">
              🔄 Change Status
            </label>
          </div>
          {changeStatus && (
            <div className="ml-6 grid grid-cols-2 gap-2">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  onClick={() => setNewStatus(status.value)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: newStatus === status.value ? status.color : theme.bg,
                    border: `2px solid ${newStatus === status.value ? status.color : theme.border}`,
                    color: newStatus === status.value ? '#fff' : theme.text
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* VLANs */}
        <div className="border rounded-lg p-4" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="change-vlans"
              checked={changeVlans}
              onChange={(e) => setChangeVlans(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="change-vlans" className="text-sm font-semibold">
              🔀 Change VLANs
            </label>
          </div>
          {changeVlans && (
            <div className="ml-6 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setVlanMode('add')}
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
                  onClick={() => setVlanMode('replace')}
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
              <div
                className="max-h-48 overflow-y-auto border rounded-lg p-2"
                style={{ borderColor: theme.border, background: theme.bg }}
              >
                {Object.values(vlans).map(vlan => (
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
            </div>
          )}
        </div>

        {/* Lock Position */}
        <div className="border rounded-lg p-4" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="change-lock"
              checked={changeLock}
              onChange={(e) => setChangeLock(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="change-lock" className="text-sm font-semibold">
              🔒 Change Lock Status
            </label>
          </div>
          {changeLock && (
            <div className="ml-6 grid grid-cols-2 gap-2">
              <button
                onClick={() => setNewLocked(true)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: newLocked ? '#ef4444' : theme.bg,
                  border: `2px solid ${newLocked ? '#ef4444' : theme.border}`,
                  color: newLocked ? '#fff' : theme.text
                }}
              >
                🔒 Lock Positions
              </button>
              <button
                onClick={() => setNewLocked(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: !newLocked ? '#22c55e' : theme.bg,
                  border: `2px solid ${!newLocked ? '#22c55e' : theme.border}`,
                  color: !newLocked ? '#fff' : theme.text
                }}
              >
                🔓 Unlock Positions
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BulkEditModal;
