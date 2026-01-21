import React from 'react';

const MonitoringConfigTab = ({ device, upd, theme }) => {
  const monitoring = device.monitoring || {};
  const metrics = device.metrics || {};
  const cpu = metrics.cpu || {};
  const memory = metrics.memory || {};
  const temperature = metrics.temperature || {};
  const powerDraw = metrics.powerDraw || {};
  const alerts = monitoring.alerts || {};

  const updateMonitoring = (field, value) => {
    upd({ monitoring: { ...device.monitoring, [field]: value } });
  };

  const updateMetrics = (category, field, value) => {
    upd({
      metrics: {
        ...device.metrics,
        [category]: { ...metrics[category], [field]: value }
      }
    });
  };

  const updateAlerts = (field, value) => {
    upd({
      monitoring: {
        ...device.monitoring,
        alerts: { ...alerts, [field]: value }
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
        return '#10b981';
      case 'degraded':
        return '#f59e0b';
      case 'down':
        return '#ef4444';
      default:
        return theme.textMuted;
    }
  };

  const getMetricColor = (current, threshold) => {
    if (!current || !threshold) return theme.textMuted;
    if (current >= threshold) return '#ef4444';
    if (current >= threshold * 0.8) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="space-y-4">
      {/* SNMP Configuration */}
      <div className="border rounded p-3" style={{ borderColor: theme.border }}>
        <h4 className="text-sm font-semibold mb-3">SNMP Configuration</h4>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={monitoring.snmpEnabled || false}
              onChange={(e) => updateMonitoring('snmpEnabled', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">SNMP Enabled</span>
          </label>

          {monitoring.snmpEnabled && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                    Community String
                  </label>
                  <input
                    type="password"
                    value={monitoring.snmpCommunity || ''}
                    onChange={(e) => updateMonitoring('snmpCommunity', e.target.value)}
                    placeholder="public"
                    className="w-full px-3 py-2 rounded border text-sm font-mono"
                    style={{ background: theme.bg, borderColor: theme.border }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                    SNMP Version
                  </label>
                  <select
                    value={monitoring.snmpVersion || 'v2c'}
                    onChange={(e) => updateMonitoring('snmpVersion', e.target.value)}
                    className="w-full px-3 py-2 rounded border text-sm"
                    style={{ background: theme.bg, borderColor: theme.border }}
                  >
                    <option value="v1">v1</option>
                    <option value="v2c">v2c</option>
                    <option value="v3">v3</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="border rounded p-3" style={{ borderColor: theme.border }}>
        <h4 className="text-sm font-semibold mb-3">Performance Metrics</h4>

        <div className="space-y-4">
          {/* CPU */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: theme.textMuted }}>
              CPU Utilization (%)
            </label>
            <div className="grid grid-cols-5 gap-2">
              <div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cpu.current || ''}
                  onChange={(e) => updateMetrics('cpu', 'current', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Current"
                  className="w-full px-2 py-1 rounded border text-xs"
                  style={{
                    background: theme.bg,
                    borderColor: theme.border,
                    color: getMetricColor(cpu.current, cpu.threshold)
                  }}
                />
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                  Current
                </p>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cpu.average5min || ''}
                  onChange={(e) => updateMetrics('cpu', 'average5min', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="5min"
                  className="w-full px-2 py-1 rounded border text-xs"
                  style={{ background: theme.bg, borderColor: theme.border }}
                />
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                  5min avg
                </p>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cpu.average1hour || ''}
                  onChange={(e) => updateMetrics('cpu', 'average1hour', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="1hr"
                  className="w-full px-2 py-1 rounded border text-xs"
                  style={{ background: theme.bg, borderColor: theme.border }}
                />
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                  1hr avg
                </p>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cpu.peak24hour || ''}
                  onChange={(e) => updateMetrics('cpu', 'peak24hour', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Peak"
                  className="w-full px-2 py-1 rounded border text-xs"
                  style={{ background: theme.bg, borderColor: theme.border }}
                />
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                  24hr peak
                </p>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cpu.threshold || 80}
                  onChange={(e) => updateMetrics('cpu', 'threshold', e.target.value ? parseInt(e.target.value) : 80)}
                  className="w-full px-2 py-1 rounded border text-xs"
                  style={{ background: theme.bg, borderColor: theme.border }}
                />
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                  Threshold
                </p>
              </div>
            </div>
          </div>

          {/* Memory */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: theme.textMuted }}>
              Memory
            </label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <input
                  type="number"
                  min="0"
                  value={memory.used || ''}
                  onChange={(e) => updateMetrics('memory', 'used', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Used MB"
                  className="w-full px-2 py-1 rounded border text-xs"
                  style={{ background: theme.bg, borderColor: theme.border }}
                />
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                  Used (MB)
                </p>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  value={memory.total || ''}
                  onChange={(e) => updateMetrics('memory', 'total', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Total MB"
                  className="w-full px-2 py-1 rounded border text-xs"
                  style={{ background: theme.bg, borderColor: theme.border }}
                />
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                  Total (MB)
                </p>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={memory.usedPercent || ''}
                  onChange={(e) => updateMetrics('memory', 'usedPercent', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Percent"
                  className="w-full px-2 py-1 rounded border text-xs"
                  style={{
                    background: theme.bg,
                    borderColor: theme.border,
                    color: getMetricColor(memory.usedPercent, memory.threshold)
                  }}
                />
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                  Used %
                </p>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={memory.threshold || 85}
                  onChange={(e) => updateMetrics('memory', 'threshold', e.target.value ? parseInt(e.target.value) : 85)}
                  className="w-full px-2 py-1 rounded border text-xs"
                  style={{ background: theme.bg, borderColor: theme.border }}
                />
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                  Threshold
                </p>
              </div>
            </div>
          </div>

          {/* Temperature & Power */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: theme.textMuted }}>
                Temperature (°C)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    value={temperature.current || ''}
                    onChange={(e) => updateMetrics('temperature', 'current', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Current"
                    className="w-full px-2 py-1 rounded border text-xs"
                    style={{
                      background: theme.bg,
                      borderColor: theme.border,
                      color: getMetricColor(temperature.current, temperature.threshold)
                    }}
                  />
                  <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                    Current
                  </p>
                </div>
                <div>
                  <input
                    type="number"
                    value={temperature.threshold || 75}
                    onChange={(e) => updateMetrics('temperature', 'threshold', e.target.value ? parseInt(e.target.value) : 75)}
                    className="w-full px-2 py-1 rounded border text-xs"
                    style={{ background: theme.bg, borderColor: theme.border }}
                  />
                  <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                    Threshold
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: theme.textMuted }}>
                Power Draw
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    value={powerDraw.current || ''}
                    onChange={(e) => updateMetrics('powerDraw', 'current', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Current"
                    className="w-full px-2 py-1 rounded border text-xs"
                    style={{ background: theme.bg, borderColor: theme.border }}
                  />
                  <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                    Current (W)
                  </p>
                </div>
                <div>
                  <input
                    type="number"
                    value={powerDraw.available || ''}
                    onChange={(e) => updateMetrics('powerDraw', 'available', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Available"
                    className="w-full px-2 py-1 rounded border text-xs"
                    style={{ background: theme.bg, borderColor: theme.border }}
                  />
                  <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                    Available (W)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ping Monitoring */}
      <div className="border rounded p-3" style={{ borderColor: theme.border }}>
        <h4 className="text-sm font-semibold mb-3">Connectivity Monitoring</h4>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Ping Target
              </label>
              <input
                value={monitoring.pingTarget || ''}
                onChange={(e) => updateMonitoring('pingTarget', e.target.value)}
                placeholder={device.ip || 'IP or hostname'}
                className="w-full px-3 py-2 rounded border text-sm font-mono"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Status
              </label>
              <select
                value={monitoring.pingStatus || 'unknown'}
                onChange={(e) => updateMonitoring('pingStatus', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  background: theme.bg,
                  borderColor: theme.border,
                  color: getStatusColor(monitoring.pingStatus)
                }}
              >
                <option value="ok">OK</option>
                <option value="degraded">Degraded</option>
                <option value="down">Down</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Latency (ms)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={monitoring.pingLatency || ''}
                onChange={(e) => updateMonitoring('pingLatency', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="0.0"
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Packet Loss (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={monitoring.packetLoss || ''}
                onChange={(e) => updateMonitoring('packetLoss', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="0.0"
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
              Last Checked
            </label>
            <input
              type="datetime-local"
              value={monitoring.lastChecked || ''}
              onChange={(e) => updateMonitoring('lastChecked', e.target.value)}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ background: theme.bg, borderColor: theme.border }}
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="border rounded p-3" style={{ borderColor: theme.border }}>
        <h4 className="text-sm font-semibold mb-3">Active Alerts</h4>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#ef4444' }}>
              Critical
            </label>
            <input
              type="number"
              min="0"
              value={alerts.critical || 0}
              onChange={(e) => updateAlerts('critical', e.target.value ? parseInt(e.target.value) : 0)}
              className="w-full px-3 py-2 rounded border text-sm text-center font-bold"
              style={{ background: theme.bg, borderColor: theme.border, color: '#ef4444' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#f59e0b' }}>
              Warning
            </label>
            <input
              type="number"
              min="0"
              value={alerts.warning || 0}
              onChange={(e) => updateAlerts('warning', e.target.value ? parseInt(e.target.value) : 0)}
              className="w-full px-3 py-2 rounded border text-sm text-center font-bold"
              style={{ background: theme.bg, borderColor: theme.border, color: '#f59e0b' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#3b82f6' }}>
              Info
            </label>
            <input
              type="number"
              min="0"
              value={alerts.info || 0}
              onChange={(e) => updateAlerts('info', e.target.value ? parseInt(e.target.value) : 0)}
              className="w-full px-3 py-2 rounded border text-sm text-center font-bold"
              style={{ background: theme.bg, borderColor: theme.border, color: '#3b82f6' }}
            />
          </div>
        </div>
      </div>

      <p className="text-xs" style={{ color: theme.textMuted }}>
        Track real-time performance metrics, connectivity status, and alerts for proactive monitoring.
      </p>
    </div>
  );
};

export default MonitoringConfigTab;
