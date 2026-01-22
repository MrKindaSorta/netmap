/**
 * AI Edit Parser & Validator
 * Extracts and validates AI-proposed network changes
 */

/**
 * Extract JSON proposal from AI message
 * @param {string} message - AI message content
 * @returns {Object|null} Parsed proposal or null
 */
export function extractChangeProposal(message) {
  const jsonMatch = message.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) return null;

  try {
    const proposal = JSON.parse(jsonMatch[1]);
    if (
      proposal.action === 'propose_network_change' &&
      proposal.deviceIds &&
      Array.isArray(proposal.deviceIds) &&
      proposal.updates &&
      proposal.summary
    ) {
      return proposal;
    }
  } catch (error) {
    console.error('Failed to parse AI proposal JSON:', error);
  }
  return null;
}

/**
 * Validate proposed updates
 * @param {Object} updates - Proposed updates object
 * @param {Object} devices - Existing devices
 * @returns {Object} Validation result {valid, errors}
 */
export function validateProposedUpdates(updates, devices) {
  const errors = {};

  // IP validation
  if (updates.ip !== undefined && updates.ip !== null && updates.ip !== '') {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(updates.ip)) {
      errors.ip = 'Invalid IP address format';
    } else {
      const octets = updates.ip.split('.').map(Number);
      if (octets.some(o => o < 0 || o > 255)) {
        errors.ip = 'IP octets must be between 0 and 255';
      }
    }
  }

  // MAC validation
  if (updates.mac !== undefined && updates.mac !== null && updates.mac !== '') {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(updates.mac)) {
      errors.mac = 'Invalid MAC address format (use XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX)';
    }
  }

  // Status validation
  if (updates.status) {
    const validStatuses = ['up', 'down', 'warning', 'maintenance', 'offline'];
    if (!validStatuses.includes(updates.status)) {
      errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
    }
  }

  // Type validation
  if (updates.type) {
    const validTypes = ['firewall', 'core', 'switch', 'ap', 'server', 'router', 'wan'];
    if (!validTypes.includes(updates.type)) {
      errors.type = `Type must be one of: ${validTypes.join(', ')}`;
    }
  }

  // Floor validation
  if (updates.floor !== undefined && updates.floor !== null) {
    const num = parseInt(updates.floor);
    if (isNaN(num) || num < 1) {
      errors.floor = 'Floor must be a positive number';
    }
  }

  // Name validation
  if (updates.name !== undefined && updates.name !== null) {
    if (typeof updates.name !== 'string' || updates.name.trim() === '') {
      errors.name = 'Name cannot be empty';
    }
  }

  // Hardware nested validations
  if (updates.hardware) {
    if (updates.hardware.manufacturer !== undefined && typeof updates.hardware.manufacturer !== 'string') {
      errors['hardware.manufacturer'] = 'Manufacturer must be a string';
    }
    if (updates.hardware.model !== undefined && typeof updates.hardware.model !== 'string') {
      errors['hardware.model'] = 'Model must be a string';
    }
    if (updates.hardware.firmware) {
      if (updates.hardware.firmware.version !== undefined && typeof updates.hardware.firmware.version !== 'string') {
        errors['hardware.firmware.version'] = 'Firmware version must be a string';
      }
      if (updates.hardware.firmware.lastUpdated !== undefined && typeof updates.hardware.firmware.lastUpdated !== 'string') {
        errors['hardware.firmware.lastUpdated'] = 'Firmware last updated must be a date string';
      }
    }
  }

  // Add support for dot notation in updates object
  if (updates['hardware.firmware.version'] !== undefined && typeof updates['hardware.firmware.version'] !== 'string') {
    errors['hardware.firmware.version'] = 'Firmware version must be a string';
  }
  if (updates['hardware.firmware.lastUpdated'] !== undefined && typeof updates['hardware.firmware.lastUpdated'] !== 'string') {
    errors['hardware.firmware.lastUpdated'] = 'Firmware last updated must be a date string';
  }
  if (updates['hardware.manufacturer'] !== undefined && typeof updates['hardware.manufacturer'] !== 'string') {
    errors['hardware.manufacturer'] = 'Manufacturer must be a string';
  }
  if (updates['hardware.model'] !== undefined && typeof updates['hardware.model'] !== 'string') {
    errors['hardware.model'] = 'Model must be a string';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Check if device IDs exist
 * @param {Array} deviceIds - Device IDs to check
 * @param {Object} devices - Existing devices
 * @returns {Object} Validation result {valid, missingIds}
 */
export function validateDeviceIds(deviceIds, devices) {
  const missingIds = deviceIds.filter(id => !devices[id]);
  return {
    valid: missingIds.length === 0,
    missingIds
  };
}

/**
 * Get human-readable field labels
 * @param {string} fieldPath - Field path (e.g., "hardware.firmware.version")
 * @returns {string} Human-readable label
 */
export function getFieldLabel(fieldPath) {
  const labels = {
    'name': 'Name',
    'ip': 'IP Address',
    'mac': 'MAC Address',
    'status': 'Status',
    'type': 'Device Type',
    'floor': 'Floor',
    'buildingId': 'Building',
    'notes': 'Notes',
    'hardware.manufacturer': 'Manufacturer',
    'hardware.model': 'Model',
    'hardware.serialNumber': 'Serial Number',
    'hardware.firmware.version': 'Firmware Version',
    'hardware.firmware.lastUpdated': 'Firmware Last Updated',
    'hardware.firmware.updateAvailable': 'Update Available',
    'hardware.firmware.updateVersion': 'Available Update Version',
    'location.building': 'Building Name',
    'location.floor': 'Floor Description',
    'location.room': 'Room'
  };
  return labels[fieldPath] || fieldPath;
}

/**
 * Build affected devices list with old/new values
 * @param {Array} deviceIds - Device IDs to update
 * @param {Object} updates - Updates to apply
 * @param {Object} devices - Existing devices
 * @returns {Array} Affected devices with changes
 */
export function buildAffectedDevicesList(deviceIds, updates, devices) {
  return deviceIds.map(id => {
    const device = devices[id];
    if (!device) return null;

    const changes = {};

    // Build changes object with old/new values
    Object.keys(updates).forEach(key => {
      if (key.includes('.')) {
        // Handle nested fields
        const parts = key.split('.');
        let oldValue = device;
        for (const part of parts) {
          oldValue = oldValue?.[part];
        }
        changes[key] = { old: oldValue, new: updates[key] };
      } else {
        changes[key] = { old: device[key], new: updates[key] };
      }
    });

    return {
      id: device.id,
      name: device.name,
      changes
    };
  }).filter(Boolean);
}

/**
 * Apply nested updates to device object
 * @param {Object} device - Device object
 * @param {Object} updates - Updates to apply
 * @returns {Object} Updated device
 */
export function applyNestedUpdates(device, updates) {
  const updatedDevice = { ...device };

  Object.entries(updates).forEach(([key, value]) => {
    if (key.includes('.')) {
      // Handle nested fields like "hardware.firmware.version"
      const parts = key.split('.');
      let current = updatedDevice;

      // Navigate to parent object, creating if needed
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        } else {
          current[parts[i]] = { ...current[parts[i]] };
        }
        current = current[parts[i]];
      }

      // Set final value
      current[parts[parts.length - 1]] = value;
    } else {
      // Simple field
      updatedDevice[key] = value;
    }
  });

  return updatedDevice;
}

/**
 * Check if device already exists by name, IP, or MAC
 * @param {Object} device - Device to check
 * @param {Object} existingDevices - Existing devices object
 * @returns {Object|null} Existing device if found, null otherwise
 */
export function findExistingDevice(device, existingDevices) {
  // Check exact name match (case-insensitive)
  const byName = Object.values(existingDevices).find(
    d => d.name.toLowerCase().trim() === device.name.toLowerCase().trim()
  );
  if (byName) return byName;

  // Check IP match (if IP provided)
  if (device.ip && device.ip.trim()) {
    const byIp = Object.values(existingDevices).find(
      d => d.ip === device.ip.trim()
    );
    if (byIp) return byIp;
  }

  // Check MAC match (if MAC provided)
  if (device.mac && device.mac.trim()) {
    const normalizedMac = device.mac.replace(/[-:]/g, '').toLowerCase();
    const byMac = Object.values(existingDevices).find(d => {
      if (!d.mac) return false;
      const existingMac = d.mac.replace(/[-:]/g, '').toLowerCase();
      return existingMac === normalizedMac;
    });
    if (byMac) return byMac;
  }

  return null;
}
