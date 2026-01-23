/**
 * GET /api/networks/:id/shares - List all shares for a network
 * DELETE /api/networks/:id/shares/:shareId - Revoke a share
 * Both require network ownership
 */

import { requireAuth } from '../../_auth.js';

/**
 * GET - List all shares for a network
 */
export async function onRequestGet(context) {
  const { env, params } = context;
  const networkId = params.id;

  // Require authentication
  const authError = await requireAuth(context);
  if (authError) return authError;

  try {
    const userId = context.user.id;

    // Verify network ownership
    const network = await env.DB.prepare(
      'SELECT id FROM networks WHERE id = ? AND user_id = ?'
    ).bind(networkId, userId).first();

    if (!network) {
      return new Response(
        JSON.stringify({ error: 'Network not found or access denied' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all shares for this network
    const { results: shares } = await env.DB.prepare(
      `SELECT id, shared_with_email, permission, created_at, updated_at
       FROM network_shares
       WHERE network_id = ?
       ORDER BY created_at DESC`
    ).bind(networkId).all();

    return new Response(
      JSON.stringify({
        shares: shares,
        count: shares.length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error listing shares:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to list shares',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
