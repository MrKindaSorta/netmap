/**
 * POST /api/auth/signup
 * Create new user account
 */

import { hashPassword, generateSecureId, generateSecureToken, hashToken } from '../../utils/crypto.js';
import { validateEmail, validatePassword } from '../../utils/validation.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate email
    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Normalize email (lowercase)
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(normalizedEmail).first();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Email already registered' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate user ID
    const userId = generateSecureId('usr');
    const now = Date.now();

    // Insert user into database
    await env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, created_at, subscription_tier, email_verified)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(userId, normalizedEmail, passwordHash, now, 'free', 0).run();

    // Create user object for JWT
    const user = {
      id: userId,
      email: normalizedEmail,
      subscription_tier: 'free'
    };

    // Generate tokens
    const jwtSecret = env.JWT_SECRET;
    const accessToken = await generateAccessToken(user, jwtSecret);
    const refreshToken = await generateRefreshToken(user, jwtSecret);

    // Store refresh token in database
    const refreshTokenId = generateSecureId('rft');
    const refreshTokenHash = await hashToken(refreshToken);
    const refreshExpiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days

    await env.DB.prepare(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at, revoked)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(refreshTokenId, userId, refreshTokenHash, refreshExpiresAt, now, 0).run();

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
          id: userId,
          email: normalizedEmail,
          subscription_tier: 'free',
          subscription_expires: null
        }
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': accessCookie + ', ' + refreshCookie
        }
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
