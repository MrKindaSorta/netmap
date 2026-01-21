import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// Icon component
const Icon = ({ d, s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

// Modal component
const Modal = React.memo(({ title, onClose, children, theme }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col" style={{ background: theme.surface, color: theme.text }} onClick={e => e.stopPropagation()}>
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: theme.border }}>
        <h3 className="font-bold">{title}</h3>
        <button onClick={onClose}><Icon d="M18 6L6 18M6 6l12 12" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  </div>
));

// ContextMenu component
const ContextMenu = ({ visible, x, y, items, onClose, theme }) => {
  const menuRef = useRef(null);
  const [submenuState, setSubmenuState] = useState({ index: null, x: 0, y: 0 });
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    if (!visible || !menuRef.current) return;

    // Boundary detection
    const rect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 10;
    }
    if (y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 10;
    }

    if (adjustedX !== x || adjustedY !== y) {
      setPosition({ x: adjustedX, y: adjustedY });
    }

    // Click outside to close
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    // Escape key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, x, y, onClose]);

  if (!visible) return null;

  const handleItemClick = (item) => {
    if (item.disabled || item.submenu) return;
    if (item.action) {
      item.action();
    }
    onClose();
  };

  const handleMouseEnter = (item, index, e) => {
    if (item.submenu) {
      const itemRect = e.currentTarget.getBoundingClientRect();
      const submenuX = itemRect.right + 5;
      const submenuY = itemRect.top;

      // Check if submenu would go off-screen to the right
      const estimatedWidth = 200;
      const adjustedX = submenuX + estimatedWidth > window.innerWidth
        ? itemRect.left - estimatedWidth - 5
        : submenuX;

      setSubmenuState({ index, x: adjustedX, y: submenuY });
    }
  };

  const handleMouseLeave = () => {
    setSubmenuState({ index: null, x: 0, y: 0 });
  };

  return (
    <>
      <div
        ref={menuRef}
        className="fixed rounded-lg shadow-2xl py-1 min-w-[200px] z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          color: theme.text
        }}
      >
        {items.map((item, index) => {
          if (item.divider) {
            return (
              <div
                key={index}
                className="my-1"
                style={{ borderTop: `1px solid ${theme.border}` }}
              />
            );
          }

          return (
            <div
              key={index}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-sm ${
                item.disabled ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              style={{
                background: submenuState.index === index ? theme.hover : 'transparent'
              }}
              onClick={() => handleItemClick(item)}
              onMouseEnter={(e) => handleMouseEnter(item, index, e)}
              onMouseLeave={handleMouseLeave}
            >
              {item.icon && (
                <Icon d={item.icon} s={16} />
              )}
              <span className="flex-1">{item.label}</span>
              {item.submenu && (
                <Icon d="M9 18l6-6-6-6" s={16} />
              )}
            </div>
          );
        })}
      </div>

      {/* Render submenu */}
      {submenuState.index !== null && items[submenuState.index]?.submenu && (
        <div
          className="fixed rounded-lg shadow-2xl py-1 min-w-[180px] z-50"
          style={{
            left: `${submenuState.x}px`,
            top: `${submenuState.y}px`,
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            color: theme.text
          }}
          onMouseEnter={() => {/* Keep submenu open */}}
          onMouseLeave={handleMouseLeave}
        >
          {items[submenuState.index].submenu.map((subItem, subIndex) => (
            <div
              key={subIndex}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-sm ${
                subItem.disabled ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              style={{ background: 'transparent' }}
              onClick={() => handleItemClick(subItem)}
            >
              {subItem.icon && (
                <Icon d={subItem.icon} s={16} />
              )}
              <span>{subItem.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// Tab Components for DevModal
const BasicConfigTab = ({ device, upd, theme, deviceTypes, statusColors, buildings }) => (
  <div className="space-y-3">
    <input value={device.name} onChange={(e) => upd({ name: e.target.value })}
      placeholder="Device Name" className="w-full px-3 py-2 rounded border"
      style={{ background: theme.bg, borderColor: theme.border }} />

    <div className="grid grid-cols-2 gap-3">
      <select value={device.type} onChange={(e) => upd({ type: e.target.value })}
        className="px-3 py-2 rounded border" style={{ background: theme.bg, borderColor: theme.border }}>
        {deviceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <select value={device.status} onChange={(e) => upd({ status: e.target.value })}
        className="px-3 py-2 rounded border" style={{ background: theme.bg, borderColor: theme.border }}>
        {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <input value={device.ip || ''} onChange={(e) => upd({ ip: e.target.value })}
        placeholder="IP Address" className="px-3 py-2 rounded border font-mono text-sm"
        style={{ background: theme.bg, borderColor: theme.border }} />
      <input value={device.mac || ''} onChange={(e) => upd({ mac: e.target.value })}
        placeholder="MAC Address" className="px-3 py-2 rounded border font-mono text-sm"
        style={{ background: theme.bg, borderColor: theme.border }} />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <select value={device.buildingId || ''} onChange={(e) => upd({ buildingId: e.target.value })}
        className="px-3 py-2 rounded border" style={{ background: theme.bg, borderColor: theme.border }}>
        {Object.values(buildings).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <select value={device.floor || 1} onChange={(e) => upd({ floor: parseInt(e.target.value) })}
        className="px-3 py-2 rounded border" style={{ background: theme.bg, borderColor: theme.border }}>
        {(buildings[device.buildingId]?.floors || []).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
    </div>

    {(device.type === 'switch' || device.type === 'core') && (
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={device.isRoot || false}
          onChange={(e) => upd({ isRoot: e.target.checked })} />
        <span className="text-sm">Spanning Tree Root</span>
      </label>
    )}

    <textarea value={device.notes || ''} onChange={(e) => upd({ notes: e.target.value })}
      placeholder="Notes" rows={3} className="w-full px-3 py-2 rounded border text-sm"
      style={{ background: theme.bg, borderColor: theme.border }} />
  </div>
);

const VlanConfigTab = ({ device, upd, theme, vlans }) => (
  <div className="space-y-3">
    <div className="text-sm" style={{ color: theme.textMuted }}>
      Select VLANs for this device. Switches: trunk VLANs. End devices: access VLAN.
    </div>
    <div className="flex flex-wrap gap-2">
      {Object.values(vlans).map(v => (
        <button
          key={v.id}
          onClick={() => upd({
            vlans: device.vlans?.includes(v.id)
              ? device.vlans.filter(x => x !== v.id)
              : [...(device.vlans || []), v.id]
          })}
          className={`px-3 py-2 rounded-lg text-sm transition-all ${
            device.vlans?.includes(v.id) ? 'ring-2' : 'opacity-50'
          }`}
          style={{ background: v.color + '20', color: v.color, ringColor: v.color }}
        >
          <div className="font-bold">VLAN {v.id}</div>
          <div className="text-xs">{v.name}</div>
        </button>
      ))}
    </div>
  </div>
);

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
        <input type="checkbox" checked={dhcpConfig.enabled}
          onChange={(e) => updDhcp({ enabled: e.target.checked })} />
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
            <div key={pool.id} className="p-3 rounded border space-y-2"
              style={{ borderColor: theme.border, background: theme.bg }}>
              <div className="flex justify-between">
                <input value={pool.name} onChange={(e) => updatePool(pool.id, { name: e.target.value })}
                  className="font-medium px-2 py-1 rounded border flex-1 mr-2 text-sm"
                  style={{ background: theme.surface, borderColor: theme.border }} />
                <button onClick={() => deletePool(pool.id)} className="text-red-600 text-xs">Delete</button>
              </div>

              <select value={pool.vlanId} onChange={(e) => updatePool(pool.id, { vlanId: parseInt(e.target.value) })}
                className="w-full px-2 py-1 rounded border text-sm"
                style={{ background: theme.surface, borderColor: theme.border }}>
                {Object.values(vlans).map(v => (
                  <option key={v.id} value={v.id}>VLAN {v.id} - {v.name} ({v.subnet})</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input value={pool.startIp} onChange={(e) => updatePool(pool.id, { startIp: e.target.value })}
                  placeholder="Start IP" className="px-2 py-1 rounded border text-sm font-mono"
                  style={{ background: theme.surface, borderColor: theme.border }} />
                <input value={pool.endIp} onChange={(e) => updatePool(pool.id, { endIp: e.target.value })}
                  placeholder="End IP" className="px-2 py-1 rounded border text-sm font-mono"
                  style={{ background: theme.surface, borderColor: theme.border }} />
              </div>

              <input value={pool.defaultGateway} onChange={(e) => updatePool(pool.id, { defaultGateway: e.target.value })}
                placeholder="Default Gateway" className="w-full px-2 py-1 rounded border text-sm font-mono"
                style={{ background: theme.surface, borderColor: theme.border }} />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

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
        <div key={ssid.id} className="p-3 rounded border space-y-2"
          style={{ borderColor: theme.border, background: theme.bg }}>
          <div className="flex justify-between items-center">
            <input value={ssid.name} onChange={(e) => updateSSID(ssid.id, { name: e.target.value })}
              placeholder="SSID Name" className="font-medium px-2 py-1 rounded border flex-1 mr-2 text-sm"
              style={{ background: theme.surface, borderColor: theme.border }} />
            <label className="flex items-center gap-1 text-xs mr-2">
              <input type="checkbox" checked={ssid.enabled}
                onChange={(e) => updateSSID(ssid.id, { enabled: e.target.checked })} />
              Enabled
            </label>
            <button onClick={() => deleteSSID(ssid.id)} className="text-red-600 text-xs">Delete</button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select value={ssid.vlanId} onChange={(e) => updateSSID(ssid.id, { vlanId: parseInt(e.target.value) })}
              className="px-2 py-1 rounded border text-sm"
              style={{ background: theme.surface, borderColor: theme.border }}>
              {Object.values(vlans).map(v => (
                <option key={v.id} value={v.id}>VLAN {v.id} - {v.name}</option>
              ))}
            </select>

            <select value={ssid.security} onChange={(e) => updateSSID(ssid.id, { security: e.target.value })}
              className="px-2 py-1 rounded border text-sm"
              style={{ background: theme.surface, borderColor: theme.border }}>
              <option value="open">Open</option>
              <option value="wpa2-psk">WPA2-PSK</option>
              <option value="wpa2-enterprise">WPA2-Enterprise</option>
              <option value="wpa3">WPA3</option>
            </select>
          </div>

          {(ssid.security === 'wpa2-psk' || ssid.security === 'wpa3') && (
            <input type="password" value={ssid.password}
              onChange={(e) => updateSSID(ssid.id, { password: e.target.value })}
              placeholder="Password" className="w-full px-2 py-1 rounded border text-sm"
              style={{ background: theme.surface, borderColor: theme.border }} />
          )}

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={ssid.hidden}
              onChange={(e) => updateSSID(ssid.id, { hidden: e.target.checked })} />
            Hidden Network
          </label>
        </div>
      ))}
    </div>
  );
};

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
          <input value={voipConfig.sipServer} onChange={(e) => updVoip({ sipServer: e.target.value })}
            placeholder="10.0.25.10" className="w-full px-3 py-2 rounded border font-mono mt-1"
            style={{ background: theme.bg, borderColor: theme.border }} />
        </div>
        <div>
          <label className="text-sm">SIP Port</label>
          <input type="number" value={voipConfig.sipPort}
            onChange={(e) => updVoip({ sipPort: parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded border font-mono mt-1"
            style={{ background: theme.bg, borderColor: theme.border }} />
        </div>
      </div>

      <div>
        <label className="text-sm">Extension</label>
        <input value={voipConfig.extension} onChange={(e) => updVoip({ extension: e.target.value })}
          placeholder="1001" className="w-full px-3 py-2 rounded border font-mono mt-1"
          style={{ background: theme.bg, borderColor: theme.border }} />
      </div>

      <div>
        <label className="text-sm">Codec</label>
        <select value={voipConfig.codec} onChange={(e) => updVoip({ codec: e.target.value })}
          className="w-full px-3 py-2 rounded border mt-1"
          style={{ background: theme.bg, borderColor: theme.border }}>
          <option value="G.711">G.711 (64 kbps)</option>
          <option value="G.722">G.722 (64 kbps HD)</option>
          <option value="G.729">G.729 (8 kbps)</option>
        </select>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={voipConfig.qosEnabled}
          onChange={(e) => updVoip({ qosEnabled: e.target.checked })} />
        <span className="text-sm">Enable QoS (DSCP 46)</span>
      </label>
    </div>
  );
};

const AdvancedConfigTab = ({ device, upd, theme }) => (
  <div className="space-y-3">
    <div className="text-sm" style={{ color: theme.textMuted }}>
      Advanced configuration options for this device type.
    </div>
  </div>
);

// DevModal component with tabs
const DevModal = React.memo(({ device, deviceId, onClose, onUpdate, theme, deviceTypes, statusColors, buildings, vlans }) => {
  if (!device) return null;

  const [activeTab, setActiveTab] = useState('basic');
  const availableTabs = getAvailableTabs(device);
  const upd = (updates) => onUpdate(deviceId, updates);

  const tabs = [
    { id: 'basic', label: 'Basic', icon: 'M12 2l10 5v5' },
    { id: 'vlans', label: 'VLANs', icon: 'M4 4h16v16H4z' },
    { id: 'dhcp', label: 'DHCP', icon: 'M12 2l10 5' },
    { id: 'ssid', label: 'SSIDs', icon: 'M8 9a6 6 0 018 0' },
    { id: 'voip', label: 'VOIP', icon: 'M7 3h10v14H7z' },
    { id: 'advanced', label: 'Advanced', icon: 'M12 2l10 5v5' }
  ].filter(tab => availableTabs.includes(tab.id));

  return (
    <Modal title={`Edit Device: ${device.name}`} onClose={onClose} theme={theme}>
      {tabs.length > 1 && (
        <div className="flex border-b mb-4" style={{ borderColor: theme.border }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-blue-600' : 'border-transparent'
              }`}
              style={{ color: activeTab === tab.id ? '#2563eb' : theme.textMuted }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {activeTab === 'basic' && <BasicConfigTab device={device} upd={upd} theme={theme} deviceTypes={deviceTypes} statusColors={statusColors} buildings={buildings} />}
        {activeTab === 'vlans' && <VlanConfigTab device={device} upd={upd} theme={theme} vlans={vlans} />}
        {activeTab === 'dhcp' && <DhcpConfigTab device={device} upd={upd} theme={theme} vlans={vlans} />}
        {activeTab === 'ssid' && <SsidConfigTab device={device} upd={upd} theme={theme} vlans={vlans} />}
        {activeTab === 'voip' && <VoipConfigTab device={device} upd={upd} theme={theme} />}
        {activeTab === 'advanced' && <AdvancedConfigTab device={device} upd={upd} theme={theme} />}
      </div>

      <button onClick={onClose} className="w-full py-2 bg-blue-600 text-white rounded font-medium mt-4">
        Done
      </button>
    </Modal>
  );
});

// ConnModal component
const ConnModal = React.memo(({ connection, connectionId, devices, onClose, onUpdate, theme, connTypes, speeds, cableTypes, vlans, getUnit }) => {
  if (!connection) return null;

  const upd = (updates) => onUpdate(connectionId, updates);

  return (
    <Modal title="Edit Connection" onClose={onClose} theme={theme}>
      <div className="space-y-3">
        <div className="text-center p-2 rounded" style={{ background: theme.bg }}><span className="font-medium">{devices[connection.from]?.name}</span> ↔ <span className="font-medium">{devices[connection.to]?.name}</span></div>
        <div className="grid grid-cols-2 gap-3">
          <input value={connection.fromPort || ''} onChange={(e) => upd({ fromPort: e.target.value })} placeholder="From Port" className="px-3 py-2 rounded border font-mono" style={{ background: theme.bg, borderColor: theme.border }} />
          <input value={connection.toPort || ''} onChange={(e) => upd({ toPort: e.target.value })} placeholder="To Port" className="px-3 py-2 rounded border font-mono" style={{ background: theme.bg, borderColor: theme.border }} />
          <select value={connection.type} onChange={(e) => upd({ type: e.target.value })} className="px-3 py-2 rounded border" style={{ background: theme.bg, borderColor: theme.border }}>{connTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
          <select value={connection.speed || ''} onChange={(e) => upd({ speed: e.target.value })} className="px-3 py-2 rounded border" style={{ background: theme.bg, borderColor: theme.border }}>{speeds.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <select value={connection.cableType || 'cat6'} onChange={(e) => upd({ cableType: e.target.value })} className="px-3 py-2 rounded border" style={{ background: theme.bg, borderColor: theme.border }}>{cableTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
          <input type="number" value={connection.cableLength || 0} onChange={(e) => upd({ cableLength: parseFloat(e.target.value) || 0 })} placeholder={`Length (${getUnit()})`} className="px-3 py-2 rounded border" style={{ background: theme.bg, borderColor: theme.border }} />
        </div>
        <div><label className="text-xs" style={{ color: theme.textMuted }}>VLANs</label><div className="flex flex-wrap gap-1 mt-1">{Object.values(vlans).map(v => <button key={v.id} onClick={() => upd({ vlans: connection.vlans?.includes(v.id) ? connection.vlans.filter(x => x !== v.id) : [...(connection.vlans || []), v.id] })} className={`px-2 py-0.5 rounded-full text-xs ${connection.vlans?.includes(v.id) ? 'ring-1' : 'opacity-40'}`} style={{ background: v.color + '20', color: v.color }}>{v.id}</button>)}</div></div>
        <button onClick={onClose} className="w-full py-2 bg-blue-600 text-white rounded font-medium">Done</button>
      </div>
    </Modal>
  );
});

// IP/CIDR Helper Functions
const ipToNumber = (ip) => {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
};

const checkIpInSubnet = (ip, cidr) => {
  const [subnet, mask] = cidr.split('/');
  const ipNum = ipToNumber(ip);
  const subnetNum = ipToNumber(subnet);
  const maskBits = parseInt(mask);
  const maskNum = -1 << (32 - maskBits);
  return (ipNum & maskNum) === (subnetNum & maskNum);
};

// Validation Functions
const validateVlanId = (id, existingVlans, currentId = null) => {
  const numId = parseInt(id);
  if (isNaN(numId)) return "VLAN ID must be a number";
  if (numId < 1 || numId > 4094) return "VLAN ID must be between 1 and 4094";
  if (numId !== currentId && existingVlans[numId]) return `VLAN ${numId} already exists`;
  return null;
};

const validateSubnet = (subnet) => {
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
  if (!subnet?.trim()) return "Subnet is required";
  if (!cidrRegex.test(subnet)) return "Invalid CIDR notation (e.g., 10.0.10.0/24)";

  const [ip, mask] = subnet.split('/');
  const octets = ip.split('.').map(Number);
  const maskNum = parseInt(mask);

  if (octets.some(o => o < 0 || o > 255)) return "IP octets must be between 0 and 255";
  if (maskNum < 0 || maskNum > 32) return "Subnet mask must be between 0 and 32";
  return null;
};

const validateGateway = (gateway, subnet) => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!gateway?.trim()) return "Gateway is required";
  if (!ipRegex.test(gateway)) return "Invalid IP address format";

  const octets = gateway.split('.').map(Number);
  if (octets.some(o => o < 0 || o > 255)) return "IP octets must be between 0 and 255";

  if (subnet && !validateSubnet(subnet)) {
    if (!checkIpInSubnet(gateway, subnet)) {
      return `Gateway must be within subnet ${subnet}`;
    }
  }
  return null;
};

const validateVlanForm = (vlanData, existingVlans, currentId = null) => {
  const errors = {};

  const idError = validateVlanId(vlanData.id, existingVlans, currentId);
  if (idError) errors.id = idError;

  if (!vlanData.name?.trim()) errors.name = "VLAN name is required";

  const subnetError = validateSubnet(vlanData.subnet);
  if (subnetError) errors.subnet = subnetError;

  const gatewayError = validateGateway(vlanData.gateway, vlanData.subnet);
  if (gatewayError) errors.gateway = gatewayError;

  if (!vlanData.color?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
    errors.color = "Invalid hex color";
  }

  return errors;
};

// VlanModal component
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

  return (
    <Modal title={isCreate ? "Create VLAN" : `Edit VLAN ${vlan?.id}`} onClose={onClose} theme={theme}>
      <div className="space-y-3">
        {/* VLAN ID */}
        <div>
          <label className="text-sm">VLAN ID</label>
          <input
            type="number"
            value={localVlan.id}
            onChange={(e) => setLocalVlan({...localVlan, id: e.target.value})}
            disabled={!isCreate}
            className="w-full px-3 py-2 rounded border mt-1"
            style={{ background: theme.bg, borderColor: errors.id ? '#ef4444' : theme.border }}
          />
          {errors.id && <div className="text-xs text-red-600 mt-1">{errors.id}</div>}
        </div>

        {/* VLAN Name */}
        <div>
          <label className="text-sm">VLAN Name</label>
          <input
            value={localVlan.name}
            onChange={(e) => setLocalVlan({...localVlan, name: e.target.value})}
            placeholder="e.g., Management, Guest, VoIP"
            className="w-full px-3 py-2 rounded border mt-1"
            style={{ background: theme.bg, borderColor: errors.name ? '#ef4444' : theme.border }}
          />
          {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
        </div>

        {/* Subnet */}
        <div>
          <label className="text-sm">Subnet (CIDR)</label>
          <input
            value={localVlan.subnet}
            onChange={(e) => setLocalVlan({...localVlan, subnet: e.target.value})}
            placeholder="10.0.10.0/24"
            className="w-full px-3 py-2 rounded border font-mono mt-1"
            style={{ background: theme.bg, borderColor: errors.subnet ? '#ef4444' : theme.border }}
          />
          {errors.subnet && <div className="text-xs text-red-600 mt-1">{errors.subnet}</div>}
        </div>

        {/* Gateway */}
        <div>
          <label className="text-sm">Gateway IP</label>
          <input
            value={localVlan.gateway}
            onChange={(e) => setLocalVlan({...localVlan, gateway: e.target.value})}
            placeholder="10.0.10.1"
            className="w-full px-3 py-2 rounded border font-mono mt-1"
            style={{ background: theme.bg, borderColor: errors.gateway ? '#ef4444' : theme.border }}
          />
          {errors.gateway && <div className="text-xs text-red-600 mt-1">{errors.gateway}</div>}
        </div>

        {/* Color */}
        <div>
          <label className="text-sm">Color</label>
          <input
            type="color"
            value={localVlan.color}
            onChange={(e) => setLocalVlan({...localVlan, color: e.target.value})}
            className="w-full h-10 rounded border mt-1"
            style={{ borderColor: theme.border }}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm">Description</label>
          <textarea
            value={localVlan.description}
            onChange={(e) => setLocalVlan({...localVlan, description: e.target.value})}
            placeholder="Optional description"
            rows={2}
            className="w-full px-3 py-2 rounded border text-sm mt-1"
            style={{ background: theme.bg, borderColor: theme.border }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isCreate && (
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded font-medium">
              Delete
            </button>
          )}
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded font-medium" style={{ borderColor: theme.border }}>
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-medium">
            {isCreate ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
});

// Device Capabilities System
const DEVICE_CAPABILITIES = {
  router: {
    layer: 3,
    canManageVlans: true,
    canRunDhcp: true,
    hasAdvancedConfig: true,
    supportedFeatures: ['vlans', 'dhcp', 'routing']
  },
  firewall: {
    layer: 3,
    canManageVlans: true,
    canRunDhcp: true,
    hasAdvancedConfig: true,
    supportedFeatures: ['vlans', 'dhcp', 'routing', 'firewall']
  },
  core: {
    layer: 3,
    canManageVlans: true,
    canRunDhcp: true,
    hasAdvancedConfig: true,
    supportedFeatures: ['vlans', 'dhcp', 'routing']
  },
  switch: {
    layer: 2,
    canManageVlans: true,
    canRunDhcp: false,
    hasAdvancedConfig: true,
    supportedFeatures: ['vlans', 'spanning-tree']
  },
  ap: {
    layer: 2,
    canManageVlans: false,
    canRunDhcp: false,
    hasAdvancedConfig: true,
    supportedFeatures: ['ssid', 'wifi'],
    canBroadcastSSID: true
  },
  unmanaged: {
    layer: 2,
    canManageVlans: false,
    canRunDhcp: false,
    hasAdvancedConfig: false,
    supportedFeatures: []
  },
  server: {
    layer: null,
    canManageVlans: false,
    canRunDhcp: false,
    hasAdvancedConfig: true,
    supportedFeatures: ['services'],
    isEndDevice: true
  },
  workstation: {
    layer: null,
    canManageVlans: false,
    canRunDhcp: false,
    hasAdvancedConfig: false,
    supportedFeatures: [],
    isEndDevice: true,
    hideVlanConfig: true
  },
  printer: {
    layer: null,
    canManageVlans: false,
    canRunDhcp: false,
    hasAdvancedConfig: false,
    supportedFeatures: [],
    isEndDevice: true,
    hideVlanConfig: true
  },
  camera: {
    layer: null,
    canManageVlans: false,
    canRunDhcp: false,
    hasAdvancedConfig: false,
    supportedFeatures: [],
    isEndDevice: true,
    hideVlanConfig: true
  },
  phone: {
    layer: null,
    canManageVlans: false,
    canRunDhcp: false,
    hasAdvancedConfig: true,
    supportedFeatures: ['voip'],
    isEndDevice: true,
    hideVlanConfig: true,
    requiresVoip: true
  },
  cloud: {
    layer: null,
    canManageVlans: false,
    canRunDhcp: false,
    hasAdvancedConfig: false,
    supportedFeatures: [],
    isVirtual: true
  },
  wan: {
    layer: null,
    canManageVlans: false,
    canRunDhcp: false,
    hasAdvancedConfig: false,
    supportedFeatures: [],
    isUplink: true
  },
  unknown: {
    layer: null,
    canManageVlans: false,
    canRunDhcp: false,
    hasAdvancedConfig: false,
    supportedFeatures: []
  }
};

const getDeviceCapabilities = (deviceType) => {
  return DEVICE_CAPABILITIES[deviceType] || DEVICE_CAPABILITIES.unknown;
};

const getAvailableTabs = (device) => {
  const caps = getDeviceCapabilities(device.type);
  const tabs = ['basic'];

  if (caps.canManageVlans && !caps.hideVlanConfig) tabs.push('vlans');
  if (caps.canRunDhcp) tabs.push('dhcp');
  if (caps.canBroadcastSSID) tabs.push('ssid');
  if (caps.requiresVoip) tabs.push('voip');
  if (caps.hasAdvancedConfig) tabs.push('advanced');

  return tabs;
};

const migrateDeviceData = (device) => {
  return {
    ...device,
    dhcpConfig: device.dhcpConfig || { enabled: false, pools: [] },
    ssidConfig: device.ssidConfig || { ssids: [] },
    voipConfig: device.voipConfig || null
  };
};

const NetworkTopologyEditor = () => {
  // Circle size control feature
  const [viewMode, setViewMode] = useState('logical');
  const [measurementUnit, setMeasurementUnit] = useState('imperial');

  const [devices, setDevices] = useState({
    'dev-1': { id: 'dev-1', name: 'KSP-BP-MX85', type: 'firewall', ip: '10.0.10.1', mac: 'f8:9e:28:85:b2:4c', x: 400, y: 60, physicalX: 150, physicalY: 120, buildingId: 'bldg-1', floor: 1, notes: 'Meraki MX85 Gateway', isRoot: false, status: 'up', vlans: [1] },
    'dev-2': { id: 'dev-2', name: 'KSP-BP-MDF', type: 'core', ip: '10.0.10.254', mac: 'a4:9b:cd:83:15:85', x: 400, y: 180, physicalX: 150, physicalY: 180, buildingId: 'bldg-1', floor: 1, notes: 'Cisco CBS350-48FP-4G', isRoot: true, status: 'up', vlans: [1, 20, 25, 30, 60, 80] },
    'dev-3': { id: 'dev-3', name: 'KSP-MDF-SW2', type: 'switch', ip: '10.0.10.157', mac: '9c:e3:30:f2:7c:b0', x: 150, y: 300, physicalX: 400, physicalY: 150, buildingId: 'bldg-1', floor: 1, notes: 'Meraki MS350-48FP', isRoot: false, status: 'up', vlans: [1, 2002, 2003] },
    'dev-4': { id: 'dev-4', name: 'KSP-BP-IDF1', type: 'switch', ip: '10.0.10.253', mac: 'a4:9b:cd:82:f1:39', x: 650, y: 300, physicalX: 480, physicalY: 280, buildingId: 'bldg-1', floor: 1, notes: 'Cisco CBS350-48FP-4G', isRoot: false, status: 'up', vlans: [1, 20, 25, 60] },
    'dev-5': { id: 'dev-5', name: 'KSP-BP-IDF2', type: 'switch', ip: '10.0.10.252', mac: 'a4:9b:cd:82:ed:4a', x: 500, y: 420, physicalX: 150, physicalY: 350, buildingId: 'bldg-1', floor: 1, notes: 'Loop: gi16-gi17', isRoot: false, status: 'warning', vlans: [1, 20, 80] },
    'dev-6': { id: 'dev-6', name: 'Warehouse-IDF', type: 'switch', ip: '10.0.10.36', mac: 'e0:63:da:e0:b0:ec', x: 350, y: 540, physicalX: 150, physicalY: 150, buildingId: 'bldg-2', floor: 1, notes: 'Warehouse switch', isRoot: false, status: 'up', vlans: [1, 20] },
  });

  const [connections, setConnections] = useState({
    'conn-1': { id: 'conn-1', from: 'dev-1', to: 'dev-2', fromPort: 'GbE5', toPort: 'gi47', type: 'trunk', speed: '1G', vlans: [1], cableType: 'cat6', cableLength: 3 },
    'conn-2': { id: 'conn-2', from: 'dev-2', to: 'dev-3', fromPort: 'gi2', toPort: 'gi1', type: 'trunk', speed: '1G', vlans: [1, 2002, 2003], cableType: 'cat6', cableLength: 15 },
    'conn-3': { id: 'conn-3', from: 'dev-2', to: 'dev-4', fromPort: 'gi50', toPort: 'gi49', type: 'trunk', speed: '1G', vlans: [1, 20, 25, 60], cableType: 'cat6', cableLength: 45 },
    'conn-4': { id: 'conn-4', from: 'dev-2', to: 'dev-5', fromPort: 'gi49', toPort: 'gi49', type: 'trunk', speed: '1G', vlans: [1, 20, 80], cableType: 'cat6', cableLength: 30 },
    'conn-5': { id: 'conn-5', from: 'dev-2', to: 'dev-6', fromPort: 'gi48', toPort: 'gi1', type: 'fiber', speed: '10G', vlans: [1, 20], cableType: 'smf', cableLength: 150 },
  });

  const [vlans, setVlans] = useState({
    1: { id: 1, name: 'Default', subnet: '10.0.10.0/24', gateway: '10.0.10.1', color: '#3b82f6', description: 'Management' },
    20: { id: 20, name: 'Warehouse', subnet: '10.0.20.0/24', gateway: '10.0.20.1', color: '#10b981', description: 'Warehouse Systems' },
    25: { id: 25, name: 'Polycom', subnet: '10.0.25.0/24', gateway: '10.0.25.1', color: '#8b5cf6', description: 'VoIP Phones' },
    30: { id: 30, name: 'HandHelds', subnet: '10.0.30.0/24', gateway: '10.0.30.1', color: '#f97316', description: 'Mobile Devices' },
    60: { id: 60, name: 'Wireless', subnet: '10.0.60.0/24', gateway: '10.0.60.1', color: '#06b6d4', description: 'AP Management' },
    80: { id: 80, name: 'Cameras', subnet: '10.0.80.0/24', gateway: '10.0.80.1', color: '#ec4899', description: 'Security Cameras' },
    2002: { id: 2002, name: 'LocusBot', subnet: '10.20.2.0/24', gateway: '10.20.2.1', color: '#eab308', description: 'Locus Robot Comm' },
    2003: { id: 2003, name: 'LocusApp', subnet: '10.20.3.0/24', gateway: '10.20.3.1', color: '#ef4444', description: 'Locus App Traffic' },
  });

  const [buildings, setBuildings] = useState({
    'bldg-1': {
      id: 'bldg-1', name: 'Main Office', x: 50, y: 50, width: 550, height: 450,
      floors: [{ id: 1, name: 'Ground Floor', image: null }],
      walls: [
        { id: 'w1', x1: 0, y1: 0, x2: 550, y2: 0 }, { id: 'w2', x1: 550, y1: 0, x2: 550, y2: 450 },
        { id: 'w3', x1: 550, y1: 450, x2: 0, y2: 450 }, { id: 'w4', x1: 0, y1: 450, x2: 0, y2: 0 },
        { id: 'w5', x1: 0, y1: 220, x2: 350, y2: 220 }, { id: 'w6', x1: 350, y1: 220, x2: 350, y2: 450 },
      ],
      rooms: [
        { id: 'r1', name: 'Server Room', x: 100, y: 100, width: 140, height: 100, color: '#3b82f620' },
        { id: 'r2', name: 'IDF Closet 1', x: 420, y: 240, width: 100, height: 80, color: '#8b5cf620' },
        { id: 'r3', name: 'IDF Closet 2', x: 100, y: 300, width: 100, height: 80, color: '#8b5cf620' },
      ],
      color: '#f1f5f9'
    },
    'bldg-2': {
      id: 'bldg-2', name: 'Warehouse', x: 650, y: 100, width: 300, height: 300,
      floors: [{ id: 1, name: 'Main Floor', image: null }],
      walls: [
        { id: 'w1', x1: 0, y1: 0, x2: 300, y2: 0 }, { id: 'w2', x1: 300, y1: 0, x2: 300, y2: 300 },
        { id: 'w3', x1: 300, y1: 300, x2: 0, y2: 300 }, { id: 'w4', x1: 0, y1: 300, x2: 0, y2: 0 },
      ],
      rooms: [{ id: 'r1', name: 'Network Closet', x: 100, y: 100, width: 80, height: 80, color: '#8b5cf620' }],
      color: '#fef9c3'
    }
  });

  const [interBuildingLinks, setInterBuildingLinks] = useState([{ id: 'ibl-1', from: 'bldg-1', to: 'bldg-2', label: 'Fiber - 150m' }]);

  const [selectedBuilding, setSelectedBuilding] = useState('bldg-1');
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawingStart, setDrawingStart] = useState(null);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [floorPlanImages, setFloorPlanImages] = useState({});
  const [imageOpacity, setImageOpacity] = useState(0.5);

  const [selectedDevices, setSelectedDevices] = useState(new Set());
  const [highlightedPath, setHighlightedPath] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editingConnection, setEditingConnection] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [tool, setTool] = useState('select');
  const [showGrid, setShowGrid] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [circleScale, setCircleScale] = useState(1);
  const [deviceLabelScale, setDeviceLabelScale] = useState(1);
  const [portLabelScale, setPortLabelScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [mouseDownPos, setMouseDownPos] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVlan, setFilterVlan] = useState(null);
  const [hoveredConn, setHoveredConn] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showVlanPanel, setShowVlanPanel] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    type: null,
    targetId: null,
    targetData: null
  });
  const [copiedDevices, setCopiedDevices] = useState(null);

  const svgRef = useRef(null);
  const fileInputRef = useRef(null);

  const pxPerFoot = 10, pxPerMeter = 32.8;
  const getPxPerUnit = () => measurementUnit === 'imperial' ? pxPerFoot : pxPerMeter;
  const getUnit = () => measurementUnit === 'imperial' ? 'ft' : 'm';
  const toDisplay = (px) => (px / getPxPerUnit()).toFixed(1);

  const deviceTypes = [
    { value: 'router', label: 'Router', icon: 'M4 8h16M4 8v8a2 2 0 002 2h12a2 2 0 002-2V8M4 8l2-4h12l2 4' },
    { value: 'firewall', label: 'Firewall', icon: 'M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z' },
    { value: 'core', label: 'Core Switch', icon: 'M4 4h16v16H4zM4 9h16M4 14h16M9 4v16M14 4v16' },
    { value: 'switch', label: 'Switch', icon: 'M4 6h16v12H4zM8 12h.01M12 12h.01M16 12h.01' },
    { value: 'unmanaged', label: 'Unmanaged', icon: 'M4 6h16v12H4zM8 12h.01M12 12h.01M16 12h.01' },
    { value: 'ap', label: 'Access Point', icon: 'M8.1 9.9a6 6 0 018 0M5 7a10 10 0 0114 0M12 14a2 2 0 100 4' },
    { value: 'server', label: 'Server', icon: 'M6 4h12v5H6zM6 11h12v5H6zM10 6.5h.01M10 13.5h.01' },
    { value: 'workstation', label: 'Workstation', icon: 'M5 4h14v10H5zM8 18h8M12 14v4' },
    { value: 'printer', label: 'Printer', icon: 'M6 9V4a1 1 0 011-1h10a1 1 0 011 1v5M4 9h16v8a1 1 0 01-1 1h-2v-4H7v4H5a1 1 0 01-1-1V9z' },
    { value: 'camera', label: 'Camera', icon: 'M12 12m-8 0a8 8 0 1016 0 8 8 0 10-16 0M12 12m-3 0a3 3 0 106 0' },
    { value: 'phone', label: 'VoIP Phone', icon: 'M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM12 17h.01' },
    { value: 'cloud', label: 'Cloud', icon: 'M18 10a4 4 0 00-8 0 4 4 0 00-4 4 3 3 0 003 3h9a4 4 0 001-7z' },
    { value: 'wan', label: 'WAN Uplink', icon: 'M12 2L2 7v6c0 5 3 10 8 12 5-2 8-7 8-12V7l-10-5M12 12l-6 3 6-9v6' },
    { value: 'unknown', label: 'Unknown', icon: 'M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0M12 8v4M12 16h.01' },
  ];

  const connTypes = [
    { value: 'trunk', label: 'Trunk', color: '#3b82f6', dash: '' },
    { value: 'access', label: 'Access', color: '#10b981', dash: '' },
    { value: 'lacp', label: 'LACP/Port-Channel', color: '#8b5cf6', dash: '' },
    { value: 'wan', label: 'WAN', color: '#f97316', dash: '8,4' },
    { value: 'management', label: 'Management', color: '#06b6d4', dash: '4,2' },
    { value: 'wireless', label: 'Wireless', color: '#a855f7', dash: '2,4' },
    { value: 'fiber', label: 'Fiber', color: '#eab308', dash: '' },
    { value: 'unknown', label: 'Unknown', color: '#ef4444', dash: '6,3' },
  ];

  const cableTypes = [
    { value: 'cat5e', label: 'Cat5e' }, { value: 'cat6', label: 'Cat6' }, { value: 'cat6a', label: 'Cat6a' },
    { value: 'mmf', label: 'Multimode Fiber' }, { value: 'smf', label: 'Singlemode Fiber' },
  ];

  const statusColors = {
    up: '#22c55e',
    down: '#ef4444',
    warning: '#eab308',
    maintenance: '#3b82f6',
    unknown: '#6b7280',
  };
  const speeds = ['10M', '100M', '1G', '2.5G', '5G', '10G', '25G', '40G', '100G'];

  const theme = darkMode ? {
    bg: '#1e1e2e', surface: '#2a2a3e', border: '#3a3a4e', text: '#e0e0e0', textMuted: '#888', grid: '#2a2a3e', gridL: '#3a3a4e',
    hover: '#3a3a4e', buttonActive: '#2563eb20', buttonActiveText: '#60a5fa'
  } : {
    bg: '#f8fafc', surface: '#fff', border: '#e2e8f0', text: '#1e293b', textMuted: '#64748b', grid: '#e2e8f0', gridL: '#cbd5e1',
    hover: '#f1f5f9', buttonActive: '#dbeafe', buttonActiveText: '#2563eb'
  };

  const genId = (p) => `${p}-${Date.now()}-${Math.random().toString(36).substr(2,6)}`;
  const getDevColor = (d) => {
    if (d.isRoot) return '#22c55e';
    const colors = {
      router: '#f97316', firewall: '#ef4444', core: '#3b82f6', switch: '#8b5cf6',
      unmanaged: '#eab308', ap: '#10b981', server: '#06b6d4', workstation: '#64748b',
      printer: '#a855f7', camera: '#ec4899', phone: '#14b8a6', cloud: '#6366f1', wan: '#16a34a', unknown: '#6b7280'
    };
    return colors[d.type] || '#6b7280';
  };
  const getConnStyle = (t) => connTypes.find(c => c.value === t) || connTypes[0];

  const getSvgPt = useCallback((e) => {
    const svg = svgRef.current; if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: (sp.x - pan.x) / zoom, y: (sp.y - pan.y) / zoom };
  }, [pan, zoom]);

  const saveHistory = useCallback(() => {
    const state = JSON.stringify({ devices, connections, buildings });
    const newHist = history.slice(0, historyIdx + 1);
    newHist.push(state);
    if (newHist.length > 40) newHist.shift();
    setHistory(newHist);
    setHistoryIdx(newHist.length - 1);
  }, [devices, connections, buildings, history, historyIdx]);

  const undo = () => { if (historyIdx > 0) { const s = JSON.parse(history[historyIdx - 1]); setDevices(s.devices); setConnections(s.connections); setBuildings(s.buildings); setHistoryIdx(historyIdx - 1); } };
  const redo = () => { if (historyIdx < history.length - 1) { const s = JSON.parse(history[historyIdx + 1]); setDevices(s.devices); setConnections(s.connections); setBuildings(s.buildings); setHistoryIdx(historyIdx + 1); } };

  const getGridBounds = useCallback(() => {
    if (!svgRef.current) return { x: 0, y: 0, width: 2000, height: 2000 };

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const padding = 100;

    return {
      x: (-pan.x / zoom) - padding,
      y: (-pan.y / zoom) - padding,
      width: (rect.width / zoom) + (padding * 2),
      height: (rect.height / zoom) + (padding * 2)
    };
  }, [pan, zoom]);

  const handleDeviceUpdate = useCallback((deviceId, updates) => {
    setDevices(prev => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], ...updates }
    }));
  }, []);

  const handleConnectionUpdate = useCallback((connectionId, updates) => {
    setConnections(prev => ({
      ...prev,
      [connectionId]: { ...prev[connectionId], ...updates }
    }));
  }, []);

  const [editingVlan, setEditingVlan] = useState(null);

  const handleVlanSave = useCallback((vlanId, vlanData, isCreate) => {
    if (isCreate) {
      setVlans(prev => ({ ...prev, [vlanData.id]: vlanData }));
    } else {
      setVlans(prev => ({ ...prev, [vlanId]: { ...prev[vlanId], ...vlanData } }));
    }
    setEditingVlan(null);
  }, []);

  const handleVlanDelete = useCallback((vlanId) => {
    setVlans(prev => {
      const newVlans = { ...prev };
      delete newVlans[vlanId];
      return newVlans;
    });

    // Remove from devices
    setDevices(prev => {
      const updated = {};
      Object.keys(prev).forEach(devId => {
        updated[devId] = {
          ...prev[devId],
          vlans: prev[devId].vlans?.filter(v => v !== vlanId) || []
        };
      });
      return updated;
    });

    // Remove from connections
    setConnections(prev => {
      const updated = {};
      Object.keys(prev).forEach(connId => {
        updated[connId] = {
          ...prev[connId],
          vlans: prev[connId].vlans?.filter(v => v !== vlanId) || []
        };
      });
      return updated;
    });

    setEditingVlan(null);
  }, []);

  const handleCloseDevModal = useCallback(() => {
    setEditingDevice(null);
  }, []);

  const handleCloseConnModal = useCallback(() => {
    setEditingConnection(null);
  }, []);

  useEffect(() => { if (history.length === 0) { setHistory([JSON.stringify({ devices, connections, buildings })]); setHistoryIdx(0); } }, []);
  useEffect(() => { const t = setTimeout(saveHistory, 600); return () => clearTimeout(t); }, [devices, connections, buildings]);

  const filteredDevs = useMemo(() => {
    let r = Object.values(devices);
    if (searchQuery) { const q = searchQuery.toLowerCase(); r = r.filter(d => d.name.toLowerCase().includes(q) || d.ip?.includes(q)); }
    if (filterVlan !== null) r = r.filter(d => d.vlans?.includes(filterVlan));
    if (viewMode === 'physical') r = r.filter(d => d.buildingId === selectedBuilding && d.floor === selectedFloor);
    return r.reduce((a, d) => ({ ...a, [d.id]: d }), {});
  }, [devices, searchQuery, filterVlan, viewMode, selectedBuilding, selectedFloor]);

  const filteredConns = useMemo(() => {
    let r = Object.values(connections);
    if (filterVlan !== null) r = r.filter(c => c.vlans?.includes(filterVlan));
    const ids = new Set(Object.keys(filteredDevs));
    return r.filter(c => ids.has(c.from) && ids.has(c.to)).reduce((a, c) => ({ ...a, [c.id]: c }), {});
  }, [connections, filteredDevs, filterVlan]);

  // Context Menu Action Handlers
  const copyIpAddress = useCallback((deviceId) => {
    const device = devices[deviceId];
    if (device?.ip) {
      navigator.clipboard.writeText(device.ip).catch(err => console.error('Failed to copy IP:', err));
    }
  }, [devices]);

  const copyMacAddress = useCallback((deviceId) => {
    const device = devices[deviceId];
    if (device?.mac) {
      navigator.clipboard.writeText(device.mac).catch(err => console.error('Failed to copy MAC:', err));
    }
  }, [devices]);

  const startConnectionFrom = useCallback((deviceId) => {
    setConnecting({ from: deviceId, fromPort: '', toPort: '', startX: devices[deviceId].x, startY: devices[deviceId].y });
  }, [devices]);

  const addToSelection = useCallback((deviceId) => {
    setSelectedDevices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  }, []);

  const changeDeviceType = useCallback((deviceId, newType) => {
    setDevices(prev => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], type: newType }
    }));
  }, []);

  const setAsRootBridge = useCallback((deviceId) => {
    setDevices(prev => {
      const updated = { ...prev };
      // Clear old root
      Object.keys(updated).forEach(id => {
        if (updated[id].isRoot) {
          updated[id] = { ...updated[id], isRoot: false };
        }
      });
      // Set new root
      updated[deviceId] = { ...updated[deviceId], isRoot: true };
      return updated;
    });
  }, []);

  const copyDevices = useCallback(() => {
    const devicesToCopy = Array.from(selectedDevices).map(id => devices[id]).filter(Boolean);
    if (devicesToCopy.length > 0) {
      setCopiedDevices(devicesToCopy);
    }
  }, [selectedDevices, devices]);

  const pasteDevicesAt = useCallback((svgX, svgY) => {
    if (!copiedDevices || copiedDevices.length === 0) return;

    const idMap = {};
    const newDevices = { ...devices };

    // Calculate offset from first device
    const firstDevice = copiedDevices[0];
    const offsetX = svgX - (viewMode === 'logical' ? firstDevice.x : firstDevice.physicalX);
    const offsetY = svgY - (viewMode === 'logical' ? firstDevice.y : firstDevice.physicalY);

    copiedDevices.forEach(device => {
      const newId = genId('dev');
      idMap[device.id] = newId;

      const newX = viewMode === 'logical'
        ? Math.round((device.x + offsetX) / 20) * 20
        : device.physicalX + offsetX;
      const newY = viewMode === 'logical'
        ? Math.round((device.y + offsetY) / 20) * 20
        : device.physicalY + offsetY;

      newDevices[newId] = {
        ...device,
        id: newId,
        name: device.name + ' Copy',
        x: viewMode === 'logical' ? newX : device.x,
        y: viewMode === 'logical' ? newY : device.y,
        physicalX: viewMode === 'physical' ? newX : device.physicalX,
        physicalY: viewMode === 'physical' ? newY : device.physicalY,
        isRoot: false // Don't copy root bridge status
      };
    });

    setDevices(newDevices);
    setSelectedDevices(new Set(Object.values(idMap)));
  }, [copiedDevices, devices, viewMode]);

  const selectAllDevices = useCallback(() => {
    setSelectedDevices(new Set(Object.keys(filteredDevs)));
  }, [filteredDevs]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const reverseConnection = useCallback((connectionId) => {
    setConnections(prev => ({
      ...prev,
      [connectionId]: {
        ...prev[connectionId],
        from: prev[connectionId].to,
        to: prev[connectionId].from,
        fromPort: prev[connectionId].toPort,
        toPort: prev[connectionId].fromPort
      }
    }));
  }, []);

  const changeConnectionType = useCallback((connectionId, newType) => {
    setConnections(prev => ({
      ...prev,
      [connectionId]: { ...prev[connectionId], type: newType }
    }));
  }, []);

  const changeConnectionSpeed = useCallback((connectionId, newSpeed) => {
    setConnections(prev => ({
      ...prev,
      [connectionId]: { ...prev[connectionId], speed: newSpeed }
    }));
  }, []);

  const deleteConnection = useCallback((connectionId) => {
    setConnections(prev => {
      const updated = { ...prev };
      delete updated[connectionId];
      return updated;
    });
    setSelectedConnection(null);
  }, []);

  // Context Menu Event Handlers
  const handleDeviceContextMenu = useCallback((e, deviceId) => {
    e.preventDefault();
    e.stopPropagation();

    // Select device if not already selected
    if (!selectedDevices.has(deviceId)) {
      setSelectedDevices(new Set([deviceId]));
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'device',
      targetId: deviceId,
      targetData: devices[deviceId]
    });
  }, [selectedDevices, devices]);

  const handleConnectionContextMenu = useCallback((e, connectionId) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedConnection(connectionId);

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'connection',
      targetId: connectionId,
      targetData: connections[connectionId]
    });
  }, [connections]);

  const handleCanvasContextMenu = useCallback((e) => {
    e.preventDefault();

    const pt = getSvgPt(e);

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'canvas',
      targetId: null,
      targetData: { svgX: pt.x, svgY: pt.y }
    });
  }, [getSvgPt]);

  // Menu Item Builders
  const getDeviceMenuItems = useCallback((deviceId) => {
    const device = devices[deviceId];
    const isMultiSelect = selectedDevices.size > 1;
    const isSwitch = device?.type === 'switch' || device?.type === 'core';

    return [
      {
        label: 'Edit Device',
        icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
        action: () => setEditingDevice(deviceId),
        disabled: isMultiSelect
      },
      {
        label: 'Duplicate Device',
        icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
        action: () => {
          Array.from(selectedDevices).forEach(id => {
            const dev = devices[id];
            const newId = genId('dev');
            const offset = 40;
            setDevices(prev => ({
              ...prev,
              [newId]: {
                ...dev,
                id: newId,
                name: dev.name + ' Copy',
                x: dev.x + offset,
                y: dev.y + offset,
                physicalX: dev.physicalX + offset,
                physicalY: dev.physicalY + offset,
                isRoot: false
              }
            }));
          });
        }
      },
      {
        label: isMultiSelect ? `Delete ${selectedDevices.size} Devices` : 'Delete Device',
        icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
        action: () => {
          setDevices(prev => {
            const updated = { ...prev };
            selectedDevices.forEach(id => delete updated[id]);
            return updated;
          });
          setConnections(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(cId => {
              if (selectedDevices.has(updated[cId].from) || selectedDevices.has(updated[cId].to)) {
                delete updated[cId];
              }
            });
            return updated;
          });
          setSelectedDevices(new Set());
        }
      },
      { divider: true },
      {
        label: 'Start Connection From Here',
        icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
        action: () => startConnectionFrom(deviceId),
        disabled: isMultiSelect
      },
      {
        label: selectedDevices.has(deviceId) && selectedDevices.size > 1 ? 'Remove from Selection' : 'Add to Selection',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        action: () => addToSelection(deviceId)
      },
      { divider: true },
      {
        label: 'Change Device Type',
        icon: 'M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01',
        submenu: deviceTypes.map(type => ({
          label: type.label,
          icon: type.icon,
          action: () => {
            selectedDevices.forEach(id => changeDeviceType(id, type.value));
          }
        }))
      },
      { divider: true },
      {
        label: 'Copy IP Address',
        icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
        action: () => copyIpAddress(deviceId),
        disabled: !device?.ip || isMultiSelect
      },
      {
        label: 'Copy MAC Address',
        icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
        action: () => copyMacAddress(deviceId),
        disabled: !device?.mac || isMultiSelect
      },
      ...(isSwitch ? [
        { divider: true },
        {
          label: 'Set as Root Bridge',
          icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
          action: () => setAsRootBridge(deviceId),
          disabled: isMultiSelect
        }
      ] : [])
    ].filter(item => item !== undefined);
  }, [devices, selectedDevices, deviceTypes, startConnectionFrom, addToSelection, changeDeviceType, copyIpAddress, copyMacAddress, setAsRootBridge]);

  const getConnectionMenuItems = useCallback((connectionId) => {
    const connection = connections[connectionId];

    return [
      {
        label: 'Edit Connection',
        icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
        action: () => setEditingConnection(connectionId)
      },
      {
        label: 'Delete Connection',
        icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
        action: () => deleteConnection(connectionId)
      },
      { divider: true },
      {
        label: 'Reverse Direction',
        icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
        action: () => reverseConnection(connectionId)
      },
      { divider: true },
      {
        label: 'Change Type',
        icon: 'M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01',
        submenu: connTypes.map(type => ({
          label: type.label,
          action: () => changeConnectionType(connectionId, type.value)
        }))
      },
      {
        label: 'Change Speed',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        submenu: [
          { label: '10 Mbps', action: () => changeConnectionSpeed(connectionId, '10M') },
          { label: '100 Mbps', action: () => changeConnectionSpeed(connectionId, '100M') },
          { label: '1 Gbps', action: () => changeConnectionSpeed(connectionId, '1G') },
          { label: '10 Gbps', action: () => changeConnectionSpeed(connectionId, '10G') },
          { label: '25 Gbps', action: () => changeConnectionSpeed(connectionId, '25G') },
          { label: '40 Gbps', action: () => changeConnectionSpeed(connectionId, '40G') },
          { label: '100 Gbps', action: () => changeConnectionSpeed(connectionId, '100G') }
        ]
      }
    ];
  }, [connections, connTypes, reverseConnection, changeConnectionType, changeConnectionSpeed, deleteConnection]);

  const getCanvasMenuItems = useCallback((svgX, svgY) => {
    const hasDevices = Object.keys(devices).length > 0;
    const hasCopiedDevices = copiedDevices && copiedDevices.length > 0;

    return [
      {
        label: 'Add Device Here',
        icon: 'M12 4v16m8-8H4',
        action: () => {
          const id = genId('dev');
          const x = viewMode === 'logical' ? Math.round(svgX / 20) * 20 : svgX;
          const y = viewMode === 'logical' ? Math.round(svgY / 20) * 20 : svgY;
          const newDev = {
            id,
            name: 'New Device',
            type: 'switch',
            ip: '',
            mac: '',
            x: viewMode === 'logical' ? x : 400,
            y: viewMode === 'logical' ? y : 300,
            physicalX: viewMode === 'physical' ? x : 100,
            physicalY: viewMode === 'physical' ? y : 100,
            buildingId: selectedBuilding,
            floor: selectedFloor,
            notes: '',
            isRoot: false,
            status: 'unknown',
            vlans: [1]
          };
          setDevices(prev => ({ ...prev, [id]: newDev }));
          setSelectedDevices(new Set([id]));
          setEditingDevice(id);
        }
      },
      {
        label: 'Paste',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        action: () => pasteDevicesAt(svgX, svgY),
        disabled: !hasCopiedDevices
      },
      { divider: true },
      {
        label: 'Select All',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        action: () => selectAllDevices(),
        disabled: !hasDevices
      },
      { divider: true },
      {
        label: 'Reset View',
        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
        action: () => resetView()
      }
    ];
  }, [devices, copiedDevices, viewMode, selectedBuilding, selectedFloor, pasteDevicesAt, selectAllDevices, resetView]);

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(z => Math.min(Math.max(z * (e.deltaY > 0 ? 0.9 : 1.1), 0.15), 5)); }
    else setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
  }, []);

  const handleMouseDown = useCallback((e) => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    const pt = getSvgPt(e);
    if (e.target === svgRef.current || e.target.classList.contains('bg-layer')) {
      if (drawingMode === 'wall' || drawingMode === 'room') setDrawingStart(pt);
      else if (drawingMode === 'measure') setMeasurePoints(p => [...p, pt]);
      else {
        if (e.ctrlKey || e.metaKey) {
          setSelectionBox({ startX: pt.x, startY: pt.y, endX: pt.x, endY: pt.y });
        } else {
          // Store mouse down position for distance calculation
          setMouseDownPos({ x: e.clientX, y: e.clientY, cleared: false });
          setIsPanning(true);
          setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
          // Don't clear selection here - wait to see if it's a click or drag
        }
      }
      setConnecting(null);
    }
  }, [getSvgPt, pan, viewMode, selectedBuilding, selectedFloor, drawingMode, setMouseDownPos]);

  const handleMouseMove = useCallback((e) => {
    if (selectionBox) {
      const pt = getSvgPt(e);
      setSelectionBox(prev => ({ ...prev, endX: pt.x, endY: pt.y }));
    } else if (isPanning && !dragging) {
      // Check if we've moved enough to consider this a drag (not a click)
      if (mouseDownPos && !mouseDownPos.cleared) {
        const dx = e.clientX - mouseDownPos.x;
        const dy = e.clientY - mouseDownPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If moved more than 5 pixels, it's a drag - don't clear selection
        if (distance > 5) {
          setMouseDownPos(prev => ({ ...prev, cleared: true }));
        }
      }
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (dragging) {
      const pt = getSvgPt(e);
      const [xk, yk] = viewMode === 'logical' ? ['x', 'y'] : ['physicalX', 'physicalY'];
      const snap = viewMode === 'logical' ? 20 : 10;
      const sx = showGrid ? Math.round(pt.x / snap) * snap : pt.x;
      const sy = showGrid ? Math.round(pt.y / snap) * snap : pt.y;
      if (selectedDevices.size > 1 && selectedDevices.has(dragging)) {
        const dd = devices[dragging]; const dx = sx - dd[xk]; const dy = sy - dd[yk];
        setDevices(p => { const u = { ...p }; selectedDevices.forEach(i => { u[i] = { ...u[i], [xk]: u[i][xk] + dx, [yk]: u[i][yk] + dy }; }); return u; });
      } else setDevices(p => ({ ...p, [dragging]: { ...p[dragging], [xk]: sx, [yk]: sy } }));
    }
  }, [selectionBox, isPanning, panStart, dragging, getSvgPt, showGrid, viewMode, selectedDevices, devices, mouseDownPos]);

  const handleMouseUp = useCallback((e) => {
    if (selectionBox) {
      const { startX, startY, endX, endY } = selectionBox;
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      const [xk, yk] = viewMode === 'logical' ? ['x', 'y'] : ['physicalX', 'physicalY'];
      const devicesInBox = Object.values(devices).filter(d => {
        const x = d[xk];
        const y = d[yk];
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      }).map(d => d.id);

      setSelectedDevices(new Set(devicesInBox));
      setSelectionBox(null);
    } else if (drawingStart && viewMode === 'physical') {
      const pt = getSvgPt(e); const b = buildings[selectedBuilding];
      if (drawingMode === 'wall') {
        const w = { id: genId('w'), x1: drawingStart.x - b.x, y1: drawingStart.y - b.y, x2: pt.x - b.x, y2: pt.y - b.y };
        setBuildings(p => ({ ...p, [selectedBuilding]: { ...p[selectedBuilding], walls: [...p[selectedBuilding].walls, w] } }));
      } else if (drawingMode === 'room') {
        const r = { id: genId('r'), name: 'New Room', x: Math.min(drawingStart.x, pt.x) - b.x, y: Math.min(drawingStart.y, pt.y) - b.y, width: Math.abs(pt.x - drawingStart.x), height: Math.abs(pt.y - drawingStart.y), color: '#3b82f620' };
        if (r.width > 20 && r.height > 20) setBuildings(p => ({ ...p, [selectedBuilding]: { ...p[selectedBuilding], rooms: [...p[selectedBuilding].rooms, r] } }));
      }
      setDrawingStart(null);
    }

    // Only clear selection if it was a short click (not a drag)
    if (mouseDownPos && !mouseDownPos.cleared && !e.shiftKey && !selectionBox) {
      const dx = e.clientX - mouseDownPos.x;
      const dy = e.clientY - mouseDownPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If moved less than 5 pixels, it's a click - clear selection
      if (distance < 5) {
        setSelectedDevices(new Set());
        setSelectedConnection(null);
      }
    }

    setMouseDownPos(null);
    setIsPanning(false); setDragging(null);
  }, [selectionBox, drawingStart, viewMode, getSvgPt, buildings, selectedBuilding, drawingMode, devices, mouseDownPos, setSelectedDevices, setSelectedConnection]);

  const handleDevDown = useCallback((e, id) => {
    e.stopPropagation();
    setDragging(id);
    if (e.shiftKey) setSelectedDevices(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
    else if (!selectedDevices.has(id)) setSelectedDevices(new Set([id]));
    setSelectedConnection(null);
  }, [selectedDevices]);

  const handleConnClick = useCallback((e, id) => {
    e.stopPropagation();
    setSelectedConnection(id);
    setSelectedDevices(new Set());
  }, []);

  const delDevices = useCallback((ids) => {
    setConnections(p => { const n = { ...p }; Object.keys(n).forEach(i => { if (ids.includes(n[i].from) || ids.includes(n[i].to)) delete n[i]; }); return n; });
    setDevices(p => { const n = { ...p }; ids.forEach(i => delete n[i]); return n; });
    setSelectedDevices(new Set());
  }, []);

  const handleImageUpload = (e) => {
    const f = e.target.files?.[0];
    if (f) { const r = new FileReader(); r.onload = (ev) => setFloorPlanImages(p => ({ ...p, [`${selectedBuilding}-${selectedFloor}`]: ev.target.result })); r.readAsDataURL(f); }
  };

  const addBuilding = () => {
    const id = genId('bldg');
    setBuildings(p => ({ ...p, [id]: { id, name: 'New Building', x: 100 + Object.keys(buildings).length * 50, y: 100, width: 250, height: 200, floors: [{ id: 1, name: 'Floor 1', image: null }], walls: [{ id: 'w1', x1: 0, y1: 0, x2: 250, y2: 0 }, { id: 'w2', x1: 250, y1: 0, x2: 250, y2: 200 }, { id: 'w3', x1: 250, y1: 200, x2: 0, y2: 200 }, { id: 'w4', x1: 0, y1: 200, x2: 0, y2: 0 }], rooms: [], color: '#e2e8f0' } }));
    setSelectedBuilding(id);
  };

  const duplicateSelected = useCallback(() => {
    const newDevs = {}, idMap = {};
    selectedDevices.forEach(id => {
      const dev = devices[id];
      const newId = genId('dev');
      idMap[id] = newId;
      newDevs[newId] = { ...dev, id: newId, name: dev.name + ' (copy)', x: dev.x + 40, y: dev.y + 40, physicalX: dev.physicalX + 20, physicalY: dev.physicalY + 20 };
    });
    setDevices(p => ({ ...p, ...newDevs }));
    setSelectedDevices(new Set(Object.keys(newDevs)));
  }, [selectedDevices, devices]);

  const findPathToWan = useCallback((startDeviceId) => {
    // 1. Find all WAN devices
    const wanDevices = Object.values(devices).filter(d => d.type === 'wan');

    if (wanDevices.length === 0) {
      return { found: false, reason: 'no-wan' };
    }

    // 2. Check if selected device is WAN
    if (devices[startDeviceId]?.type === 'wan') {
      return { found: false, reason: 'is-wan' };
    }

    // 3. Check if device has any connections
    const deviceConns = Object.values(connections).filter(c =>
      c.from === startDeviceId || c.to === startDeviceId
    );
    if (deviceConns.length === 0) {
      return { found: false, reason: 'disconnected' };
    }

    // 4. BFS to find shortest path to any WAN device
    const queue = [[startDeviceId, []]]; // [currentId, pathSoFar]
    const visited = new Set([startDeviceId]);

    while (queue.length > 0) {
      const [currentId, pathSoFar] = queue.shift();

      // Get all connections from current device
      const conns = Object.values(connections).filter(c =>
        c.from === currentId || c.to === currentId
      );

      for (const conn of conns) {
        const nextId = conn.from === currentId ? conn.to : conn.from;

        if (visited.has(nextId)) continue;
        visited.add(nextId);

        const nextDevice = devices[nextId];
        if (!nextDevice) continue;

        // Build path segment
        const segment = {
          deviceId: currentId,
          deviceName: devices[currentId].name,
          deviceType: devices[currentId].type,
          outPort: conn.from === currentId ? conn.fromPort : conn.toPort,
          connectionId: conn.id,
          cableType: conn.cableType,
          cableLength: conn.cableLength,
          speed: conn.speed,
          nextPort: conn.from === currentId ? conn.toPort : conn.fromPort,
          nextDeviceId: nextId,
          nextDeviceName: nextDevice.name
        };

        const newPath = [...pathSoFar, segment];

        // Check if we reached a WAN device
        if (nextDevice.type === 'wan') {
          return {
            found: true,
            path: newPath,
            wanDevice: { id: nextId, name: nextDevice.name }
          };
        }

        queue.push([nextId, newPath]);
      }
    }

    return { found: false, reason: 'no-path' };
  }, [devices, connections]);

  useEffect(() => {
    const kd = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); duplicateSelected(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'a') { e.preventDefault(); setSelectedDevices(new Set(Object.keys(devices))); }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedDevices.size > 0) { e.preventDefault(); copyDevices(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedDevices.size) delDevices([...selectedDevices]); else if (selectedConnection) { setConnections(p => { const n = { ...p }; delete n[selectedConnection]; return n; }); setSelectedConnection(null); } }
      else if (e.key === 'Escape') { setContextMenu(prev => ({ ...prev, visible: false })); setSelectedDevices(new Set()); setSelectedConnection(null); setConnecting(null); setTool('select'); setDrawingMode(null); setMeasurePoints([]); }
      else if (e.key === 'g') setShowGrid(g => !g); else if (e.key === 'm') setDrawingMode(m => m === 'measure' ? null : 'measure');
      else if (e.key === '1') setViewMode('logical'); else if (e.key === '2') setViewMode('physical');
      else if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z * 1.2, 5));
      else if (e.key === '-') setZoom(z => Math.max(z * 0.8, 0.15));
      else if (e.key === '0') { setZoom(1); setPan({ x: 0, y: 0 }); }
      else if (e.key === '[') setCircleScale(s => Math.max(s - 0.1, 0.5));
      else if (e.key === ']') setCircleScale(s => Math.min(s + 0.1, 2.5));
      else if (e.shiftKey && e.key === ')') setCircleScale(1);
      else if (e.key === ';') setDeviceLabelScale(s => Math.max(s - 0.1, 0.5));
      else if (e.key === "'") setDeviceLabelScale(s => Math.min(s + 0.1, 2.5));
      else if (e.shiftKey && e.key === '"') setDeviceLabelScale(1);
      else if (e.shiftKey && e.key === '{') setPortLabelScale(s => Math.max(s - 0.1, 0.5));
      else if (e.shiftKey && e.key === '}') setPortLabelScale(s => Math.min(s + 0.1, 2.5));
      else if (e.shiftKey && e.key === '|') setPortLabelScale(1);
    };
    window.addEventListener('keydown', kd); return () => window.removeEventListener('keydown', kd);
  }, [selectedDevices, selectedConnection, delDevices, duplicateSelected, devices, copyDevices, setDeviceLabelScale, setPortLabelScale]);

  const exportData = () => {
    const d = { devices, connections, vlans, buildings, interBuildingLinks, v: '3.1', t: new Date().toISOString() };
    const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'network-topology.json'; a.click();
  };

  const importData = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = (ev) => {
        try {
          const d = JSON.parse(ev.target.result);

          // Migrate devices to new format
          if (d.devices) {
            const migratedDevices = Object.entries(d.devices).reduce((acc, [id, dev]) => {
              acc[id] = migrateDeviceData(dev);
              return acc;
            }, {});
            setDevices(migratedDevices);
          }

          if (d.connections) setConnections(d.connections);
          if (d.vlans) setVlans(d.vlans);
          if (d.buildings) setBuildings(d.buildings);
          if (d.interBuildingLinks) setInterBuildingLinks(d.interBuildingLinks);
        } catch (err) {
          console.error('Import failed:', err);
        }
      };
      r.readAsText(f);
    }
  };

  const Minimap = () => {
    const allDevices = Object.values(devices);
    if (allDevices.length === 0) return null;

    const minX = Math.min(...allDevices.map(d => d.x)) - 50;
    const maxX = Math.max(...allDevices.map(d => d.x)) + 50;
    const minY = Math.min(...allDevices.map(d => d.y)) - 50;
    const maxY = Math.max(...allDevices.map(d => d.y)) + 50;
    const width = maxX - minX || 100;
    const height = maxY - minY || 100;
    const scale = Math.min(140 / width, 100 / height);

    // Get actual viewport dimensions
    const svgWidth = svgRef.current?.clientWidth || 800;
    const svgHeight = svgRef.current?.clientHeight || 600;

    return (
      <div className="absolute bottom-4 right-80 rounded-lg shadow-lg p-2 border" style={{ background: theme.surface, borderColor: theme.border }}>
        <svg width="150" height="110" style={{ background: theme.bg, borderRadius: 4 }}>
          <g transform={`translate(${5 + (140 - width * scale) / 2}, ${5 + (100 - height * scale) / 2}) scale(${scale})`}>
            {Object.values(connections).map(conn => {
              const from = devices[conn.from];
              const to = devices[conn.to];
              if (!from || !to) return null;
              return (
                <line key={conn.id} x1={from.x - minX} y1={from.y - minY} x2={to.x - minX} y2={to.y - minY}
                  stroke={theme.textMuted} strokeWidth={1/scale} opacity="0.5" />
              );
            })}
            {allDevices.map(d => (
              <circle key={d.id} cx={d.x - minX} cy={d.y - minY} r={4/scale}
                fill={selectedDevices.has(d.id) ? '#3b82f6' : getDevColor(d)} />
            ))}
          </g>
          <rect x={(-pan.x / zoom - minX) * scale + 5} y={(-pan.y / zoom - minY) * scale + 5}
            width={svgWidth / zoom * scale} height={svgHeight / zoom * scale}
            fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>
    );
  };

  const VlanPanel = () => (
    <div className="absolute top-16 left-4 w-72 rounded-xl shadow-2xl overflow-hidden" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: theme.border }}>
        <h3 className="font-bold">VLAN Manager</h3>
        <button onClick={() => setShowVlanPanel(false)} className="p-1 rounded transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <Icon d="M18 6L6 18M6 6l12 12" s={16} />
        </button>
      </div>
      <div className="p-3 max-h-96 overflow-y-auto space-y-2">
        {Object.values(vlans).map(vlan => (
          <div key={vlan.id}
            className={`p-3 rounded-lg relative group transition-all ${filterVlan === vlan.id ? 'ring-2' : ''}`}
            style={{ background: vlan.color + '10', borderLeft: `4px solid ${vlan.color}`, ringColor: vlan.color }}>
            <div onClick={() => setFilterVlan(filterVlan === vlan.id ? null : vlan.id)} className="cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: vlan.color }}>VLAN {vlan.id}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: vlan.color + '20', color: vlan.color }}>
                  {vlan.name}
                </span>
              </div>
              <div className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                <div className="font-mono">{vlan.subnet}</div>
                {vlan.description && <div>{vlan.description}</div>}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingVlan({ vlan, vlanId: vlan.id });
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
              style={{ background: theme.surface }}>
              <Icon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" s={14} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setEditingVlan({ vlan: null, vlanId: null })}
          className="w-full p-2 border-2 border-dashed rounded-lg text-sm font-medium transition-colors"
          style={{ borderColor: theme.border, color: theme.textMuted }}>
          + Add VLAN
        </button>
      </div>
    </div>
  );

  const PathToWan = ({ deviceId }) => {
    const pathResult = useMemo(() =>
      findPathToWan(deviceId),
      [deviceId, devices, connections]
    );

    // Set highlighted path for visual feedback on diagram
    useEffect(() => {
      if (pathResult.found) {
        // Build list of device IDs and connection IDs in the path
        const pathDeviceIds = new Set([deviceId]);
        const pathConnectionIds = new Set();

        pathResult.path.forEach(segment => {
          pathDeviceIds.add(segment.nextDeviceId);
          pathConnectionIds.add(segment.connectionId);
        });

        setHighlightedPath({
          devices: pathDeviceIds,
          connections: pathConnectionIds
        });
      } else {
        setHighlightedPath(null);
      }

      // Cleanup on unmount or device change
      return () => setHighlightedPath(null);
    }, [deviceId, pathResult]);

    if (!pathResult.found) {
      return (
        <div className="mt-3 p-2 rounded text-xs"
          style={{ background: theme.bg, color: theme.textMuted }}>
          {pathResult.reason === 'no-wan' && '⚠️ No WAN uplink configured'}
          {pathResult.reason === 'is-wan' && '✓ This is the WAN uplink'}
          {pathResult.reason === 'no-path' && '⚠️ No path to WAN uplink'}
          {pathResult.reason === 'disconnected' && '⚠️ Device not connected'}
        </div>
      );
    }

    return (
      <div className="mt-3">
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-xs font-semibold"
            style={{ color: theme.text }}>
            Path to WAN
          </span>
          <div className="flex-1 h-px"
            style={{ background: theme.border }} />
        </div>

        <div className="space-y-0">
          {/* Starting device card */}
          <div className="rounded border"
            style={{
              background: theme.surface,
              borderColor: theme.border
            }}>
            <div className="px-3 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full"
                style={{ background: getDevColor(devices[deviceId]) }} />
              <span className="font-mono text-xs font-semibold"
                style={{ color: theme.text }}>
                {devices[deviceId].name}
              </span>
            </div>
          </div>

          {/* Each hop */}
          {pathResult.path.map((segment, idx) => (
            <div key={idx}>
              {/* Outgoing port bubble from previous device */}
              <div className="flex justify-center mt-2">
                <div className="px-2.5 py-1 rounded-full border"
                  style={{
                    background: theme.bg,
                    borderColor: theme.border
                  }}>
                  <span className="font-mono text-xs font-semibold"
                    style={{ color: theme.text }}>
                    [{segment.outPort || '?'}]
                  </span>
                </div>
              </div>

              {/* Cable connection with arrow */}
              <div className="flex flex-col items-center my-1">
                <span className="text-[10px]" style={{ color: theme.textMuted }}>
                  ↓
                </span>
                <span className="text-[10px]"
                  style={{ color: theme.textMuted, opacity: 0.8 }}>
                  {cableTypes.find(t => t.value === segment.cableType)?.label || segment.cableType}
                  {segment.cableLength > 0 && ` • ${segment.cableLength}${getUnit()}`}
                </span>
                <span className="text-[10px]" style={{ color: theme.textMuted }}>
                  ↓
                </span>
              </div>

              {/* Incoming port bubble to next device */}
              <div className="flex justify-center mb-2">
                <div className="px-2.5 py-1 rounded-full border"
                  style={{
                    background: theme.bg,
                    borderColor: theme.border
                  }}>
                  <span className="font-mono text-xs font-semibold"
                    style={{ color: theme.text }}>
                    [{segment.nextPort || '?'}]
                  </span>
                </div>
              </div>

              {/* Next device card */}
              <div className="rounded border"
                style={{
                  background: theme.surface,
                  borderColor: theme.border
                }}>
                <div className="px-3 py-2.5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full"
                    style={{ background: getDevColor(devices[segment.nextDeviceId]) }} />
                  <span className="font-mono text-xs font-semibold"
                    style={{ color: theme.text }}>
                    {segment.nextDeviceName}
                  </span>
                  {segment.nextDeviceId === pathResult.wanDevice.id && (
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{ background: '#16a34a20', color: '#16a34a' }}>
                      WAN
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Summary footer */}
          <div className="mt-3 pt-2.5 border-t flex items-center justify-between text-[10px]"
            style={{ borderColor: theme.border, color: theme.textMuted }}>
            <span>{pathResult.path.length} hop{pathResult.path.length !== 1 ? 's' : ''}</span>
            <span>
              {pathResult.path.reduce((sum, seg) => sum + (seg.cableLength || 0), 0).toFixed(1)} {getUnit()} total
            </span>
          </div>
        </div>
      </div>
    );
  };

  const ConnLine = ({ c, phys }) => {
    const fd = filteredDevs[c.from], td = filteredDevs[c.to];
    if (!fd || !td) return null;
    const st = getConnStyle(c.type), sel = selectedConnection === c.id, hov = hoveredConn === c.id;
    const highlighted = highlightedPath?.connections.has(c.id);
    const [x1, y1] = phys ? [fd.physicalX, fd.physicalY] : [fd.x, fd.y];
    const [x2, y2] = phys ? [td.physicalX, td.physicalY] : [td.x, td.y];
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;

    // Dynamic port label offset calculation
    const baseCircleRadius = phys ? 20 : 32;
    const scaledRadius = baseCircleRadius * circleScale;
    const lineLength = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    const minDistance = scaledRadius + 20;
    const dynamicOffset = Math.max(0.2, minDistance / lineLength);
    const offset = Math.min(dynamicOffset, 0.45);

    return (
      <g onClick={(e) => handleConnClick(e, c.id)} onDoubleClick={() => setEditingConnection(c.id)}
         onMouseEnter={() => setHoveredConn(c.id)} onMouseLeave={() => setHoveredConn(null)}
         onContextMenu={(e) => handleConnectionContextMenu(e, c.id)}
         style={{ cursor: 'pointer' }}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="14" />
        {/* Pulsing glow when highlighted */}
        {highlighted && (
          <line x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={st.color} strokeWidth={6} opacity="0.4">
            <animate attributeName="stroke-width"
              values="4;8;4"
              dur="2s"
              repeatCount="indefinite" />
            <animate attributeName="opacity"
              values="0.3;0.5;0.3"
              dur="2s"
              repeatCount="indefinite" />
          </line>
        )}
        {(sel || hov) && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={st.color} strokeWidth="8" opacity="0.2" />}
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={highlighted ? st.color : (sel || hov ? '#3b82f6' : st.color)} strokeWidth={highlighted ? 4 : (c.type === 'lacp' ? 4 : 2)} strokeDasharray={st.dash} opacity={highlighted ? 1 : undefined} />

        {!phys && (c.fromPort || hov) && (!highlightedPath || highlighted) && (
          <g transform={`translate(${x1 + (x2-x1)*offset}, ${y1 + (y2-y1)*offset})`}>
            <rect x={-18 * portLabelScale} y="-9" width={36 * portLabelScale} height="16" fill={theme.surface} rx="3" stroke={st.color} strokeWidth="1" />
            <text textAnchor="middle" y="3" fontSize={Math.max(6, 9 * portLabelScale)} fill={theme.text} fontFamily="monospace">{c.fromPort || '—'}</text>
          </g>
        )}

        {!phys && (c.toPort || hov) && (!highlightedPath || highlighted) && (
          <g transform={`translate(${x2 - (x2-x1)*offset}, ${y2 - (y2-y1)*offset})`}>
            <rect x={-18 * portLabelScale} y="-9" width={36 * portLabelScale} height="16" fill={theme.surface} rx="3" stroke={st.color} strokeWidth="1" />
            <text textAnchor="middle" y="3" fontSize={Math.max(6, 9 * portLabelScale)} fill={theme.text} fontFamily="monospace">{c.toPort || '—'}</text>
          </g>
        )}

        {!phys && c.speed && (
          <g transform={`translate(${mx},${my})`}>
            <rect x="-14" y="-8" width="28" height="14" fill={st.color} rx="7" />
            <text textAnchor="middle" y="3" fontSize="8" fill="white" fontWeight="600">{c.speed}</text>
          </g>
        )}

        {!phys && hov && c.vlans?.length > 0 && (
          <g transform={`translate(${mx}, ${my + 20})`}>
            <rect x={-c.vlans.length * 14} y="-8" width={c.vlans.length * 28} height="16" fill={theme.surface} rx="4" stroke={theme.border} />
            <text textAnchor="middle" y="4" fontSize="8" fill={theme.textMuted}>VLANs: {c.vlans.join(', ')}</text>
          </g>
        )}

        {phys && showMeasurements && c.cableLength > 0 && (
          <g transform={`translate(${mx},${my})`}>
            <rect x="-20" y="-8" width="40" height="14" fill={theme.surface} stroke={st.color} rx="4" />
            <text textAnchor="middle" y="3" fontSize="8" fill={theme.text}>{c.cableLength}{getUnit()}</text>
          </g>
        )}
      </g>
    );
  };

  const DevNode = ({ d, phys }) => {
    const col = getDevColor(d), sel = selectedDevices.has(d.id), conn = connecting === d.id;
    const highlighted = highlightedPath?.devices.has(d.id);
    const stCol = statusColors[d.status] || statusColors.unknown;
    const ti = deviceTypes.find(t => t.value === d.type);
    const [x, y] = phys ? [d.physicalX, d.physicalY] : [d.x, d.y];
    const sz = (phys ? 20 : 32) * circleScale;
    const maxChars = Math.floor((phys ? 6 : 10) * circleScale);
    const truncateAt = Math.floor((phys ? 5 : 8) * circleScale);
    return (
      <g transform={`translate(${x},${y})`} onMouseDown={(e) => handleDevDown(e, d.id)} onDoubleClick={() => { setEditingDevice(d.id); setSelectedDevices(new Set([d.id])); }} onContextMenu={(e) => handleDeviceContextMenu(e, d.id)} style={{ cursor: 'move' }}>
        {/* Pulsing glow when highlighted */}
        {highlighted && (
          <circle r={sz + 8} fill={col} opacity="0.3">
            <animate attributeName="r"
              values={`${sz + 6};${sz + 12};${sz + 6}`}
              dur="2s"
              repeatCount="indefinite" />
            <animate attributeName="opacity"
              values="0.2;0.4;0.2"
              dur="2s"
              repeatCount="indefinite" />
          </circle>
        )}
        {conn && <circle r={sz + 10} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3"><animate attributeName="r" values={`${sz + 6};${sz + 14};${sz + 6}`} dur="1s" repeatCount="indefinite" /></circle>}
        {(sel || highlighted) && <circle r={sz + 4} fill={col} opacity={highlighted ? "0.4" : "0.2"} />}
        <circle r={sz} fill={sel ? col : theme.surface} stroke={col} strokeWidth={sel ? 3 : 2} />
        <circle cx={sz * 0.6} cy={-sz * 0.6} r={phys ? 3 : 5} fill={stCol} stroke={theme.surface} strokeWidth="1.5" />
        <g style={{ color: sel ? '#fff' : col }}><svg x={-sz / 3} y={-sz / 1.8} width={sz * 0.7} height={sz * 0.7} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={ti?.icon || ''} /></svg></g>
        {(!highlightedPath || highlighted) && (
          <>
            <text y={sz * 0.55} textAnchor="middle" fontSize={Math.max(6, (phys ? 7 : 9) * deviceLabelScale)} fontWeight="600" fill={sel ? '#fff' : theme.text}>{d.name.length > maxChars ? d.name.substring(0, truncateAt) + '…' : d.name}</text>
            {!phys && d.ip && <text y={sz * 0.8} textAnchor="middle" fontSize="7" fill={sel ? 'rgba(255,255,255,0.7)' : theme.textMuted}>{d.ip}</text>}
            {d.isRoot && !phys && <g transform={`translate(0,${-sz - 12})`}><rect x="-18" y="-7" width="36" height="12" fill="#22c55e" rx="6" /><text textAnchor="middle" y="2" fontSize="7" fill="#fff" fontWeight="600">★ ROOT</text></g>}
            {d.type === 'wan' && !phys && <g transform={`translate(0,${-sz - 12})`}><rect x="-18" y="-7" width="36" height="12" fill="#16a34a" rx="6" /><text textAnchor="middle" y="2" fontSize="7" fill="#fff" fontWeight="600">⬆ WAN</text></g>}
          </>
        )}
      </g>
    );
  };

  const renderFloorPlan = () => {
    const b = buildings[selectedBuilding]; if (!b) return null;
    const imgKey = `${selectedBuilding}-${selectedFloor}`;
    return (
      <g transform={`translate(${b.x},${b.y})`}>
        <rect className="bg-layer" width={b.width} height={b.height} fill={b.color} stroke={theme.border} strokeWidth="2" rx="4" />
        {floorPlanImages[imgKey] && <image href={floorPlanImages[imgKey]} width={b.width} height={b.height} opacity={imageOpacity} preserveAspectRatio="xMidYMid slice" />}
        {b.rooms.map(r => <g key={r.id} transform={`translate(${r.x},${r.y})`}><rect width={r.width} height={r.height} fill={r.color} stroke={theme.border} strokeDasharray="4,2" /><text x={r.width / 2} y={r.height / 2} textAnchor="middle" fontSize="8" fill={theme.textMuted}>{r.name}</text>{showMeasurements && <><text x={r.width / 2} y={-3} textAnchor="middle" fontSize="7" fill={theme.textMuted}>{toDisplay(r.width)}{getUnit()}</text></>}</g>)}
        {b.walls.map(w => <line key={w.id} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke={theme.text} strokeWidth="3" />)}
        {showMeasurements && <><text x={b.width / 2} y={-8} textAnchor="middle" fontSize="10" fill={theme.text}>{toDisplay(b.width)} {getUnit()}</text><text x={b.width + 8} y={b.height / 2} fontSize="10" fill={theme.text} transform={`rotate(90,${b.width + 8},${b.height / 2})`}>{toDisplay(b.height)} {getUnit()}</text></>}
      </g>
    );
  };

  const renderMeasure = () => {
    if (measurePoints.length < 2) return null;
    return measurePoints.slice(0, -1).map((p, i) => {
      const p2 = measurePoints[i + 1], dist = Math.sqrt((p2.x - p.x) ** 2 + (p2.y - p.y) ** 2), mx = (p.x + p2.x) / 2, my = (p.y + p2.y) / 2;
      return <g key={i}><line x1={p.x} y1={p.y} x2={p2.x} y2={p2.y} stroke="#ef4444" strokeWidth="2" strokeDasharray="6,3" /><circle cx={p.x} cy={p.y} r="4" fill="#ef4444" /><circle cx={p2.x} cy={p2.y} r="4" fill="#ef4444" /><rect x={mx - 28} y={my - 10} width="56" height="18" fill="#fff" stroke="#ef4444" rx="4" /><text x={mx} y={my + 4} textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="600">{toDisplay(dist)} {getUnit()}</text></g>;
    });
  };

  const BuildingThumb = ({ b }) => {
    const sel = selectedBuilding === b.id;
    return (
      <g transform={`translate(${b.x},${b.y})`} onClick={() => setSelectedBuilding(b.id)} style={{ cursor: 'pointer' }}>
        <rect width={b.width} height={b.height} fill={b.color} stroke={sel ? '#3b82f6' : theme.border} strokeWidth={sel ? 3 : 1} rx="4" />
        <text x={b.width / 2} y={-6} textAnchor="middle" fontSize="11" fontWeight="600" fill={theme.text}>{b.name}</text>
        <text x={b.width / 2} y={b.height / 2} textAnchor="middle" fontSize="9" fill={theme.textMuted}>{Object.values(devices).filter(d => d.buildingId === b.id).length} devices</text>
      </g>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col" style={{ background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="h-12 px-3 flex items-center gap-2 border-b" style={{ background: theme.surface, borderColor: theme.border }}>
        <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white"><Icon d="M6 6m-3 0a3 3 0 106 0M18 6m-3 0a3 3 0 106 0M6 18m-3 0a3 3 0 106 0M18 18m-3 0a3 3 0 106 0M6 9v6M18 9v6M9 6h6M9 18h6" s={14} /></div><span className="font-bold">NetMap</span><span className="text-xs px-1.5 py-0.5 rounded" style={{ background: theme.bg }}>v3</span></div>
        <div className="w-px h-5" style={{ background: theme.border }} />
        <div className="flex rounded overflow-hidden" style={{ background: theme.bg }}>
          <button onClick={() => setViewMode('logical')} className="px-2.5 py-1 text-xs font-medium" style={viewMode === 'logical' ? { background: '#2563eb', color: 'white' } : { color: theme.text }}>Logical</button>
          <button onClick={() => setViewMode('physical')} className="px-2.5 py-1 text-xs font-medium" style={viewMode === 'physical' ? { background: '#2563eb', color: 'white' } : { color: theme.text }}>Physical</button>
        </div>
        {viewMode === 'physical' && <>
          <div className="w-px h-5" style={{ background: theme.border }} />
          <div className="flex rounded p-0.5 gap-0.5" style={{ background: theme.bg }}>
            <button onClick={() => setDrawingMode(drawingMode === 'wall' ? null : 'wall')} className="p-1.5 rounded transition-colors" style={drawingMode === 'wall' ? { background: '#f97316', color: 'white' } : { color: theme.text }} onMouseEnter={(e) => drawingMode !== 'wall' && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => drawingMode !== 'wall' && (e.currentTarget.style.background = 'transparent')} title="Draw Wall"><Icon d="M3 21V3h18v18" s={16} /></button>
            <button onClick={() => setDrawingMode(drawingMode === 'room' ? null : 'room')} className="p-1.5 rounded transition-colors" style={drawingMode === 'room' ? { background: '#a855f7', color: 'white' } : { color: theme.text }} onMouseEnter={(e) => drawingMode !== 'room' && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => drawingMode !== 'room' && (e.currentTarget.style.background = 'transparent')} title="Draw Room"><Icon d="M3 3h18v18H3zM9 3v18M15 3v18" s={16} /></button>
            <button onClick={() => setDrawingMode(drawingMode === 'measure' ? null : 'measure')} className="p-1.5 rounded transition-colors" style={drawingMode === 'measure' ? { background: '#ef4444', color: 'white' } : { color: theme.text }} onMouseEnter={(e) => drawingMode !== 'measure' && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => drawingMode !== 'measure' && (e.currentTarget.style.background = 'transparent')} title="Measure"><Icon d="M2 12h20M12 2v20" s={16} /></button>
            <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} title="Upload Floor Plan"><Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12M8 8l4-4 4 4" s={16} /></button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
          <select value={measurementUnit} onChange={(e) => setMeasurementUnit(e.target.value)} className="px-2 py-1 rounded text-xs border" style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}><option value="imperial">Feet</option><option value="metric">Meters</option></select>
          <button onClick={() => setShowMeasurements(!showMeasurements)} className="p-1.5 rounded transition-colors" style={showMeasurements ? { background: theme.buttonActive, color: theme.buttonActiveText } : { color: theme.text }} onMouseEnter={(e) => !showMeasurements && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => !showMeasurements && (e.currentTarget.style.background = 'transparent')} title="Measurements"><Icon d="M6 6l12 12M6 18L18 6" s={16} /></button>
        </>}
        <div className="w-px h-5" style={{ background: theme.border }} />
        <button onClick={() => setShowGrid(g => !g)} className="p-1.5 rounded transition-colors" style={showGrid ? { background: theme.buttonActive, color: theme.buttonActiveText } : { color: theme.text }} onMouseEnter={(e) => !showGrid && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => !showGrid && (e.currentTarget.style.background = 'transparent')} title="Toggle grid (G)"><Icon d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" s={16} /></button>
        <button onClick={() => setDarkMode(d => !d)} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} title="Toggle dark mode"><Icon d={darkMode ? 'M12 3v1M12 20v1M4.2 4.2l.7.7M18.4 18.4l.7.7M3 12h1M20 12h1' : 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'} s={16} /></button>
        {viewMode === 'logical' && <>
          <div className="w-px h-5" style={{ background: theme.border }} />
          <button onClick={() => setShowMinimap(m => !m)} className="p-1.5 rounded transition-colors" style={showMinimap ? { background: theme.buttonActive, color: theme.buttonActiveText } : { color: theme.text }} onMouseEnter={(e) => !showMinimap && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => !showMinimap && (e.currentTarget.style.background = 'transparent')} title="Minimap"><Icon d="M9 9h6v6H9zM3 3h18v18H3z" s={16} /></button>
        </>}
        <div className="w-px h-5" style={{ background: theme.border }} />
        <button onClick={undo} disabled={historyIdx <= 0} className="p-1.5 rounded transition-colors disabled:opacity-30" style={{ color: theme.text }} onMouseEnter={(e) => historyIdx > 0 && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} title="Undo (Ctrl+Z)"><Icon d="M9 14l-4-4 4-4M5 10h11a4 4 0 110 8h-1" s={16} /></button>
        <button onClick={redo} disabled={historyIdx >= history.length - 1} className="p-1.5 rounded transition-colors disabled:opacity-30" style={{ color: theme.text }} onMouseEnter={(e) => historyIdx < history.length - 1 && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} title="Redo (Ctrl+Y)"><Icon d="M15 14l4-4-4-4M19 10H8a4 4 0 100 8h1" s={16} /></button>
        <div className="w-px h-5" style={{ background: theme.border }} />
        <button onClick={() => setCircleScale(s => Math.max(s - 0.1, 0.5))} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} title="Shrink circles" onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M5 12h14" s={16} /></button>
        <span className="px-2 text-xs font-medium w-12 text-center">{Math.round(circleScale * 100)}%</span>
        <button onClick={() => setCircleScale(s => Math.min(s + 0.1, 2.5))} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} title="Grow circles" onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M12 5v14M5 12h14" s={16} /></button>
        <div className="w-px h-5" style={{ background: theme.border }} />
        <button onClick={() => setDeviceLabelScale(s => Math.max(s - 0.1, 0.5))} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} title="Shrink device labels (;)" onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M5 12h14" s={16} /></button>
        <span className="px-2 text-xs font-medium w-12 text-center">{Math.round(deviceLabelScale * 100)}%</span>
        <button onClick={() => setDeviceLabelScale(s => Math.min(s + 0.1, 2.5))} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} title="Grow device labels (')" onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M12 5v14M5 12h14" s={16} /></button>
        <div className="w-px h-5" style={{ background: theme.border }} />
        <button onClick={() => setPortLabelScale(s => Math.max(s - 0.1, 0.5))} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} title="Shrink port labels ({)" onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M5 12h14" s={16} /></button>
        <span className="px-2 text-xs font-medium w-12 text-center">{Math.round(portLabelScale * 100)}%</span>
        <button onClick={() => setPortLabelScale(s => Math.min(s + 0.1, 2.5))} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} title="Grow port labels (})" onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M12 5v14M5 12h14" s={16} /></button>
        <div className="flex-1" />
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-32 px-2 py-1 rounded text-xs border" style={{ background: theme.bg, borderColor: theme.border, color: theme.text }} />
        {viewMode === 'logical' && <button onClick={() => setShowVlanPanel(!showVlanPanel)} className="px-2 py-1 rounded text-xs font-medium transition-colors" style={showVlanPanel ? { background: '#2563eb', color: 'white' } : { background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}>VLANs {filterVlan !== null && <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-500 text-white text-xs">{filterVlan}</span>}</button>}
        <div className="w-px h-5" style={{ background: theme.border }} />
        <label className="px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>Import<input type="file" accept=".json" onChange={importData} className="hidden" /></label>
        <button onClick={exportData} className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white">Export</button>
      </div>
      {drawingMode && <div className="px-3 py-1.5 text-xs flex items-center gap-2" style={{ background: theme.bg, borderBottom: `1px solid ${theme.border}` }}><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />{drawingMode === 'wall' && 'Click & drag to draw wall'}{drawingMode === 'room' && 'Click & drag to draw room'}{drawingMode === 'measure' && `Click points to measure (${measurePoints.length} pts)`}</div>}
      <div className="flex-1 relative overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onContextMenu={handleCanvasContextMenu} style={{ cursor: drawingMode ? 'crosshair' : isPanning ? 'grabbing' : 'grab' }}>
          <defs><pattern id="gs" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke={theme.grid} strokeWidth="0.5" /></pattern><pattern id="gl" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke={theme.gridL} strokeWidth="1" /></pattern></defs>
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {showGrid && (() => {
              const bounds = getGridBounds();
              return <>
                <rect x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height} fill="url(#gs)" className="bg-layer" />
                <rect x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height} fill="url(#gl)" className="bg-layer" />
              </>;
            })()}
            {viewMode === 'logical' ? <>
              {Object.values(filteredConns).map(c => <ConnLine key={c.id} c={c} phys={false} />)}
              {connecting && devices[connecting] && <circle cx={devices[connecting].x} cy={devices[connecting].y} r="45" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3" opacity="0.5" />}
              {Object.values(filteredDevs).map(d => <DevNode key={d.id} d={d} phys={false} />)}
            </> : <>
              {Object.values(buildings).map(b => b.id === selectedBuilding ? null : <BuildingThumb key={b.id} b={b} />)}
              {selectedBuilding && renderFloorPlan()}
              {interBuildingLinks.map(l => { const f = buildings[l.from], t = buildings[l.to]; if (!f || !t) return null; return <g key={l.id}><line x1={f.x + f.width / 2} y1={f.y + f.height / 2} x2={t.x + t.width / 2} y2={t.y + t.height / 2} stroke="#eab308" strokeWidth="3" strokeDasharray="10,5" /><text x={(f.x + t.x + f.width / 2 + t.width / 2) / 2} y={(f.y + t.y + f.height / 2 + t.height / 2) / 2 - 8} textAnchor="middle" fontSize="9" fill="#eab308" fontWeight="600">{l.label}</text></g>; })}
              {selectedBuilding && <g transform={`translate(${buildings[selectedBuilding].x},${buildings[selectedBuilding].y})`}>{Object.values(filteredConns).map(c => <ConnLine key={c.id} c={c} phys={true} />)}{Object.values(filteredDevs).map(d => <DevNode key={d.id} d={d} phys={true} />)}</g>}
              {drawingMode === 'measure' && renderMeasure()}
            </>}
            {selectionBox && (
              <rect
                x={Math.min(selectionBox.startX, selectionBox.endX)}
                y={Math.min(selectionBox.startY, selectionBox.endY)}
                width={Math.abs(selectionBox.endX - selectionBox.startX)}
                height={Math.abs(selectionBox.endY - selectionBox.startY)}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
                pointerEvents="none"
              />
            )}
          </g>
        </svg>
        {viewMode === 'physical' && <div className="absolute top-2 left-2 w-52 rounded-lg shadow-lg overflow-hidden" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}><div className="px-3 py-2 border-b flex items-center justify-between text-sm font-medium" style={{ borderColor: theme.border }}>Buildings<button onClick={addBuilding} className="p-1 rounded transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M12 5v14M5 12h14" s={14} /></button></div><div className="p-2 space-y-1 max-h-48 overflow-y-auto">{Object.values(buildings).map(b => <div key={b.id} onClick={() => setSelectedBuilding(b.id)} className={`p-2 rounded cursor-pointer text-xs ${selectedBuilding === b.id ? 'ring-2 ring-blue-500' : ''}`} style={{ background: b.color }}><div className="font-medium">{b.name}</div><div style={{ color: theme.textMuted }}>{toDisplay(b.width)} × {toDisplay(b.height)} {getUnit()}</div></div>)}</div>{selectedBuilding && <div className="p-2 border-t" style={{ borderColor: theme.border }}><select value={selectedFloor} onChange={(e) => setSelectedFloor(parseInt(e.target.value))} className="w-full px-2 py-1 rounded text-xs border" style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}>{(buildings[selectedBuilding]?.floors || []).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>}</div>}
        {viewMode === 'logical' && showVlanPanel && <VlanPanel />}
        {viewMode === 'logical' && showMinimap && <Minimap />}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg shadow p-1" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}><button onClick={() => setZoom(z => Math.max(z * 0.8, 0.15))} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M5 12h14" s={14} /></button><span className="px-2 text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span><button onClick={() => setZoom(z => Math.min(z * 1.2, 5))} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M12 5v14M5 12h14" s={14} /></button><button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="px-2 py-1 rounded transition-colors text-xs" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>Reset</button></div>
        <div className="absolute top-0 right-0 bottom-0 w-64 border-l overflow-y-auto" style={{ background: theme.surface, borderColor: theme.border }}>
          {selectedDevices.size === 1 && (() => { const d = devices[[...selectedDevices][0]]; if (!d) return null; return <div className="p-3"><div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: getDevColor(d) + '20', color: getDevColor(d) }}><Icon d={deviceTypes.find(t => t.value === d.type)?.icon || ''} s={18} /></div><div className="flex-1 min-w-0"><h3 className="font-bold text-sm truncate">{d.name}</h3><p className="text-xs" style={{ color: theme.textMuted }}>{deviceTypes.find(t => t.value === d.type)?.label}</p></div><div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[d.status] }} /></div>{d.ip && <div className="mb-1.5"><span className="text-xs" style={{ color: theme.textMuted }}>IP</span><p className="font-mono text-xs">{d.ip}</p></div>}{d.mac && <div className="mb-1.5"><span className="text-xs" style={{ color: theme.textMuted }}>MAC</span><p className="font-mono text-xs">{d.mac}</p></div>}<div className="mb-1.5"><span className="text-xs" style={{ color: theme.textMuted }}>Location</span><p className="text-xs">{buildings[d.buildingId]?.name || 'Unknown'}</p></div>{d.vlans?.length > 0 && <div className="mb-2"><span className="text-xs" style={{ color: theme.textMuted }}>VLANs</span><div className="flex flex-wrap gap-1 mt-0.5">{d.vlans.map(v => vlans[v] && <span key={v} className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: vlans[v].color + '20', color: vlans[v].color }}>{v}</span>)}</div></div>}{d.notes && <div className="mb-2"><span className="text-xs" style={{ color: theme.textMuted }}>Notes</span><p className="text-xs whitespace-pre-wrap">{d.notes}</p></div>}<PathToWan deviceId={d.id} /><button onClick={() => setEditingDevice(d.id)} className="w-full py-1.5 text-xs font-medium bg-blue-600 text-white rounded">Edit</button></div>; })()}
          {selectedDevices.size > 1 && <div className="p-3"><h3 className="font-bold text-sm mb-2">{selectedDevices.size} selected</h3><button onClick={() => delDevices([...selectedDevices])} className="w-full py-1.5 text-xs font-medium bg-red-600 text-white rounded">Delete All</button></div>}
          {selectedConnection && (() => { const c = connections[selectedConnection]; if (!c) return null; return <div className="p-3"><h3 className="font-bold text-sm mb-2">Connection</h3><div className="text-center p-2 rounded mb-2 text-xs" style={{ background: theme.bg }}><div>{devices[c.from]?.name} <span className="font-mono" style={{ color: theme.textMuted }}>{c.fromPort || '?'}</span></div><div className="my-0.5">↕</div><div>{devices[c.to]?.name} <span className="font-mono" style={{ color: theme.textMuted }}>{c.toPort || '?'}</span></div></div><div className="space-y-1 text-xs mb-2"><div className="flex justify-between"><span style={{ color: theme.textMuted }}>Type</span><span>{connTypes.find(t => t.value === c.type)?.label}</span></div><div className="flex justify-between"><span style={{ color: theme.textMuted }}>Speed</span><span>{c.speed}</span></div><div className="flex justify-between"><span style={{ color: theme.textMuted }}>Cable</span><span>{cableTypes.find(t => t.value === c.cableType)?.label}</span></div>{c.cableLength > 0 && <div className="flex justify-between"><span style={{ color: theme.textMuted }}>Length</span><span>{c.cableLength} {getUnit()}</span></div>}</div><button onClick={() => setEditingConnection(c.id)} className="w-full py-1.5 text-xs font-medium bg-blue-600 text-white rounded">Edit</button></div>; })()}
          {selectedDevices.size === 0 && !selectedConnection && <div className="p-4 text-center" style={{ color: theme.textMuted }}><div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: theme.bg }}><Icon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" s={24} /></div><p className="text-xs mb-3">Select device or connection</p><div className="text-xs text-left space-y-0.5"><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>V</kbd> Select</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>A</kbd> Add</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>C</kbd> Connect</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>Del</kbd> Delete</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>Shift+Click</kbd> Multi-select</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>Ctrl+Drag</kbd> Box select</p><p>Drag selected to move all</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>Ctrl+Z</kbd> Undo</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>Ctrl+D</kbd> Duplicate</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>[</kbd> Shrink circles</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>]</kbd> Grow circles</p></div></div>}
        </div>
      </div>
      <div className="h-6 px-3 flex items-center gap-3 text-xs border-t" style={{ background: theme.surface, borderColor: theme.border, color: theme.textMuted }}><span>{Object.keys(devices).length} devices</span><span>{Object.keys(connections).length} connections</span>{viewMode === 'logical' ? <span>{Object.keys(vlans).length} VLANs</span> : <span>{Object.keys(buildings).length} buildings</span>}{filterVlan !== null && <span style={{ color: '#3b82f6' }}>Filtered: VLAN {filterVlan}</span>}{searchQuery && <span style={{ color: '#3b82f6' }}>Search: "{searchQuery}"</span>}<div className="flex-1" />{viewMode === 'physical' ? <span>{measurementUnit === 'imperial' ? 'Feet' : 'Meters'}</span> : null}<span>Zoom: {Math.round(zoom * 100)}%</span></div>
      {contextMenu.visible && (
        <ContextMenu
          visible={contextMenu.visible}
          x={contextMenu.x}
          y={contextMenu.y}
          items={
            contextMenu.type === 'device'
              ? getDeviceMenuItems(contextMenu.targetId)
              : contextMenu.type === 'connection'
              ? getConnectionMenuItems(contextMenu.targetId)
              : getCanvasMenuItems(contextMenu.targetData.svgX, contextMenu.targetData.svgY)
          }
          onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
          theme={theme}
        />
      )}
      {editingDevice && (
        <DevModal
          device={devices[editingDevice]}
          deviceId={editingDevice}
          onClose={handleCloseDevModal}
          onUpdate={handleDeviceUpdate}
          theme={theme}
          deviceTypes={deviceTypes}
          statusColors={statusColors}
          buildings={buildings}
          vlans={vlans}
        />
      )}
      {editingConnection && (
        <ConnModal
          connection={connections[editingConnection]}
          connectionId={editingConnection}
          devices={devices}
          onClose={handleCloseConnModal}
          onUpdate={handleConnectionUpdate}
          theme={theme}
          connTypes={connTypes}
          speeds={speeds}
          cableTypes={cableTypes}
          vlans={vlans}
          getUnit={getUnit}
        />
      )}
      {editingVlan && (
        <VlanModal
          vlan={editingVlan.vlan}
          vlanId={editingVlan.vlanId}
          onClose={() => setEditingVlan(null)}
          onSave={handleVlanSave}
          onDelete={handleVlanDelete}
          theme={theme}
          existingVlans={vlans}
        />
      )}
    </div>
  );
};

export default NetworkTopologyEditor;
