import React from 'react';

const BasicConfigTab = ({ device, upd, theme, deviceTypes, statusColors, buildings }) => (
  <div className="space-y-3">
    <input
      value={device.name}
      onChange={(e) => upd({ name: e.target.value })}
      placeholder="Device Name"
      className="w-full px-3 py-2 rounded border"
      style={{ background: theme.bg, borderColor: theme.border }}
    />

    <div className="grid grid-cols-2 gap-3">
      <select
        value={device.type}
        onChange={(e) => upd({ type: e.target.value })}
        className="px-3 py-2 rounded border"
        style={{ background: theme.bg, borderColor: theme.border }}
      >
        {deviceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <select
        value={device.status}
        onChange={(e) => upd({ status: e.target.value })}
        className="px-3 py-2 rounded border"
        style={{ background: theme.bg, borderColor: theme.border }}
      >
        {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <input
        value={device.ip || ''}
        onChange={(e) => upd({ ip: e.target.value })}
        placeholder="IP Address"
        className="px-3 py-2 rounded border font-mono text-sm"
        style={{ background: theme.bg, borderColor: theme.border }}
      />
      <input
        value={device.mac || ''}
        onChange={(e) => upd({ mac: e.target.value })}
        placeholder="MAC Address"
        className="px-3 py-2 rounded border font-mono text-sm"
        style={{ background: theme.bg, borderColor: theme.border }}
      />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <select
        value={device.buildingId || ''}
        onChange={(e) => {
          const newBuildingId = e.target.value || null;
          const building = buildings[newBuildingId];

          // Auto-position device at center of building when assigning
          const physicalUpdates = {};
          if (newBuildingId && building) {
            physicalUpdates.physicalX = building.x + building.width / 2;
            physicalUpdates.physicalY = building.y + building.height / 2;
          }

          upd({
            buildingId: newBuildingId,
            floor: newBuildingId ? 1 : null,
            ...physicalUpdates
          });
        }}
        className="px-3 py-2 rounded border"
        style={{ background: theme.bg, borderColor: theme.border }}
      >
        <option value="">Not Assigned</option>
        {Object.values(buildings).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <select
        value={device.floor || ''}
        onChange={(e) => upd({ floor: e.target.value ? parseInt(e.target.value) : null })}
        className="px-3 py-2 rounded border"
        style={{ background: theme.bg, borderColor: theme.border }}
        disabled={!device.buildingId}
      >
        <option value="">Not Assigned</option>
        {(buildings[device.buildingId]?.floors || []).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
    </div>

    {(device.type === 'switch' || device.type === 'core') && (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={device.isRoot || false}
          onChange={(e) => upd({ isRoot: e.target.checked })}
        />
        <span className="text-sm">Spanning Tree Root</span>
      </label>
    )}

    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={device.locked || false}
        onChange={(e) => upd({ locked: e.target.checked })}
        className="w-4 h-4 rounded"
      />
      <div>
        <span className="text-sm font-medium">Lock Position</span>
        <p className="text-xs" style={{ color: theme.textMuted }}>
          Prevent dragging in both logical and physical views
        </p>
      </div>
    </label>

    <textarea
      value={device.notes || ''}
      onChange={(e) => upd({ notes: e.target.value })}
      placeholder="Notes"
      rows={3}
      className="w-full px-3 py-2 rounded border text-sm"
      style={{ background: theme.bg, borderColor: theme.border }}
    />
  </div>
);

export default BasicConfigTab;
