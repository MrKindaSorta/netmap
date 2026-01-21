/**
 * Device Auto-Layout Service
 *
 * Intelligently positions devices in buildings while preserving their logical topology.
 * When devices are bulk-assigned to a building, this service:
 * 1. Captures their logical layout (x, y positions from network diagram)
 * 2. Scales the layout to fit within the building bounds
 * 3. Centers the layout group in the building
 * 4. Maintains relative positions between connected devices
 */

// Constants
const MIN_DEVICE_SPACING = 50; // Minimum pixels between devices
const BUILDING_PADDING = 0.1;  // 10% padding around edges
const MIN_LOGICAL_VARIATION = 10; // If all devices within 10px, treat as co-located

/**
 * Calculate bounding box from a set of positions
 * @param {Array} positions - Array of {x, y} objects
 * @returns {Object} {minX, maxX, minY, maxY, width, height}
 */
const getBoundingBox = (positions) => {
  if (!positions || positions.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  }

  const xs = positions.map(p => p.x);
  const ys = positions.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
};

/**
 * Main layout function - preserves logical topology while fitting in building
 *
 * @param {Object} devices - Current devices state object
 * @param {Array} deviceIds - IDs of devices to layout
 * @param {Object} building - Building object with x, y, width, height
 * @returns {Object} Map of deviceId -> {physicalX, physicalY}
 */
export const layoutDevicesInBuilding = (devices, deviceIds, building) => {
  // Filter out any invalid device IDs
  const devicesToLayout = deviceIds
    .map(id => devices[id])
    .filter(d => d);

  if (devicesToLayout.length === 0) {
    return {};
  }

  // CASE 1: Single device - just center it
  if (devicesToLayout.length === 1) {
    const device = devicesToLayout[0];
    return {
      [device.id]: {
        physicalX: building.x + building.width / 2,
        physicalY: building.y + building.height / 2
      }
    };
  }

  // CASE 2: Get logical positions (x, y from network diagram)
  const positions = devicesToLayout.map(d => ({
    id: d.id,
    x: d.x || 0,
    y: d.y || 0
  }));

  // Calculate bounding box
  const bbox = getBoundingBox(positions);
  const logicalWidth = bbox.width;
  const logicalHeight = bbox.height;

  // CASE 3: All devices at same position (or very close) - use grid layout
  if (logicalWidth < MIN_LOGICAL_VARIATION && logicalHeight < MIN_LOGICAL_VARIATION) {
    return gridLayoutDevices(deviceIds, building);
  }

  // CASE 4: Scale to fit with padding
  const padding = BUILDING_PADDING;
  const availableWidth = building.width * (1 - padding * 2);
  const availableHeight = building.height * (1 - padding * 2);

  // Calculate scale factor (don't scale up, only down)
  const scaleX = logicalWidth > 0 ? availableWidth / logicalWidth : 1;
  const scaleY = logicalHeight > 0 ? availableHeight / logicalHeight : 1;
  const scale = Math.min(scaleX, scaleY, 1);

  // Calculate center offset to position the layout group in the building
  const scaledWidth = logicalWidth * scale;
  const scaledHeight = logicalHeight * scale;
  const offsetX = building.x + (building.width - scaledWidth) / 2;
  const offsetY = building.y + (building.height - scaledHeight) / 2;

  // Position each device maintaining relative positions
  const updates = {};
  devicesToLayout.forEach(device => {
    const relativeX = ((device.x || 0) - bbox.minX) * scale;
    const relativeY = ((device.y || 0) - bbox.minY) * scale;

    updates[device.id] = {
      physicalX: offsetX + relativeX,
      physicalY: offsetY + relativeY
    };
  });

  return updates;
};

/**
 * Grid layout fallback - arranges devices in a grid pattern
 * Used when all devices are at the same logical position
 *
 * @param {Array} deviceIds - IDs of devices to layout
 * @param {Object} building - Building object with x, y, width, height
 * @returns {Object} Map of deviceId -> {physicalX, physicalY}
 */
export const gridLayoutDevices = (deviceIds, building) => {
  const count = deviceIds.length;

  if (count === 0) {
    return {};
  }

  // Calculate grid dimensions (roughly square)
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  // Calculate cell size with padding
  const cellWidth = building.width / (cols + 1);
  const cellHeight = building.height / (rows + 1);

  const updates = {};
  deviceIds.forEach((id, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    updates[id] = {
      physicalX: building.x + (col + 1) * cellWidth,
      physicalY: building.y + (row + 1) * cellHeight
    };
  });

  return updates;
};

/**
 * Check if a device's physical position is within building bounds
 *
 * @param {Object} device - Device object with physicalX, physicalY
 * @param {Object} building - Building object with x, y, width, height
 * @returns {boolean} True if device is within building bounds
 */
export const validateDeviceInBuilding = (device, building) => {
  if (!device || !building) {
    return false;
  }

  const hasPhysicalPos = typeof device.physicalX === 'number' &&
                         typeof device.physicalY === 'number';

  if (!hasPhysicalPos) {
    return false;
  }

  return device.physicalX >= building.x &&
         device.physicalX <= building.x + building.width &&
         device.physicalY >= building.y &&
         device.physicalY <= building.y + building.height;
};

/**
 * Calculate the center point of a group of devices
 * Useful for pan/zoom to show newly placed devices
 *
 * @param {Object} devices - Current devices state object
 * @param {Array} deviceIds - IDs of devices to calculate center for
 * @returns {Object} {x, y} center point
 */
export const getDeviceGroupCenter = (devices, deviceIds) => {
  const validDevices = deviceIds
    .map(id => devices[id])
    .filter(d => d && typeof d.physicalX === 'number' && typeof d.physicalY === 'number');

  if (validDevices.length === 0) {
    return { x: 0, y: 0 };
  }

  const sumX = validDevices.reduce((sum, d) => sum + d.physicalX, 0);
  const sumY = validDevices.reduce((sum, d) => sum + d.physicalY, 0);

  return {
    x: sumX / validDevices.length,
    y: sumY / validDevices.length
  };
};
