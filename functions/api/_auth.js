/**
 * Authentication middleware for Cloudflare Pages Functions
 * Provides JWT-based authentication utilities
 */

import { verifyJWT } from '../utils/jwt.js';

/**
 * Parse cookies from Cookie header
 * @param {string} cookieHeader - Cookie header string
 * @returns {Object} Parsed cookies as key-value pairs
 */
export function parseCookies(cookieHeader) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(';')
    .map(cookie => cookie.trim().split('='))
    .reduce((acc, [key, value]) => {
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {});
}

/**
 * Create unauthorized response
 * @param {string} message - Error message
 * @returns {Response} 401 Unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
}

/**
 * Create forbidden response
 * @param {string} message - Error message
 * @returns {Response} 403 Forbidden response
 */
export function forbiddenResponse(message = 'Forbidden') {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
}

/**
 * Require authentication for a request
 * Extracts and verifies JWT from cookie, attaches user to context
 *
 * Usage:
 * export async function onRequestGet(context) {
 *   const authError = await requireAuth(context);
 *   if (authError) return authError;
 *
 *   // context.user is now available: { id, email, subscription_tier }
 * }
 *
 * @param {Object} context - Cloudflare Pages Functions context
 * @returns {Promise<Response|null>} Error response or null if authenticated
 */
export async function requireAuth(context) {
  const { request, env } = context;

  try {
    // Parse cookies
    const cookieHeader = request.headers.get('Cookie');
    const cookies = parseCookies(cookieHeader);

    // Get access token
    const accessToken = cookies.access_token;
    if (!accessToken) {
      return unauthorizedResponse('No access token provided');
    }

    // Verify JWT
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return new Response('Internal server error', { status: 500 });
    }

    const payload = await verifyJWT(accessToken, jwtSecret);
    if (!payload) {
      return unauthorizedResponse('Invalid or expired token');
    }

    // Check token type
    if (payload.type !== 'access') {
      return unauthorizedResponse('Invalid token type');
    }

    // Attach user to context
    context.user = {
      id: payload.sub,
      email: payload.email,
      subscription_tier: payload.subscription_tier
    };

    return null; // Authentication successful
  } catch (error) {
    console.error('Authentication error:', error);
    return unauthorizedResponse('Authentication failed');
  }
}

/**
 * Optional authentication - doesn't fail if no token present
 * Attaches user to context if valid token exists
 *
 * @param {Object} context - Cloudflare Pages Functions context
 * @returns {Promise<void>}
 */
export async function optionalAuth(context) {
  const { request, env } = context;

  try {
    const cookieHeader = request.headers.get('Cookie');
    const cookies = parseCookies(cookieHeader);
    const accessToken = cookies.access_token;

    if (!accessToken) {
      context.user = null;
      return;
    }

    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      context.user = null;
      return;
    }

    const payload = await verifyJWT(accessToken, jwtSecret);
    if (payload && payload.type === 'access') {
      context.user = {
        id: payload.sub,
        email: payload.email,
        subscription_tier: payload.subscription_tier
      };
    } else {
      context.user = null;
    }
  } catch (error) {
    console.error('Optional auth error:', error);
    context.user = null;
  }
}

/**
 * Check if user has premium subscription
 * @param {Object} user - User object from context
 * @returns {boolean} True if user has premium access
 */
export function isPremiumUser(user) {
  if (!user || !user.subscription_tier) {
    return false;
  }

  return user.subscription_tier === 'premium';
}

/**
 * Require premium subscription
 * @param {Object} user - User object from context
 * @returns {Response|null} Error response or null if premium
 */
export function requirePremium(user) {
  if (!isPremiumUser(user)) {
    return new Response(
      JSON.stringify({
        error: 'Premium subscription required',
        upgrade_required: true
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  return null;
}
