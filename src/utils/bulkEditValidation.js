/**
 * Bulk Edit Validation Utilities
 *
 * Validates field values before applying bulk updates to prevent invalid data.
 */

/**
 * Validate IPv4 address format and range
 * @param {string} ip - The IP address to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateIP = (ip) => {
  if (!ip || typeof ip !== 'string') {
    return { valid: false, error: 'IP address is required' };
  }

  const trimmed = ip.trim();

  // Check basic format
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = trimmed.match(ipv4Regex);

  if (!match) {
    return { valid: false, error: 'Invalid IPv4 format (expected: xxx.xxx.xxx.xxx)' };
  }

  // Check each octet is in valid range (0-255)
  const octets = [match[1], match[2], match[3], match[4]].map(Number);

  for (let i = 0; i < octets.length; i++) {
    if (octets[i] < 0 || octets[i] > 255) {
      return { valid: false, error: `Octet ${i + 1} must be between 0-255 (got ${octets[i]})` };
    }
  }

  return { valid: true, error: null };
};

/**
 * Validate IPv6 address format
 * @param {string} ip - The IPv6 address to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateIPv6 = (ip) => {
  if (!ip || typeof ip !== 'string') {
    return { valid: false, error: 'IPv6 address is required' };
  }

  const trimmed = ip.trim();

  // Simplified IPv6 regex (supports full and compressed formats)
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|::)$/;

  if (!ipv6Regex.test(trimmed)) {
    return { valid: false, error: 'Invalid IPv6 format' };
  }

  return { valid: true, error: null };
};

/**
 * Validate date value
 * @param {string|Date} date - The date to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateDate = (date) => {
  if (!date) {
    return { valid: false, error: 'Date is required' };
  }

  let dateObj;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    return { valid: false, error: 'Invalid date format' };
  }

  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date value' };
  }

  // Check for reasonable date range (1970 to 2100)
  const year = dateObj.getFullYear();
  if (year < 1970 || year > 2100) {
    return { valid: false, error: 'Date must be between 1970 and 2100' };
  }

  return { valid: true, error: null };
};

/**
 * Validate number within range
 * @param {number|string} value - The number to validate
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateNumber = (value, min = null, max = null) => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: 'Number is required' };
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { valid: false, error: 'Must be a valid number' };
  }

  if (min !== null && num < min) {
    return { valid: false, error: `Must be at least ${min}` };
  }

  if (max !== null && num > max) {
    return { valid: false, error: `Must be at most ${max}` };
  }

  return { valid: true, error: null };
};

/**
 * Validate required field (non-empty)
 * @param {*} value - The value to check
 * @param {string} fieldName - Name of field for error message
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, error: `${fieldName} must have at least one value` };
  }

  return { valid: true, error: null };
};

/**
 * Validate hostname format
 * @param {string} hostname - The hostname to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateHostname = (hostname) => {
  if (!hostname || typeof hostname !== 'string') {
    return { valid: false, error: 'Hostname is required' };
  }

  const trimmed = hostname.trim();

  // Hostname rules: alphanumeric, hyphens, dots allowed. Cannot start/end with hyphen
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!hostnameRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid hostname format' };
  }

  if (trimmed.length > 253) {
    return { valid: false, error: 'Hostname too long (max 253 characters)' };
  }

  return { valid: true, error: null };
};

/**
 * Validate VLAN ID
 * @param {number|string} vlanId - The VLAN ID to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateVLAN = (vlanId) => {
  const result = validateNumber(vlanId, 1, 4094);

  if (!result.valid) {
    return { valid: false, error: 'VLAN ID must be between 1-4094' };
  }

  return { valid: true, error: null };
};

/**
 * Validate comma-separated list (e.g., DNS servers)
 * @param {string} value - Comma-separated values
 * @param {Function} itemValidator - Function to validate each item
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateList = (value, itemValidator) => {
  if (!value || typeof value !== 'string') {
    return { valid: true, error: null }; // Empty list is valid
  }

  const items = value.split(',').map(item => item.trim()).filter(Boolean);

  for (let i = 0; i < items.length; i++) {
    const result = itemValidator(items[i]);
    if (!result.valid) {
      return { valid: false, error: `Item ${i + 1}: ${result.error}` };
    }
  }

  return { valid: true, error: null };
};

/**
 * Validate all enabled fields
 * @param {Object} enabledFields - Map of fieldPath -> boolean
 * @param {Object} fieldValues - Map of fieldPath -> value
 * @param {Object} fieldValidators - Map of fieldPath -> validator function
 * @returns {Object} Map of fieldPath -> validation result
 */
export const validateAllFields = (enabledFields, fieldValues, fieldValidators = {}) => {
  const errors = {};

  Object.keys(enabledFields).forEach(fieldPath => {
    if (!enabledFields[fieldPath]) {
      return; // Skip disabled fields
    }

    const value = fieldValues[fieldPath];
    const validator = fieldValidators[fieldPath];

    if (!validator) {
      return; // No validator defined for this field
    }

    const result = validator(value);
    if (!result.valid) {
      errors[fieldPath] = result.error;
    }
  });

  return errors;
};

/**
 * Check if any critical fields are enabled
 * @param {Object} enabledFields - Map of fieldPath -> boolean
 * @param {Array<string>} criticalFields - Array of critical field paths
 * @returns {boolean} True if any critical field is enabled
 */
export const hasCriticalFields = (enabledFields, criticalFields) => {
  return criticalFields.some(field => enabledFields[field]);
};
