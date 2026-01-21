import { validateVlanForm } from '../utils';

// Create VLAN
export const createVlan = (vlans, vlanData) => {
  const errors = validateVlanForm(vlanData, vlans);
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    vlans: {
      ...vlans,
      [vlanData.id]: vlanData
    }
  };
};

// Update VLAN
export const updateVlan = (vlans, vlanId, vlanData) => {
  const errors = validateVlanForm(vlanData, vlans, vlanId);
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    vlans: {
      ...vlans,
      [vlanId]: vlanData
    }
  };
};

// Delete VLAN and remove it from all devices and connections
export const deleteVlan = (vlans, devices, connections, vlanId) => {
  const updatedVlans = { ...vlans };
  delete updatedVlans[vlanId];

  // Remove VLAN from devices
  const updatedDevices = Object.keys(devices).reduce((acc, deviceId) => {
    const device = devices[deviceId];
    if (device.vlans && device.vlans.includes(parseInt(vlanId))) {
      acc[deviceId] = {
        ...device,
        vlans: device.vlans.filter(v => v !== parseInt(vlanId))
      };
    } else {
      acc[deviceId] = device;
    }
    return acc;
  }, {});

  // Remove VLAN from connections
  const updatedConnections = Object.keys(connections).reduce((acc, connId) => {
    const conn = connections[connId];
    if (conn.vlans && conn.vlans.includes(parseInt(vlanId))) {
      acc[connId] = {
        ...conn,
        vlans: conn.vlans.filter(v => v !== parseInt(vlanId))
      };
    } else {
      acc[connId] = conn;
    }
    return acc;
  }, {});

  return {
    vlans: updatedVlans,
    devices: updatedDevices,
    connections: updatedConnections
  };
};
