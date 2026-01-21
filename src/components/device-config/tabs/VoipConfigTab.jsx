import React from 'react';

const VoipConfigTab = ({ device, upd, theme }) => {
  const voipConfig = device.voipConfig || {
    sipServer: '',
    sipPort: 5060,
    extension: '',
    codec: 'G.711',
    qosEnabled: true
  };

  const updVoip = (updates) => upd({ voipConfig: { ...voipConfig, ...updates } });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">SIP Server</label>
          <input
            value={voipConfig.sipServer}
            onChange={(e) => updVoip({ sipServer: e.target.value })}
            placeholder="10.0.25.10"
            className="w-full px-3 py-2 rounded border font-mono mt-1"
            style={{ background: theme.bg, borderColor: theme.border }}
          />
        </div>
        <div>
          <label className="text-sm">SIP Port</label>
          <input
            type="number"
            value={voipConfig.sipPort}
            onChange={(e) => updVoip({ sipPort: parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded border font-mono mt-1"
            style={{ background: theme.bg, borderColor: theme.border }}
          />
        </div>
      </div>

      <div>
        <label className="text-sm">Extension</label>
        <input
          value={voipConfig.extension}
          onChange={(e) => updVoip({ extension: e.target.value })}
          placeholder="1001"
          className="w-full px-3 py-2 rounded border font-mono mt-1"
          style={{ background: theme.bg, borderColor: theme.border }}
        />
      </div>

      <div>
        <label className="text-sm">Codec</label>
        <select
          value={voipConfig.codec}
          onChange={(e) => updVoip({ codec: e.target.value })}
          className="w-full px-3 py-2 rounded border mt-1"
          style={{ background: theme.bg, borderColor: theme.border }}
        >
          <option value="G.711">G.711 (64 kbps)</option>
          <option value="G.722">G.722 (64 kbps HD)</option>
          <option value="G.729">G.729 (8 kbps)</option>
        </select>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={voipConfig.qosEnabled}
          onChange={(e) => updVoip({ qosEnabled: e.target.checked })}
        />
        <span className="text-sm">Enable QoS (DSCP 46)</span>
      </label>
    </div>
  );
};

export default VoipConfigTab;
