/**
 * POST /api/networks/:id/share
 * Share a network with another user via email
 * Requires network ownership
 */

import { requireAuth } from '../../_auth.js';
import { validateEmail, validatePermission } from '../../../utils/validation.js';
import { generateSecureId } from '../../../utils/crypto.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const networkId = params.id;

  // Require authentication
  const authError = await requireAuth(context);
  if (authError) return authError;

  try {
    const userId = context.user.id;
    const body = await request.json();
    const { shareWithEmail, permission } = body;

    // Validate email
    if (!validateEmail(shareWithEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate permission
    if (!validatePermission(permission)) {
      return new Response(
        JSON.stringify({ error: 'Invalid permission. Must be "view" or "edit"' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = shareWithEmail.toLowerCase().trim();

    // Prevent sharing with self
    if (normalizedEmail === context.user.email) {
      return new Response(
        JSON.stringify({ error: 'Cannot share with yourself' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify network ownership
    const network = await env.DB.prepare(
      'SELECT id, name, user_id FROM networks WHERE id = ? AND user_id = ?'
    ).bind(networkId, userId).first();

    if (!network) {
      return new Response(
        JSON.stringify({ error: 'Network not found or access denied' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if already shared with this email
    const existingShare = await env.DB.prepare(
      'SELECT id, permission FROM network_shares WHERE network_id = ? AND shared_with_email = ?'
    ).bind(networkId, normalizedEmail).first();

    if (existingShare) {
      // Update existing share permission
      const now = Date.now();
      await env.DB.prepare(
        'UPDATE network_shares SET permission = ?, updated_at = ? WHERE id = ?'
      ).bind(permission, now, existingShare.id).run();

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Share permission updated',
          share: {
            id: existingShare.id,
            network_id: networkId,
            shared_with_email: normalizedEmail,
            permission: permission,
            updated_at: now
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new share
    const shareId = generateSecureId('share');
    const now = Date.now();

    await env.DB.prepare(
      `INSERT INTO network_shares (id, network_id, shared_with_email, shared_by_user_id, permission, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(shareId, networkId, normalizedEmail, userId, permission, now, now).run();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Network shared successfully',
        share: {
          id: shareId,
          network_id: networkId,
          network_name: network.name,
          shared_with_email: normalizedEmail,
          permission: permission,
          created_at: now
        }
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sharing network:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to share network',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
