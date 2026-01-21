import { genId } from '../utils';

// Copy device IP address to clipboard
export const copyIpAddress = (device) => {
  if (device?.ip) {
    navigator.clipboard.writeText(device.ip).catch(err => console.error('Failed to copy IP:', err));
  }
};

// Copy device MAC address to clipboard
export const copyMacAddress = (device) => {
  if (device?.mac) {
    navigator.clipboard.writeText(device.mac).catch(err => console.error('Failed to copy MAC:', err));
  }
};

// Change device type
export const changeDeviceType = (devices, deviceId, newType) => {
  return {
    ...devices,
    [deviceId]: { ...devices[deviceId], type: newType }
  };
};

// Set device as spanning tree root bridge
export const setAsRootBridge = (devices, deviceId) => {
  const updated = { ...devices };
  // Clear old root
  Object.keys(updated).forEach(id => {
    if (updated[id].isRoot) {
      updated[id] = { ...updated[id], isRoot: false };
    }
  });
  // Set new root
  updated[deviceId] = { ...updated[deviceId], isRoot: true };
  return updated;
};

// Copy devices for paste operation
export const prepareDevicesCopy = (devices, selectedDeviceIds) => {
  return selectedDeviceIds
    .map(id => devices[id])
    .filter(Boolean);
};

// Paste devices at a location
export const pasteDevices = (copiedDevices, devices, targetX, targetY, viewMode) => {
  if (!copiedDevices || copiedDevices.length === 0) return { devices, idMap: {} };

  const idMap = {};
  const newDevices = { ...devices };

  // Calculate offset from first device
  const firstDevice = copiedDevices[0];
  const offsetX = targetX - (viewMode === 'logical' ? firstDevice.x : firstDevice.physicalX);
  const offsetY = targetY - (viewMode === 'logical' ? firstDevice.y : firstDevice.physicalY);

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

  return { devices: newDevices, idMap };
};

// Duplicate devices with offset
export const duplicateDevices = (devices, deviceIds, offset = { x: 40, y: 40 }) => {
  const devicesToDuplicate = deviceIds.map(id => devices[id]).filter(Boolean);
  if (devicesToDuplicate.length === 0) return { devices, idMap: {} };

  const idMap = {};
  const newDevices = { ...devices };

  devicesToDuplicate.forEach(device => {
    const newId = genId('dev');
    idMap[device.id] = newId;

    newDevices[newId] = {
      ...device,
      id: newId,
      name: device.name + ' Copy',
      x: device.x + offset.x,
      y: device.y + offset.y,
      physicalX: device.physicalX + offset.x,
      physicalY: device.physicalY + offset.y,
      isRoot: false
    };
  });

  return { devices: newDevices, idMap };
};

// Delete devices and their connections
export const deleteDevices = (devices, connections, deviceIdsToDelete) => {
  const updatedDevices = { ...devices };
  const updatedConnections = { ...connections };

  // Delete devices
  deviceIdsToDelete.forEach(id => {
    delete updatedDevices[id];
  });

  // Delete connections involving deleted devices
  Object.keys(updatedConnections).forEach(connId => {
    const conn = updatedConnections[connId];
    if (deviceIdsToDelete.includes(conn.from) || deviceIdsToDelete.includes(conn.to)) {
      delete updatedConnections[connId];
    }
  });

  return { devices: updatedDevices, connections: updatedConnections };
};

// Update device
export const updateDevice = (devices, deviceId, updates) => {
  return {
    ...devices,
    [deviceId]: { ...devices[deviceId], ...updates }
  };
};
