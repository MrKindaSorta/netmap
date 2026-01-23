/**
 * Cryptographic utilities for password hashing
 * Uses Web Crypto API (available in Cloudflare Workers)
 */

const PBKDF2_ITERATIONS = 100000;
const HASH_LENGTH = 32;
const SALT_LENGTH = 16;

/**
 * Generate a random salt
 * @returns {Promise<Uint8Array>} Random salt bytes
 */
async function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Convert byte array to hex string
 * @param {Uint8Array} bytes - Byte array
 * @returns {string} Hex string
 */
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to byte array
 * @param {string} hex - Hex string
 * @returns {Uint8Array} Byte array
 */
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Hash password using PBKDF2
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password in format: pbkdf2$iterations$salt$hash
 */
export async function hashPassword(password) {
  const salt = await generateSalt();
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    HASH_LENGTH * 8
  );

  const hash = new Uint8Array(derivedBits);

  // Format: pbkdf2$iterations$salt$hash (all in hex)
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(hash)}`;
}

/**
 * Verify password against stored hash
 * @param {string} password - Plain text password
 * @param {string} storedHash - Stored hash from database
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, storedHash) {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      return false;
    }

    const iterations = parseInt(parts[1], 10);
    const salt = hexToBytes(parts[2]);
    const storedHashBytes = hexToBytes(parts[3]);

    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    // Derive key using PBKDF2 with same parameters
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      HASH_LENGTH * 8
    );

    const computedHash = new Uint8Array(derivedBits);

    // Constant-time comparison
    if (computedHash.length !== storedHashBytes.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < computedHash.length; i++) {
      result |= computedHash[i] ^ storedHashBytes[i];
    }

    return result === 0;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate a secure random ID with prefix
 * @param {string} prefix - ID prefix (e.g., 'usr', 'net', 'share')
 * @returns {string} Secure random ID
 */
export function generateSecureId(prefix = '') {
  const timestamp = Date.now();
  const randomBytes = crypto.getRandomValues(new Uint8Array(8));
  const randomHex = bytesToHex(randomBytes);

  return prefix ? `${prefix}_${timestamp}_${randomHex}` : `${timestamp}_${randomHex}`;
}

/**
 * Generate a secure random token for refresh tokens
 * @returns {string} Random token (64 hex characters)
 */
export function generateSecureToken() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(randomBytes);
}

/**
 * Hash a token for storage (using SHA-256)
 * @param {string} token - Token to hash
 * @returns {Promise<string>} Hashed token (hex)
 */
export async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(hashBuffer));
}
