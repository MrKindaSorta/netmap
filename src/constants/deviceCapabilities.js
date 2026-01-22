export const DEVICE_CAPABILITIES = {
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
  'voip-controller': {
    layer: 3,
    canManageVlans: true,
    canRunDhcp: true,
    hasAdvancedConfig: true,
    supportedFeatures: ['sip-trunk', 'extension-management', 'call-routing'],
    isMonitorable: true,
    maxConnections: 1000,
    typicalPorts: [5060, 5061],
    powerDraw: 50
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

export const getDeviceCapabilities = (deviceType) => {
  return DEVICE_CAPABILITIES[deviceType] || DEVICE_CAPABILITIES.unknown;
};

export const getAvailableTabs = (device) => {
  const caps = getDeviceCapabilities(device.type);
  const tabs = ['basic'];

  // Phase 1 tabs - always available for all device types
  tabs.push('hardware');
  tabs.push('location');
  tabs.push('asset');

  // Existing tabs
  if (caps.canManageVlans && !caps.hideVlanConfig) tabs.push('vlans');
  if (caps.canRunDhcp) tabs.push('dhcp');
  if (caps.canBroadcastSSID) tabs.push('ssid');
  if (caps.requiresVoip) tabs.push('voip');

  // Monitoring tab - available for network devices and servers
  const monitorableTypes = ['router', 'firewall', 'core', 'switch', 'ap', 'server', 'voip-controller', 'wan'];
  if (monitorableTypes.includes(device.type)) {
    tabs.push('monitoring');
  }

  if (caps.hasAdvancedConfig) tabs.push('advanced');

  return tabs;
};
