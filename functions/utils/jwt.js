/**
 * JWT Utilities for Cloudflare Workers
 * Uses @tsndr/cloudflare-worker-jwt for JWT operations
 */

import jwt from '@tsndr/cloudflare-worker-jwt';

/**
 * Generate access token (15 minute expiry)
 * @param {Object} user - User object with id, email, subscription_tier
 * @param {string} secret - JWT secret
 * @returns {Promise<string>} JWT token
 */
export async function generateAccessToken(user, secret) {
  const now = Math.floor(Date.now() / 1000);

  return await jwt.sign({
    sub: user.id,
    email: user.email,
    subscription_tier: user.subscription_tier,
    type: 'access',
    iat: now,
    exp: now + (15 * 60) // 15 minutes
  }, secret);
}

/**
 * Generate refresh token (7 day expiry)
 * @param {Object} user - User object with id
 * @param {string} secret - JWT secret
 * @returns {Promise<string>} JWT token
 */
export async function generateRefreshToken(user, secret) {
  const now = Math.floor(Date.now() / 1000);

  return await jwt.sign({
    sub: user.id,
    type: 'refresh',
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  }, secret);
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret
 * @returns {Promise<Object|null>} Decoded payload or null if invalid
 */
export async function verifyJWT(token, secret) {
  try {
    const isValid = await jwt.verify(token, secret);
    if (!isValid) {
      return null;
    }

    const { payload } = jwt.decode(token);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Decode JWT without verification (use for debugging only)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null
 */
export function decodeJWT(token) {
  try {
    const { payload } = jwt.decode(token);
    return payload;
  } catch (error) {
    return null;
  }
}
