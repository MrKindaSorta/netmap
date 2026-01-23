/**
 * POST /api/auth/logout
 * Logout user and revoke refresh token
 */

import { parseCookies } from '../_auth.js';
import { hashToken } from '../../utils/crypto.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Parse cookies to get refresh token
    const cookieHeader = request.headers.get('Cookie');
    const cookies = parseCookies(cookieHeader);
    const refreshToken = cookies.refresh_token;

    // If refresh token exists, revoke it in database
    if (refreshToken) {
      try {
        const tokenHash = await hashToken(refreshToken);

        await env.DB.prepare(
          'UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?'
        ).bind(tokenHash).run();
      } catch (error) {
        console.error('Error revoking refresh token:', error);
        // Continue with logout even if revocation fails
      }
    }

    // Clear cookies by setting Max-Age=0
    const clearCookieOptions = [
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Path=/',
      'Max-Age=0'
    ];

    const clearAccessCookie = `access_token=; ${clearCookieOptions.join('; ')}`;
    const clearRefreshCookie = `refresh_token=; ${clearCookieOptions.join('; ')}`;

    return new Response(
      JSON.stringify({ message: 'Logged out successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearAccessCookie + ', ' + clearRefreshCookie
        }
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
