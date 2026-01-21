import React from 'react';

const HardwareConfigTab = ({ device, upd, theme }) => {
  const hardware = device.hardware || {};
  const firmware = hardware.firmware || {};
  const uptime = hardware.uptime || {};

  const updateHardware = (field, value) => {
    upd({ hardware: { ...device.hardware, [field]: value } });
  };

  const updateFirmware = (field, value) => {
    upd({
      hardware: {
        ...device.hardware,
        firmware: { ...firmware, [field]: value }
      }
    });
  };

  const updateUptime = (field, value) => {
    upd({
      hardware: {
        ...device.hardware,
        uptime: { ...uptime, [field]: value }
      }
    });
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-4">
      {/* Basic Hardware Info */}
      <div>
        <label className="block text-sm font-medium mb-2">Manufacturer</label>
        <input
          value={hardware.manufacturer || ''}
          onChange={(e) => updateHardware('manufacturer', e.target.value)}
          placeholder="e.g., Cisco, HP, Dell, Ubiquiti"
          className="w-full px-3 py-2 rounded border"
          style={{ background: theme.bg, borderColor: theme.border }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Model</label>
          <input
            value={hardware.model || ''}
            onChange={(e) => updateHardware('model', e.target.value)}
            placeholder="e.g., C9300-48P, DL380 Gen10"
            className="w-full px-3 py-2 rounded border"
            style={{ background: theme.bg, borderColor: theme.border }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Serial Number</label>
          <input
            value={hardware.serialNumber || ''}
            onChange={(e) => updateHardware('serialNumber', e.target.value)}
            placeholder="Serial number"
            className="w-full px-3 py-2 rounded border font-mono text-sm"
            style={{ background: theme.bg, borderColor: theme.border }}
          />
        </div>
      </div>

      {/* Firmware Section */}
      <div className="border rounded p-3" style={{ borderColor: theme.border }}>
        <h4 className="text-sm font-semibold mb-3">Firmware / Software</h4>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Current Version
              </label>
              <input
                value={firmware.version || ''}
                onChange={(e) => updateFirmware('version', e.target.value)}
                placeholder="e.g., 17.9.4a"
                className="w-full px-3 py-2 rounded border text-sm font-mono"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Last Updated
              </label>
              <input
                type="date"
                value={firmware.lastUpdated || ''}
                onChange={(e) => updateFirmware('lastUpdated', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={firmware.updateAvailable || false}
                onChange={(e) => updateFirmware('updateAvailable', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Update Available</span>
            </label>
            {firmware.updateAvailable && (
              <input
                value={firmware.updateVersion || ''}
                onChange={(e) => updateFirmware('updateVersion', e.target.value)}
                placeholder="Update version"
                className="px-3 py-2 rounded border text-sm font-mono"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Uptime Section */}
      <div className="border rounded p-3" style={{ borderColor: theme.border }}>
        <h4 className="text-sm font-semibold mb-3">Uptime</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
              Uptime (seconds) {uptime.seconds && <span className="font-normal">- {formatUptime(uptime.seconds)}</span>}
            </label>
            <input
              type="number"
              value={uptime.seconds || ''}
              onChange={(e) => updateUptime('seconds', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Uptime in seconds"
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ background: theme.bg, borderColor: theme.border }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Last Reboot
              </label>
              <input
                type="datetime-local"
                value={uptime.lastReboot || ''}
                onChange={(e) => updateUptime('lastReboot', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Reboot Reason
              </label>
              <select
                value={uptime.lastRebootReason || ''}
                onChange={(e) => updateUptime('lastRebootReason', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              >
                <option value="">Select reason</option>
                <option value="power-loss">Power Loss</option>
                <option value="manual">Manual Reboot</option>
                <option value="firmware-update">Firmware Update</option>
                <option value="crash">System Crash</option>
                <option value="scheduled">Scheduled Maintenance</option>
                <option value="watchdog">Watchdog Timer</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs" style={{ color: theme.textMuted }}>
        Track hardware details, firmware versions, and uptime for better troubleshooting and maintenance planning.
      </p>
    </div>
  );
};

export default HardwareConfigTab;
