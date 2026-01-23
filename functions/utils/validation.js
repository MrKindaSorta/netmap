/**
 * Input validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic email regex - checks for format like user@domain.tld
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 * - Contains special character
 *
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate network name
 * @param {string} name - Network name
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateNetworkName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Network name is required' };
  }

  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Network name cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Network name must be 100 characters or less' };
  }

  return { valid: true, error: null };
}

/**
 * Validate permission type
 * @param {string} permission - Permission type
 * @returns {boolean} True if valid permission
 */
export function validatePermission(permission) {
  return permission === 'view' || permission === 'edit';
}

/**
 * Sanitize string input (prevent XSS)
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export function sanitizeString(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, ''); // Remove < and > to prevent basic XSS
}

/**
 * Validate UUID format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ID format
 */
export function validateId(id) {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // Check for our custom ID format: prefix_timestamp_random
  const idRegex = /^[a-z]+_\d+_[a-f0-9]+$/;
  return idRegex.test(id);
}
