/**
 * GET /api/auth/me
 * Get current authenticated user
 */

import { requireAuth } from '../_auth.js';

export async function onRequestGet(context) {
  const { env } = context;

  // Require authentication
  const authError = await requireAuth(context);
  if (authError) return authError;

  try {
    // Get full user details from database
    const user = await env.DB.prepare(
      'SELECT id, email, subscription_tier, subscription_expires, created_at, last_login, email_verified FROM users WHERE id = ?'
    ).bind(context.user.id).first();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          subscription_tier: user.subscription_tier,
          subscription_expires: user.subscription_expires,
          created_at: user.created_at,
          last_login: user.last_login,
          email_verified: user.email_verified === 1
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
