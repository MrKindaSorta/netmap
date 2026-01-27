/**
 * Meraki Dashboard API Integration
 * Docs: https://developer.cisco.com/meraki/api-v1/
 */

const MERAKI_API_BASE = 'https://api.meraki.com/api/v1';

export async function fetchMerakiOrganizations(apiKey) {
  const response = await fetch(`${MERAKI_API_BASE}/organizations`, {
    headers: {
      'X-Cisco-Meraki-API-Key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Meraki API error: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchMerakiNetworks(apiKey, organizationId) {
  const response = await fetch(
    `${MERAKI_API_BASE}/organizations/${organizationId}/networks`,
    {
      headers: {
        'X-Cisco-Meraki-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Meraki API error: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchMerakiDevices(apiKey, networkId) {
  const response = await fetch(
    `${MERAKI_API_BASE}/networks/${networkId}/devices`,
    {
      headers: {
        'X-Cisco-Meraki-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Meraki API error: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchMerakiDeviceStatuses(apiKey, organizationId) {
  const response = await fetch(
    `${MERAKI_API_BASE}/organizations/${organizationId}/devices/statuses`,
    {
      headers: {
        'X-Cisco-Meraki-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Meraki API error: ${response.statusText}`);
  }

  return await response.json();
}

export function convertMerakiDeviceToNetMapDevice(merakiDevice, merakiStatus) {
  // Map Meraki device types to NetMap types
  const typeMap = {
    'MX': 'firewall',
    'MS': 'switch',
    'MR': 'ap',
    'MV': 'camera',
    'MG': 'wan'
  };

  const deviceType = typeMap[merakiDevice.model?.substring(0, 2)] || 'server';

  return {
    id: `meraki-${merakiDevice.serial}`,
    name: merakiDevice.name || `${merakiDevice.model}-${merakiDevice.serial.slice(-4)}`,
    type: deviceType,
    ip: merakiDevice.lanIp || '',
    mac: merakiDevice.mac || '',
    status: merakiStatus?.status === 'online' ? 'up' : 'down',
    hardware: {
      manufacturer: 'Cisco Meraki',
      model: merakiDevice.model,
      serial: merakiDevice.serial
    },
    firmware: {
      version: merakiDevice.firmware || '',
      current: merakiDevice.firmware || ''
    },
    notes: `Imported from Meraki Dashboard\nNetwork: ${merakiDevice.networkId}`,
    tags: ['meraki-imported']
  };
}

export async function importFromMeraki(apiKey, organizationId, networkId) {
  try {
    // Fetch devices and their statuses
    const [devices, statuses] = await Promise.all([
      fetchMerakiDevices(apiKey, networkId),
      fetchMerakiDeviceStatuses(apiKey, organizationId)
    ]);

    // Create status lookup map
    const statusMap = {};
    statuses.forEach(status => {
      statusMap[status.serial] = status;
    });

    // Convert to NetMap format
    const netmapDevices = devices.map(device =>
      convertMerakiDeviceToNetMapDevice(device, statusMap[device.serial])
    );

    return {
      success: true,
      devices: netmapDevices,
      count: netmapDevices.length
    };

  } catch (error) {
    console.error('Meraki import failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
