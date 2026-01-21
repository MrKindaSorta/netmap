import React from 'react';
import Modal from '../common/Modal';
import { PrimaryButton, ModalFooter } from '../common/Button';

const ConnModal = React.memo(({ connection, connectionId, devices, onClose, onUpdate, theme, connTypes, speeds, cableTypes, vlans, getUnit }) => {
  if (!connection) return null;

  const upd = (updates) => onUpdate(connectionId, updates);

  const footer = (
    <ModalFooter>
      <PrimaryButton onClick={onClose} fullWidth>
        Done
      </PrimaryButton>
    </ModalFooter>
  );

  return (
    <Modal
      title="Edit Connection"
      onClose={onClose}
      theme={theme}
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        {/* Connection Summary */}
        <div
          className="text-center p-3 rounded-lg text-sm font-medium"
          style={{ background: theme.bg, color: theme.text }}
        >
          <span className="font-semibold">{devices[connection.from]?.name}</span>
          <span className="mx-2 text-blue-600">↔</span>
          <span className="font-semibold">{devices[connection.to]?.name}</span>
        </div>

        {/* Port Configuration */}
        <div>
          <label className="block text-sm font-medium mb-2">Port Configuration</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: theme.textMuted }}>
                From Port
              </label>
              <input
                value={connection.fromPort || ''}
                onChange={(e) => upd({ fromPort: e.target.value })}
                placeholder="e.g., Gi0/1"
                className="w-full px-3 py-2 rounded-lg border font-mono text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: theme.textMuted }}>
                To Port
              </label>
              <input
                value={connection.toPort || ''}
                onChange={(e) => upd({ toPort: e.target.value })}
                placeholder="e.g., Gi0/1"
                className="w-full px-3 py-2 rounded-lg border font-mono text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
          </div>
        </div>

        {/* Connection Type & Speed */}
        <div>
          <label className="block text-sm font-medium mb-2">Connection Properties</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: theme.textMuted }}>
                Type
              </label>
              <select
                value={connection.type}
                onChange={(e) => upd({ type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              >
                {connTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: theme.textMuted }}>
                Speed
              </label>
              <select
                value={connection.speed || ''}
                onChange={(e) => upd({ speed: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              >
                {speeds.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cable Information */}
        <div>
          <label className="block text-sm font-medium mb-2">Cable Information</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: theme.textMuted }}>
                Cable Type
              </label>
              <select
                value={connection.cableType || 'cat6'}
                onChange={(e) => upd({ cableType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              >
                {cableTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: theme.textMuted }}>
                Length ({getUnit()})
              </label>
              <input
                type="number"
                value={connection.cableLength || 0}
                onChange={(e) => upd({ cableLength: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
          </div>
        </div>

        {/* VLANs */}
        <div>
          <label className="block text-sm font-medium mb-2">VLANs on Connection</label>
          <div
            className="flex flex-wrap gap-2 p-3 rounded-lg border min-h-[60px]"
            style={{ borderColor: theme.border, background: theme.bg }}
          >
            {Object.values(vlans).map(v => (
              <button
                key={v.id}
                onClick={() => upd({
                  vlans: connection.vlans?.includes(v.id)
                    ? connection.vlans.filter(x => x !== v.id)
                    : [...(connection.vlans || []), v.id]
                })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  connection.vlans?.includes(v.id) ? 'ring-2' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  background: v.color + '30',
                  color: v.color,
                  borderColor: v.color,
                  ringColor: v.color
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: v.color }}
                />
                <span>VLAN {v.id}</span>
              </button>
            ))}
          </div>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
            Click to toggle VLANs
          </p>
        </div>
      </div>
    </Modal>
  );
});

export default ConnModal;
