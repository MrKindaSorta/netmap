import React from 'react';

const DhcpConfigTab = ({ device, upd, theme, vlans }) => {
  const dhcpConfig = device.dhcpConfig || { enabled: false, pools: [] };

  const updDhcp = (updates) => upd({ dhcpConfig: { ...dhcpConfig, ...updates } });

  const addPool = () => {
    const newPool = {
      id: `pool-${Date.now()}`,
      name: 'New Pool',
      vlanId: Object.keys(vlans)[0],
      startIp: '',
      endIp: '',
      leaseTime: 86400,
      dnsServers: ['8.8.8.8'],
      defaultGateway: ''
    };
    updDhcp({ pools: [...dhcpConfig.pools, newPool] });
  };

  const updatePool = (poolId, updates) => {
    updDhcp({
      pools: dhcpConfig.pools.map(p => p.id === poolId ? { ...p, ...updates } : p)
    });
  };

  const deletePool = (poolId) => {
    updDhcp({ pools: dhcpConfig.pools.filter(p => p.id !== poolId) });
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={dhcpConfig.enabled}
          onChange={(e) => updDhcp({ enabled: e.target.checked })}
        />
        <span className="text-sm font-medium">Enable DHCP Server</span>
      </label>

      {dhcpConfig.enabled && (
        <>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">DHCP Pools</label>
            <button onClick={addPool} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
              + Add Pool
            </button>
          </div>

          {dhcpConfig.pools.map(pool => (
            <div
              key={pool.id}
              className="p-3 rounded border space-y-2"
              style={{ borderColor: theme.border, background: theme.bg }}
            >
              <div className="flex justify-between">
                <input
                  value={pool.name}
                  onChange={(e) => updatePool(pool.id, { name: e.target.value })}
                  className="font-medium px-2 py-1 rounded border flex-1 mr-2 text-sm"
                  style={{ background: theme.surface, borderColor: theme.border }}
                />
                <button onClick={() => deletePool(pool.id)} className="text-red-600 text-xs">
                  Delete
                </button>
              </div>

              <select
                value={pool.vlanId}
                onChange={(e) => updatePool(pool.id, { vlanId: parseInt(e.target.value) })}
                className="w-full px-2 py-1 rounded border text-sm"
                style={{ background: theme.surface, borderColor: theme.border }}
              >
                {Object.values(vlans).map(v => (
                  <option key={v.id} value={v.id}>VLAN {v.id} - {v.name} ({v.subnet})</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input
                  value={pool.startIp}
                  onChange={(e) => updatePool(pool.id, { startIp: e.target.value })}
                  placeholder="Start IP"
                  className="px-2 py-1 rounded border text-sm font-mono"
                  style={{ background: theme.surface, borderColor: theme.border }}
                />
                <input
                  value={pool.endIp}
                  onChange={(e) => updatePool(pool.id, { endIp: e.target.value })}
                  placeholder="End IP"
                  className="px-2 py-1 rounded border text-sm font-mono"
                  style={{ background: theme.surface, borderColor: theme.border }}
                />
              </div>

              <input
                value={pool.defaultGateway}
                onChange={(e) => updatePool(pool.id, { defaultGateway: e.target.value })}
                placeholder="Default Gateway"
                className="w-full px-2 py-1 rounded border text-sm font-mono"
                style={{ background: theme.surface, borderColor: theme.border }}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default DhcpConfigTab;
