/**
 * Bulk Edit Conflict Detection Utilities
 *
 * Detects and analyzes conflicts when bulk editing multiple devices.
 * A conflict occurs when selected devices have different values for a field.
 */

/**
 * Get nested value from object using dot notation path
 * @param {Object} obj - The object to extract value from
 * @param {string} path - Dot notation path (e.g., 'hardware.manufacturer')
 * @returns {*} The value at the path, or undefined if not found
 */
export const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;

  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value === null || value === undefined) return undefined;
    value = value[key];
  }

  return value;
};

/**
 * Set nested value in object using dot notation path
 * @param {Object} obj - The object to modify
 * @param {string} path - Dot notation path
 * @param {*} value - The value to set
 * @returns {Object} The modified object
 */
export const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();

  let current = obj;
  for (const key of keys) {
    if (current[key] === undefined || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
  return obj;
};

/**
 * Detect conflicts for a specific field across multiple devices
 * @param {Array<string>} deviceIds - Array of device IDs to check
 * @param {Object} devices - Object containing all devices keyed by ID
 * @param {string} fieldPath - Dot notation path to field (e.g., 'hardware.manufacturer')
 * @returns {Object} Conflict information
 */
export const detectFieldConflict = (deviceIds, devices, fieldPath) => {
  if (!deviceIds || deviceIds.length === 0) {
    return { hasConflict: false, valueCount: 0, values: [], isEmpty: true };
  }

  // Collect all values for this field
  const valueCounts = new Map();
  let emptyCount = 0;

  deviceIds.forEach(deviceId => {
    const device = devices[deviceId];
    if (!device) return;

    const value = getNestedValue(device, fieldPath);

    // Handle empty/null/undefined values
    if (value === null || value === undefined || value === '') {
      emptyCount++;
      return;
    }

    // Convert arrays to strings for comparison
    const valueKey = Array.isArray(value) ? JSON.stringify(value) : String(value);
    valueCounts.set(valueKey, (valueCounts.get(valueKey) || 0) + 1);
  });

  // Build result
  const values = Array.from(valueCounts.entries()).map(([value, count]) => {
    try {
      // Try to parse back to original type if it was an array
      const parsed = JSON.parse(value);
      return { value: parsed, count };
    } catch {
      return { value, count };
    }
  });

  // Sort by count descending
  values.sort((a, b) => b.count - a.count);

  // Add empty count if present
  if (emptyCount > 0) {
    values.push({ value: null, count: emptyCount });
  }

  const uniqueValueCount = values.length;
  const hasConflict = uniqueValueCount > 1;
  const isEmpty = uniqueValueCount === 0 || (uniqueValueCount === 1 && values[0].value === null);

  return {
    hasConflict,
    valueCount: uniqueValueCount,
    values,
    isEmpty,
    // Most common value (excluding empty)
    mostCommon: values.find(v => v.value !== null)?.value
  };
};

/**
 * Detect conflicts for multiple fields at once
 * @param {Array<string>} deviceIds - Array of device IDs to check
 * @param {Object} devices - Object containing all devices
 * @param {Array<string>} fieldPaths - Array of field paths to check
 * @returns {Object} Map of field paths to conflict info
 */
export const detectAllConflicts = (deviceIds, devices, fieldPaths) => {
  const conflicts = {};

  fieldPaths.forEach(fieldPath => {
    conflicts[fieldPath] = detectFieldConflict(deviceIds, devices, fieldPath);
  });

  return conflicts;
};

/**
 * Format conflict summary for display
 * @param {Object} conflict - Conflict info from detectFieldConflict
 * @param {number} maxValues - Maximum number of values to show
 * @returns {string} Human-readable summary
 */
export const formatConflictSummary = (conflict, maxValues = 3) => {
  if (!conflict.hasConflict) {
    return '';
  }

  const parts = [];
  const valuesToShow = conflict.values.slice(0, maxValues);

  valuesToShow.forEach(({ value, count }) => {
    const displayValue = value === null ? 'empty' :
                        Array.isArray(value) ? `[${value.join(', ')}]` :
                        value;
    const deviceWord = count === 1 ? 'device' : 'devices';
    parts.push(`${count} ${deviceWord}: "${displayValue}"`);
  });

  if (conflict.values.length > maxValues) {
    const remaining = conflict.values.length - maxValues;
    parts.push(`+${remaining} more`);
  }

  return parts.join(', ');
};

/**
 * Get recommended value for a conflicting field
 * @param {Object} conflict - Conflict info
 * @returns {*} The recommended value (most common non-empty value)
 */
export const getRecommendedValue = (conflict) => {
  if (!conflict.hasConflict) {
    return conflict.values[0]?.value;
  }

  return conflict.mostCommon;
};
