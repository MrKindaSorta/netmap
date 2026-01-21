/**
 * AI Device Positioning Service
 * Calculates intelligent positions for AI-suggested devices
 */

const PROXIMITY_RADIUS = 150;
const GRID_SNAP = 20;
const MIN_SPACING = 80;
const MAX_OVERLAP_ATTEMPTS = 50;

/**
 * Calculate intelligent device position based on multiple strategies
 * @param {Object} device - Device properties
 * @param {Array} connections - Suggested connections
 * @param {Object} devices - Existing devices
 * @param {Object} buildings - Buildings data
 * @returns {Object} Position {x, y, strategy}
 */
export function calculateSmartPosition(device, connections, devices, buildings) {
  // Strategy 1: Near Connected Devices (highest priority)
  if (connections && connections.length > 0) {
    const position = positionNearConnected(device, connections, devices);
    if (position) {
      return { ...position, strategy: 'near_connected' };
    }
  }

  // Strategy 2: Near Similar Device Types
  const similarPosition = positionNearSimilarType(device, devices);
  if (similarPosition) {
    return { ...similarPosition, strategy: 'near_similar_type' };
  }

  // Strategy 3: Building/Room Location
  if (device.buildingId && buildings && buildings[device.buildingId]) {
    const buildingPosition = positionInBuilding(device, buildings[device.buildingId], devices);
    if (buildingPosition) {
      return { ...buildingPosition, strategy: 'building_location' };
    }
  }

  // Strategy 4: Topology Tier (fallback)
  return positionByTier(device, devices);
}

/**
 * Position device near connected devices
 */
function positionNearConnected(device, connections, devices) {
  const connectedDevices = connections
    .map(conn => Object.values(devices).find(d => d.name === conn.toDeviceName))
    .filter(Boolean);

  if (connectedDevices.length === 0) return null;

  // Calculate centroid of connected devices
  const centroidX = connectedDevices.reduce((sum, d) => sum + (d.x || d.physicalX || 0), 0) / connectedDevices.length;
  const centroidY = connectedDevices.reduce((sum, d) => sum + (d.y || d.physicalY || 0), 0) / connectedDevices.length;

  // Place at random angle around centroid
  const angle = Math.random() * 2 * Math.PI;
  const distance = PROXIMITY_RADIUS + Math.random() * 50;
  const x = Math.round((centroidX + Math.cos(angle) * distance) / GRID_SNAP) * GRID_SNAP;
  const y = Math.round((centroidY + Math.sin(angle) * distance) / GRID_SNAP) * GRID_SNAP;

  return avoidOverlaps({ x, y }, devices, MIN_SPACING, GRID_SNAP);
}

/**
 * Position device near similar types
 */
function positionNearSimilarType(device, devices) {
  const similarDevices = Object.values(devices).filter(d => d.type === device.type);

  if (similarDevices.length === 0) return null;

  // Calculate centroid of similar devices
  const centroidX = similarDevices.reduce((sum, d) => sum + (d.x || d.physicalX || 0), 0) / similarDevices.length;
  const centroidY = similarDevices.reduce((sum, d) => sum + (d.y || d.physicalY || 0), 0) / similarDevices.length;

  // Offset from centroid
  const angle = Math.random() * 2 * Math.PI;
  const distance = 100 + Math.random() * 50;
  const x = Math.round((centroidX + Math.cos(angle) * distance) / GRID_SNAP) * GRID_SNAP;
  const y = Math.round((centroidY + Math.sin(angle) * distance) / GRID_SNAP) * GRID_SNAP;

  return avoidOverlaps({ x, y }, devices, MIN_SPACING, GRID_SNAP);
}

/**
 * Position device in building bounds
 */
function positionInBuilding(device, building, devices) {
  if (!building.x || !building.y || !building.width || !building.height) {
    return null;
  }

  // Calculate building center
  const centerX = building.x + building.width / 2;
  const centerY = building.y + building.height / 2;

  // Add random offset within building
  const offsetX = (Math.random() - 0.5) * building.width * 0.6;
  const offsetY = (Math.random() - 0.5) * building.height * 0.6;

  const x = Math.round((centerX + offsetX) / GRID_SNAP) * GRID_SNAP;
  const y = Math.round((centerY + offsetY) / GRID_SNAP) * GRID_SNAP;

  return avoidOverlaps({ x, y }, devices, MIN_SPACING, GRID_SNAP);
}

/**
 * Position device by topology tier (fallback strategy)
 */
function positionByTier(device, devices) {
  const tierPositions = {
    firewall: { baseX: 400, baseY: 100 },
    router: { baseX: 400, baseY: 100 },
    wan: { baseX: 300, baseY: 100 },
    core: { baseX: 400, baseY: 200 },
    switch: { baseX: 350, baseY: 350 },
    ap: { baseX: 300, baseY: 500 },
    server: { baseX: 500, baseY: 300 },
    default: { baseX: 400, baseY: 300 }
  };

  const tier = tierPositions[device.type] || tierPositions.default;

  // Add random offset
  const offsetX = (Math.random() - 0.5) * 150;
  const offsetY = (Math.random() - 0.5) * 150;

  const x = Math.round((tier.baseX + offsetX) / GRID_SNAP) * GRID_SNAP;
  const y = Math.round((tier.baseY + offsetY) / GRID_SNAP) * GRID_SNAP;

  return avoidOverlaps({ x, y }, devices, MIN_SPACING, GRID_SNAP);
}

/**
 * Avoid overlaps with existing devices using spiral search
 */
function avoidOverlaps(position, devices, minSpacing, gridSnap) {
  const existingDevices = Object.values(devices);

  // Check if position is already free
  if (!hasOverlap(position, existingDevices, minSpacing)) {
    return position;
  }

  // Spiral search for free space
  for (let attempt = 0; attempt < MAX_OVERLAP_ATTEMPTS; attempt++) {
    const angle = (attempt * 0.618) * 2 * Math.PI; // Golden angle for even distribution
    const distance = Math.sqrt(attempt) * gridSnap;

    const testX = Math.round((position.x + Math.cos(angle) * distance) / gridSnap) * gridSnap;
    const testY = Math.round((position.y + Math.sin(angle) * distance) / gridSnap) * gridSnap;

    const testPosition = { x: testX, y: testY };

    if (!hasOverlap(testPosition, existingDevices, minSpacing)) {
      return testPosition;
    }
  }

  // If no free space found, return original position (better than failing)
  return position;
}

/**
 * Check if position overlaps with any existing device
 */
function hasOverlap(position, existingDevices, minSpacing) {
  return existingDevices.some(device => {
    const dx = (device.x || device.physicalX || 0) - position.x;
    const dy = (device.y || device.physicalY || 0) - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < minSpacing;
  });
}
