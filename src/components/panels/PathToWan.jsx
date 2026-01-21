import React, { useMemo, useEffect } from 'react';
import { findPathToWan } from '../../services';
import { getDevColor, cableTypes } from '../../constants';

const PathToWan = ({
  deviceId,
  devices,
  connections,
  theme,
  onHighlightPath,
  getUnit
}) => {
  const pathResult = useMemo(() =>
    findPathToWan(deviceId, devices, connections),
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

      onHighlightPath({
        devices: pathDeviceIds,
        connections: pathConnectionIds
      });
    } else {
      onHighlightPath(null);
    }

    // Cleanup on unmount or device change
    return () => onHighlightPath(null);
  }, [deviceId, pathResult, onHighlightPath]);

  if (!pathResult.found) {
    return (
      <div className="mt-3 p-2 rounded text-xs" style={{ background: theme.bg, color: theme.textMuted }}>
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
        <span className="text-xs font-semibold" style={{ color: theme.text }}>
          Path to WAN
        </span>
        <div className="flex-1 h-px" style={{ background: theme.border }} />
      </div>

      <div className="space-y-0">
        {/* Starting device card */}
        <div className="rounded border" style={{ background: theme.surface, borderColor: theme.border }}>
          <div className="px-3 py-2.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: getDevColor(devices[deviceId]) }} />
            <span className="font-mono text-xs font-semibold" style={{ color: theme.text }}>
              {devices[deviceId].name}
            </span>
          </div>
        </div>

        {/* Each hop */}
        {pathResult.path.map((segment, idx) => (
          <div key={idx}>
            {/* Outgoing port bubble from previous device */}
            <div className="flex justify-center mt-2">
              <div className="px-2.5 py-1 rounded-full border" style={{ background: theme.bg, borderColor: theme.border }}>
                <span className="font-mono text-xs font-semibold" style={{ color: theme.text }}>
                  [{segment.outPort || '?'}]
                </span>
              </div>
            </div>

            {/* Cable connection with arrow */}
            <div className="flex flex-col items-center my-1">
              <span className="text-[10px]" style={{ color: theme.textMuted }}>
                ↓
              </span>
              <span className="text-[10px]" style={{ color: theme.textMuted, opacity: 0.8 }}>
                {cableTypes.find(t => t.value === segment.cableType)?.label || segment.cableType}
                {segment.cableLength > 0 && ` • ${segment.cableLength}${getUnit()}`}
              </span>
              <span className="text-[10px]" style={{ color: theme.textMuted }}>
                ↓
              </span>
            </div>

            {/* Incoming port bubble to next device */}
            <div className="flex justify-center mb-2">
              <div className="px-2.5 py-1 rounded-full border" style={{ background: theme.bg, borderColor: theme.border }}>
                <span className="font-mono text-xs font-semibold" style={{ color: theme.text }}>
                  [{segment.nextPort || '?'}]
                </span>
              </div>
            </div>

            {/* Next device card */}
            <div className="rounded border" style={{ background: theme.surface, borderColor: theme.border }}>
              <div className="px-3 py-2.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: getDevColor(devices[segment.nextDeviceId]) }} />
                <span className="font-mono text-xs font-semibold" style={{ color: theme.text }}>
                  {segment.nextDeviceName}
                </span>
                {segment.nextDeviceId === pathResult.wanDevice.id && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: '#16a34a20', color: '#16a34a' }}>
                    WAN
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Summary footer */}
        <div className="mt-3 pt-2.5 border-t flex items-center justify-between text-[10px]" style={{ borderColor: theme.border, color: theme.textMuted }}>
          <span>{pathResult.path.length} hop{pathResult.path.length !== 1 ? 's' : ''}</span>
          <span>
            {pathResult.path.reduce((sum, seg) => sum + (seg.cableLength || 0), 0).toFixed(1)} {getUnit()} total
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PathToWan);
