/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */

import { parseCookies } from '../_auth.js';
import { verifyJWT, generateAccessToken } from '../../utils/jwt.js';
import { hashToken } from '../../utils/crypto.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Parse cookies to get refresh token
    const cookieHeader = request.headers.get('Cookie');
    const cookies = parseCookies(cookieHeader);
    const refreshToken = cookies.refresh_token;

    if (!refreshToken) {
      return new Response(
        JSON.stringify({ error: 'No refresh token provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT
    const jwtSecret = env.JWT_SECRET;
    const payload = await verifyJWT(refreshToken, jwtSecret);

    if (!payload || payload.type !== 'refresh') {
      return new Response(
        JSON.stringify({ error: 'Invalid refresh token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is revoked in database
    const tokenHash = await hashToken(refreshToken);
    const storedToken = await env.DB.prepare(
      'SELECT id, user_id, expires_at, revoked FROM refresh_tokens WHERE token_hash = ?'
    ).bind(tokenHash).first();

    if (!storedToken) {
      return new Response(
        JSON.stringify({ error: 'Refresh token not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (storedToken.revoked === 1) {
      return new Response(
        JSON.stringify({ error: 'Refresh token has been revoked' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check expiration
    const now = Date.now();
    if (storedToken.expires_at < now) {
      return new Response(
        JSON.stringify({ error: 'Refresh token has expired' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user details
    const user = await env.DB.prepare(
      'SELECT id, email, subscription_tier FROM users WHERE id = ?'
    ).bind(payload.sub).first();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate new access token
    const userForToken = {
      id: user.id,
      email: user.email,
      subscription_tier: user.subscription_tier
    };

    const newAccessToken = await generateAccessToken(userForToken, jwtSecret);

    // Set new access token cookie
    const cookieOptions = [
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Path=/'
    ];

    const accessCookie = `access_token=${newAccessToken}; ${cookieOptions.join('; ')}; Max-Age=${15 * 60}`;

    return new Response(
      JSON.stringify({ message: 'Token refreshed successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': accessCookie
        }
      }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
