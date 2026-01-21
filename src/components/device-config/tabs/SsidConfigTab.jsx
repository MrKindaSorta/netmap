import React from 'react';

const SsidConfigTab = ({ device, upd, theme, vlans }) => {
  const ssidConfig = device.ssidConfig || { ssids: [] };

  const updSsid = (updates) => upd({ ssidConfig: { ...ssidConfig, ...updates } });

  const addSSID = () => {
    const newSsid = {
      id: `ssid-${Date.now()}`,
      name: 'New SSID',
      enabled: true,
      vlanId: 60,
      security: 'wpa2-psk',
      password: '',
      hidden: false
    };
    updSsid({ ssids: [...ssidConfig.ssids, newSsid] });
  };

  const updateSSID = (ssidId, updates) => {
    updSsid({
      ssids: ssidConfig.ssids.map(s => s.id === ssidId ? { ...s, ...updates } : s)
    });
  };

  const deleteSSID = (ssidId) => {
    updSsid({ ssids: ssidConfig.ssids.filter(s => s.id !== ssidId) });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Wireless Networks</label>
        <button onClick={addSSID} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
          + Add SSID
        </button>
      </div>

      {ssidConfig.ssids.map(ssid => (
        <div
          key={ssid.id}
          className="p-3 rounded border space-y-2"
          style={{ borderColor: theme.border, background: theme.bg }}
        >
          <div className="flex justify-between items-center">
            <input
              value={ssid.name}
              onChange={(e) => updateSSID(ssid.id, { name: e.target.value })}
              placeholder="SSID Name"
              className="font-medium px-2 py-1 rounded border flex-1 mr-2 text-sm"
              style={{ background: theme.surface, borderColor: theme.border }}
            />
            <label className="flex items-center gap-1 text-xs mr-2">
              <input
                type="checkbox"
                checked={ssid.enabled}
                onChange={(e) => updateSSID(ssid.id, { enabled: e.target.checked })}
              />
              Enabled
            </label>
            <button onClick={() => deleteSSID(ssid.id)} className="text-red-600 text-xs">
              Delete
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={ssid.vlanId}
              onChange={(e) => updateSSID(ssid.id, { vlanId: parseInt(e.target.value) })}
              className="px-2 py-1 rounded border text-sm"
              style={{ background: theme.surface, borderColor: theme.border }}
            >
              {Object.values(vlans).map(v => (
                <option key={v.id} value={v.id}>VLAN {v.id} - {v.name}</option>
              ))}
            </select>

            <select
              value={ssid.security}
              onChange={(e) => updateSSID(ssid.id, { security: e.target.value })}
              className="px-2 py-1 rounded border text-sm"
              style={{ background: theme.surface, borderColor: theme.border }}
            >
              <option value="open">Open</option>
              <option value="wpa2-psk">WPA2-PSK</option>
              <option value="wpa2-enterprise">WPA2-Enterprise</option>
              <option value="wpa3">WPA3</option>
            </select>
          </div>

          {(ssid.security === 'wpa2-psk' || ssid.security === 'wpa3') && (
            <input
              type="password"
              value={ssid.password}
              onChange={(e) => updateSSID(ssid.id, { password: e.target.value })}
              placeholder="Password"
              className="w-full px-2 py-1 rounded border text-sm"
              style={{ background: theme.surface, borderColor: theme.border }}
            />
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={ssid.hidden}
              onChange={(e) => updateSSID(ssid.id, { hidden: e.target.checked })}
            />
            Hidden Network
          </label>
        </div>
      ))}
    </div>
  );
};

export default SsidConfigTab;
