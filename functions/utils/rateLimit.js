/**
 * Rate limiting utilities using Cloudflare KV
 */

/**
 * Check rate limit for a given key
 * @param {KVNamespace} kv - Cloudflare KV namespace
 * @param {string} key - Rate limit key (e.g., 'login:ip:1.2.3.4')
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowSeconds - Time window in seconds
 * @returns {Promise<Object>} { allowed: boolean, remaining: number, resetAt: number }
 */
export async function checkRateLimit(kv, key, maxAttempts, windowSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const rateLimitKey = `ratelimit:${key}`;

  try {
    // Get current rate limit data
    const data = await kv.get(rateLimitKey, { type: 'json' });

    if (!data) {
      // First attempt - create new rate limit entry
      await kv.put(
        rateLimitKey,
        JSON.stringify({
          attempts: 1,
          resetAt: now + windowSeconds
        }),
        { expirationTtl: windowSeconds }
      );

      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt: now + windowSeconds
      };
    }

    // Check if window has expired
    if (now >= data.resetAt) {
      // Reset the counter
      await kv.put(
        rateLimitKey,
        JSON.stringify({
          attempts: 1,
          resetAt: now + windowSeconds
        }),
        { expirationTtl: windowSeconds }
      );

      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt: now + windowSeconds
      };
    }

    // Check if limit exceeded
    if (data.attempts >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: data.resetAt
      };
    }

    // Increment attempts
    await kv.put(
      rateLimitKey,
      JSON.stringify({
        attempts: data.attempts + 1,
        resetAt: data.resetAt
      }),
      { expirationTtl: data.resetAt - now }
    );

    return {
      allowed: true,
      remaining: maxAttempts - (data.attempts + 1),
      resetAt: data.resetAt
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: maxAttempts,
      resetAt: now + windowSeconds
    };
  }
}

/**
 * Reset rate limit for a key (e.g., after successful login)
 * @param {KVNamespace} kv - Cloudflare KV namespace
 * @param {string} key - Rate limit key
 * @returns {Promise<void>}
 */
export async function resetRateLimit(kv, key) {
  const rateLimitKey = `ratelimit:${key}`;
  try {
    await kv.delete(rateLimitKey);
  } catch (error) {
    console.error('Rate limit reset error:', error);
  }
}

/**
 * Get client IP from request
 * @param {Request} request - Request object
 * @returns {string} Client IP address
 */
export function getClientIp(request) {
  // Try to get real IP from Cloudflare headers
  const cfConnectingIp = request.headers.get('CF-Connecting-IP');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to X-Forwarded-For
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  // Fallback to X-Real-IP
  const xRealIp = request.headers.get('X-Real-IP');
  if (xRealIp) {
    return xRealIp;
  }

  // Last resort
  return 'unknown';
}
