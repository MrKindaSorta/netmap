/**
 * DELETE /api/networks/:id/shares/:shareId
 * Revoke a share (requires network ownership)
 */

import { requireAuth } from '../../../_auth.js';

export async function onRequestDelete(context) {
  const { env, params } = context;
  const networkId = params.id;
  const shareId = params.shareId;

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

    // Delete the share
    const result = await env.DB.prepare(
      'DELETE FROM network_shares WHERE id = ? AND network_id = ?'
    ).bind(shareId, networkId).run();

    if (!result.meta.changes || result.meta.changes === 0) {
      return new Response(
        JSON.stringify({ error: 'Share not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Share revoked successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error revoking share:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to revoke share',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
