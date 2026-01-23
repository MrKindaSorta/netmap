/**
 * POST /api/auth/login
 * Authenticate user and issue tokens
 */

import { verifyPassword, generateSecureId, generateSecureToken, hashToken } from '../../utils/crypto.js';
import { validateEmail } from '../../utils/validation.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.js';
import { checkRateLimit, resetRateLimit, getClientIp } from '../../utils/rateLimit.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Parse request body
    const body = await request.json();
    const { email, password, rememberMe = false } = body;

    // Validate email format
    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting - 5 attempts per 15 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimitKey = `login:${clientIp}`;

    // Check if RATE_LIMIT_KV is available (it's optional for development)
    let rateLimitCheck = { allowed: true };
    if (env.RATE_LIMIT_KV) {
      rateLimitCheck = await checkRateLimit(env.RATE_LIMIT_KV, rateLimitKey, 5, 15 * 60);

      if (!rateLimitCheck.allowed) {
        const waitMinutes = Math.ceil((rateLimitCheck.resetAt - Math.floor(Date.now() / 1000)) / 60);
        return new Response(
          JSON.stringify({
            error: 'Too many login attempts',
            retry_after: waitMinutes
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(waitMinutes * 60)
            }
          }
        );
      }
    }

    // Query user by email
    const user = await env.DB.prepare(
      'SELECT id, email, password_hash, subscription_tier, subscription_expires FROM users WHERE email = ?'
    ).bind(normalizedEmail).first();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Reset rate limit on successful login
    if (env.RATE_LIMIT_KV) {
      await resetRateLimit(env.RATE_LIMIT_KV, rateLimitKey);
    }

    // Update last_login timestamp
    const now = Date.now();
    await env.DB.prepare(
      'UPDATE users SET last_login = ? WHERE id = ?'
    ).bind(now, user.id).run();

    // Generate tokens
    const jwtSecret = env.JWT_SECRET;
    const userForToken = {
      id: user.id,
      email: user.email,
      subscription_tier: user.subscription_tier
    };

    const accessToken = await generateAccessToken(userForToken, jwtSecret);
    const refreshToken = await generateRefreshToken(userForToken, jwtSecret);

    // Store refresh token in database
    const refreshTokenId = generateSecureId('rft');
    const refreshTokenHash = await hashToken(refreshToken);
    const refreshExpiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days

    await env.DB.prepare(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at, revoked)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(refreshTokenId, user.id, refreshTokenHash, refreshExpiresAt, now, 0).run();

    // Set httpOnly cookies
    const cookieOptions = [
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Path=/'
    ];

    const accessCookie = `access_token=${accessToken}; ${cookieOptions.join('; ')}; Max-Age=${15 * 60}`;
    const refreshCookie = `refresh_token=${refreshToken}; ${cookieOptions.join('; ')}; Max-Age=${7 * 24 * 60 * 60}`;

    // Return user object
    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          subscription_tier: user.subscription_tier,
          subscription_expires: user.subscription_expires
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': accessCookie + ', ' + refreshCookie
        }
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
