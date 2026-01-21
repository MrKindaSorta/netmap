// Find path to WAN using BFS algorithm
export const findPathToWan = (devices, connections, startDeviceId) => {
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
};
