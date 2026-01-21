import React from 'react';

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

export default VlanConfigTab;
