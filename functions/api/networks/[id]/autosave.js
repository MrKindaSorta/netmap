/**
 * POST /api/networks/:id/autosave
 * Save draft without incrementing version (for auto-save functionality)
 * Requires write permission (owner or edit access)
 */

import { requireAuth, isPremiumUser } from '../../_auth.js';

/**
 * Check if user has write permission (owner or edit)
 */
async function checkWritePermission(db, networkId, userId, userEmail) {
  // Check ownership
  const ownedNetwork = await db.prepare(
    'SELECT id FROM networks WHERE id = ? AND user_id = ?'
  ).bind(networkId, userId).first();

  if (ownedNetwork) {
    return true;
  }

  // Check for edit permission
  const share = await db.prepare(
    'SELECT permission FROM network_shares WHERE network_id = ? AND shared_with_email = ?'
  ).bind(networkId, userEmail).first();

  return share && share.permission === 'edit';
}

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const networkId = params.id;

  // Require authentication
  const authError = await requireAuth(context);
  if (authError) return authError;

  try {
    const userId = context.user.id;
    const userEmail = context.user.email;
    const isPremium = isPremiumUser(context.user);

    if (!isPremium) {
      return new Response(
        JSON.stringify({
          error: 'Premium subscription required',
          upgrade_required: true
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check write permission
    const hasWriteAccess = await checkWritePermission(env.DB, networkId, userId, userEmail);
    if (!hasWriteAccess) {
      return new Response(
        JSON.stringify({ error: 'Access denied or network not found' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { data } = body;

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Network data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get current version
    const network = await env.DB.prepare(
      'SELECT id, version FROM networks WHERE id = ?'
    ).bind(networkId).first();

    if (!network) {
      return new Response(
        JSON.stringify({ error: 'Network not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save draft to autosave key in KV
    const autosaveKvKey = `network:${networkId}:autosave`;
    await env.NETWORK_STORE.put(autosaveKvKey, JSON.stringify(data));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Draft saved',
        version: network.version, // Return current version (not incremented)
        saved_at: Date.now()
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving draft:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to save draft',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
