/**
 * Data Migration Utilities
 * Handles migration of device, connection, and VLAN data from v3.x to v4.0
 * Ensures backwards compatibility and initializes new field structures
 */

// Generate unique ID
export const genId = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
};

// Initialize type-specific fields based on device type
export const initializeSpecificFields = (deviceType) => {
  switch (deviceType) {
    case 'firewall':
      return {
        throughput: { current: null, peak24hour: null, capacity: null, unit: 'Mbps' },
        connections: { active: null, max: null, newPerSecond: null, threshold: null },
        securityEvents: { blocked: null, allowed: null, period: '24h' },
        vpnTunnels: { active: 0, configured: 0, tunnels: [] },
        wan: { primaryStatus: 'unknown', failoverStatus: 'unknown', publicIP: '', natEnabled: false },
        policies: { firewallRules: null, natRules: null, applicationRules: null },
        ips: { enabled: false, mode: '', signatures: null, lastUpdate: null }
      };

    case 'core':
      return {
        ports: { total: null, inUse: null, available: null, sfpSlots: null, sfpUsed: null },
        stack: { enabled: false, stackMember: null, stackPriority: null, stackRole: '', stackMembers: [] },
        spanningTree: { mode: '', rootBridge: false, priority: null, designated: null, blocking: null },
        portChannels: [],
        routing: { enabled: false, protocol: '', routes: null, neighbors: null },
        vtp: { enabled: false, mode: '', domain: '', version: '' }
      };

    case 'switch':
      return {
        ports: { total: null, inUse: null, poeCapable: null, sfpSlots: null },
        poe: { used: null, available: null, budget: null, class4Ports: null },
        portDetails: [],
        uplink: { ports: [], redundancy: false, uplinkDevice: '', protocol: '' },
        vlansTrunked: []
      };

    case 'ap':
      return {
        controller: { name: '', ip: '', type: '' },
        clients: { total: 0, byBand: { '2.4GHz': 0, '5GHz': 0, '6GHz': 0 }, bySSID: {} },
        radio: {
          '2.4GHz': { channel: null, power: null, utilization: null, interference: null, mode: '' },
          '5GHz': { channel: null, power: null, utilization: null, interference: null, mode: '' },
          '6GHz': { channel: null, power: null, utilization: null, interference: null, mode: '' }
        },
        mesh: { enabled: false, role: '', parent: '', hopCount: null },
        poe: { received: null, standard: '' },
        coverage: { estimatedRange: null, channelMap: '' }
      };

    case 'wan':
      return {
        provider: { name: '', circuitID: '', accountNumber: '', supportPhone: '', accountManager: '' },
        bandwidth: { download: null, upload: null, burstable: false, burstRate: null },
        utilization: { current: null, peak24hour: null },
        ipAllocation: { type: '', publicIP: '', ipBlock: '', gateway: '', subnet: '' },
        sla: { uptimeGuarantee: null, latencyGuarantee: null, supportTier: '', responseTime: '' },
        monitoring: { pingTarget: '', currentLatency: null, packetLoss: null, jitter: null, lastOutage: null, outageDuration: null, mttr: null },
        costTracking: { monthlyCost: null, contractTerm: null, contractExpires: null, autoRenew: false }
      };

    case 'server':
      return {
        role: '',
        os: { name: '', version: '', edition: '', kernel: '', lastPatched: null },
        hardware: { cpu: '', memory: '', storage: [], networkCards: [] },
        virtualization: { type: '', version: '', host: '', cluster: '', vmCount: null },
        services: [],
        backup: { lastBackup: null, backupLocation: '', backupStatus: '', backupSize: null, retentionDays: null, backupSchedule: '' },
        applications: [],
        dependencies: [],
        clustered: { enabled: false, clusterName: '', clusterMembers: [], role: '' }
      };

    case 'workstation':
      return {
        user: { primaryUser: '', department: '', emailAssigned: '' },
        os: { name: '', version: '', build: '', lastPatched: null },
        hardware: { cpu: '', ram: '', storage: '', storageType: '' },
        management: { domainJoined: false, domain: '', managedBy: '', lastCheckIn: null },
        software: []
      };

    case 'printer':
      return {
        type: '',
        capabilities: [],
        supplies: [],
        pageCount: { total: null, color: null, blackAndWhite: null },
        paperTrays: [],
        serviceContract: { provider: '', expires: null, coverageType: '' }
      };

    case 'camera':
      return {
        cameraType: '',
        resolution: '',
        framerate: null,
        lens: { type: '', focalLength: '', fov: '' },
        recording: { enabled: false, recorder: '', retentionDays: null, storage: '' },
        features: [],
        poe: { standard: '', watts: null },
        coverage: { area: '', direction: '' }
      };

    case 'phone':
      return {
        extension: '',
        user: { name: '', department: '' },
        phoneModel: '',
        lineKeys: null,
        expansionModules: null,
        features: [],
        callServer: { name: '', ip: '', registrationStatus: '' },
        sipAccount: '',
        callStatistics: { inbound: null, outbound: null, missed: null }
      };

    case 'cloud':
      return {
        provider: '',
        serviceType: '',
        region: '',
        instanceType: '',
        publicEndpoint: '',
        authentication: '',
        costTracking: { monthlyCost: null, billingAccount: '' }
      };

    case 'router':
      return {
        routing: { protocol: '', routes: null, neighbors: null },
        interfaces: [],
        nat: { enabled: false, rules: [] },
        bgp: { asn: null, neighbors: [] }
      };

    default:
      return {};
  }
};

// Migrate device data from v3.x to v4.0
export const migrateDeviceData = (device) => {
  // Preserve ALL existing fields
  const migrated = { ...device };

  // Initialize new common base fields if not present
  migrated.hardware = device.hardware || {
    manufacturer: '',
    model: '',
    serialNumber: '',
    firmware: {
      version: '',
      lastUpdated: null,
      updateAvailable: false,
      updateVersion: ''
    },
    uptime: {
      seconds: null,
      lastReboot: null,
      lastRebootReason: ''
    }
  };

  migrated.asset = device.asset || {
    assetTag: '',
    purchaseDate: null,
    purchasePrice: null,
    vendor: '',
    warrantyExpires: null,
    warrantyType: 'none',
    eolDate: null,
    eosDate: null,
    maintenanceContract: '',
    owner: '',
    costCenter: ''
  };

  migrated.location = device.location || {
    building: '',
    floor: '',
    room: '',
    rack: '',
    rackUnit: { start: null, height: null },
    coordinates: { latitude: null, longitude: null }
  };

  migrated.metrics = device.metrics || {
    cpu: { current: null, average5min: null, average1hour: null, peak24hour: null, threshold: 80 },
    memory: { used: null, total: null, usedPercent: null, threshold: 85 },
    temperature: { current: null, threshold: 75, sensorLocations: [] },
    powerDraw: { current: null, available: null, unit: 'W' }
  };

  migrated.monitoring = device.monitoring || {
    snmpEnabled: false,
    snmpCommunity: '',
    snmpVersion: 'v2c',
    pingTarget: device.ip || '',
    pingLatency: null,
    pingStatus: 'unknown',
    packetLoss: null,
    lastChecked: null,
    alerts: { critical: 0, warning: 0, info: 0 }
  };

  migrated.network = device.network || {
    hostname: '',
    fqdn: '',
    managementIP: device.ip || '',
    managementVLAN: null,
    secondaryIPs: [],
    ipv6Address: '',
    defaultGateway: '',
    dnsServers: [],
    ntpServers: [],
    syslogServer: ''
  };

  migrated.config = device.config || {
    lastBackup: null,
    lastChange: null,
    changedBy: '',
    configHash: '',
    backupLocation: '',
    backupStatus: '',
    changeLog: []
  };

  migrated.security = device.security || {
    lastSecurityAudit: null,
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
    lastVulnerabilityScan: null,
    complianceStatus: '',
    securityZone: '',
    accessControlLists: [],
    authenticationMethod: ''
  };

  migrated.maintenance = device.maintenance || {
    lastMaintenance: null,
    nextScheduled: null,
    maintenanceWindow: '',
    maintenanceNotes: '',
    maintenanceHistory: []
  };

  migrated.licensing = device.licensing || {
    licenses: []
  };

  // Initialize type-specific fields
  migrated.specific = device.specific || initializeSpecificFields(device.type);

  // Preserve legacy optional configs (backwards compatibility)
  migrated.dhcpConfig = device.dhcpConfig || { enabled: false, pools: [] };
  migrated.ssidConfig = device.ssidConfig || { ssids: [] };
  migrated.voipConfig = device.voipConfig || null;

  return migrated;
};

// Migrate connection data to v4.0
export const migrateConnectionData = (connection) => {
  const migrated = { ...connection };

  // Add new connection metadata fields
  migrated.utilization = connection.utilization || {
    tx: null,
    rx: null,
    currentBandwidth: null,
    peak24hour: null
  };

  migrated.quality = connection.quality || {
    errorRate: null,
    crcErrors: null,
    collisions: null,
    drops: null,
    latency: null,
    jitter: null
  };

  migrated.stability = connection.stability || {
    lastFlap: null,
    flapCount: 0,
    uptime: null
  };

  migrated.installation = connection.installation || {
    installedDate: null,
    installedBy: '',
    cableLabel: '',
    cableRoute: '',
    testedDate: null,
    testResults: ''
  };

  migrated.redundancy = connection.redundancy || {
    isPrimary: true,
    redundantWith: null,
    failoverMode: ''
  };

  migrated.notes = connection.notes || '';

  return migrated;
};

// Migrate VLAN data to v4.0
export const migrateVlanData = (vlan) => {
  const migrated = { ...vlan };

  // Add new VLAN fields
  migrated.dhcp = vlan.dhcp || {
    enabled: false,
    dhcpServer: '',
    pool: { start: '', end: '' },
    activeLeases: null,
    reservations: []
  };

  migrated.network = vlan.network || {
    activeHosts: null,
    utilization: null,
    broadcast: '',
    networkAddress: ''
  };

  migrated.routing = vlan.routing || {
    routedBy: '',
    routes: []
  };

  migrated.spanningTree = vlan.spanningTree || {
    priority: null,
    rootBridge: ''
  };

  migrated.acl = vlan.acl || {
    inbound: '',
    outbound: ''
  };

  migrated.qos = vlan.qos || {
    priority: null,
    dscpMarking: ''
  };

  migrated.purpose = vlan.purpose || [];
  migrated.securityZone = vlan.securityZone || '';

  migrated.monitoring = vlan.monitoring || {
    snmpTrap: false,
    syslog: false,
    netflow: false
  };

  return migrated;
};

// Detect data version
export const detectDataVersion = (data) => {
  if (data.v) {
    return parseFloat(data.v);
  }
  // Legacy detection
  return 3.0;
};

// Main migration orchestrator
export const migrateNetworkData = (data) => {
  const version = detectDataVersion(data);

  if (version >= 4.0) {
    // Already at current version
    return data;
  }

  // Migrate devices
  if (data.devices) {
    const migratedDevices = {};
    Object.entries(data.devices).forEach(([id, device]) => {
      migratedDevices[id] = migrateDeviceData(device);
    });
    data.devices = migratedDevices;
  }

  // Migrate connections
  if (data.connections) {
    const migratedConnections = {};
    Object.entries(data.connections).forEach(([id, connection]) => {
      migratedConnections[id] = migrateConnectionData(connection);
    });
    data.connections = migratedConnections;
  }

  // Migrate VLANs
  if (data.vlans) {
    const migratedVlans = {};
    Object.entries(data.vlans).forEach(([id, vlan]) => {
      migratedVlans[id] = migrateVlanData(vlan);
    });
    data.vlans = migratedVlans;
  }

  // Update version
  data.v = '4.0';

  return data;
};
