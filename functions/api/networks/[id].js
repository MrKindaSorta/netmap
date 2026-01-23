/**
 * Network CRUD operations with permission checking
 * GET /api/networks/:id - Load network (requires read permission)
 * PUT /api/networks/:id - Update network (requires write permission)
 * DELETE /api/networks/:id - Delete network (requires owner permission)
 */

import { requireAuth, isPremiumUser } from '../_auth.js';

/**
 * Check network permission for user
 * @returns {Object} { allowed: boolean, isOwner: boolean, permission: string }
 */
async function checkNetworkPermission(db, networkId, userId, userEmail, requiredAction) {
  // Check ownership
  const ownedNetwork = await db.prepare(
    'SELECT id, user_id FROM networks WHERE id = ? AND user_id = ?'
  ).bind(networkId, userId).first();

  if (ownedNetwork) {
    return { allowed: true, isOwner: true, permission: 'owner' };
  }

  // Check shares
  const share = await db.prepare(
    'SELECT permission FROM network_shares WHERE network_id = ? AND shared_with_email = ?'
  ).bind(networkId, userEmail).first();

  if (!share) {
    return { allowed: false, isOwner: false, permission: null };
  }

  // 'view' allows GET (read)
  if (requiredAction === 'read') {
    return { allowed: true, isOwner: false, permission: share.permission };
  }

  // 'edit' allows GET + PUT (read + write)
  if (requiredAction === 'write' && share.permission === 'edit') {
    return { allowed: true, isOwner: false, permission: 'edit' };
  }

  // Only owner can DELETE
  return { allowed: false, isOwner: false, permission: share.permission };
}

/**
 * GET - Load a network
 */
export async function onRequestGet(context) {
  const { env, params } = context;
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

    // Check permission (read)
    const permission = await checkNetworkPermission(env.DB, networkId, userId, userEmail, 'read');
    if (!permission.allowed) {
      return new Response(
        JSON.stringify({ error: 'Network not found or access denied' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get network metadata
    const network = await env.DB.prepare(
      'SELECT * FROM networks WHERE id = ?'
    ).bind(networkId).first();

    if (!network) {
      return new Response(
        JSON.stringify({ error: 'Network not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Load network data from KV
    const networkData = await env.NETWORK_STORE.get(network.kv_key, 'json');

    if (!networkData) {
      return new Response(
        JSON.stringify({ error: 'Network data not found in storage' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        ...network,
        data: networkData,
        permission: permission.permission // Include permission level
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error loading network:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to load network',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * PUT - Update a network
 */
export async function onRequestPut(context) {
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

    // Check permission (write)
    const permission = await checkNetworkPermission(env.DB, networkId, userId, userEmail, 'write');
    if (!permission.allowed) {
      return new Response(
        JSON.stringify({ error: 'Access denied or network not found' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { data, expectedVersion, changelog } = body;

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Network data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get current network metadata
    const network = await env.DB.prepare(
      'SELECT * FROM networks WHERE id = ?'
    ).bind(networkId).first();

    if (!network) {
      return new Response(
        JSON.stringify({ error: 'Network not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Optimistic locking - check version
    if (expectedVersion !== undefined && network.version !== expectedVersion) {
      return new Response(
        JSON.stringify({
          error: 'Version conflict',
          message: 'Network was modified by another client. Please reload and try again.',
          currentVersion: network.version,
          expectedVersion: expectedVersion
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create version snapshot (archive old version)
    const oldKvKey = network.kv_key;
    const versionKvKey = `network:${networkId}:version:${network.version}`;

    // Copy current version to version history in KV
    const currentData = await env.NETWORK_STORE.get(oldKvKey, 'json');
    if (currentData) {
      await env.NETWORK_STORE.put(versionKvKey, JSON.stringify(currentData));

      // Record version in D1
      await env.DB.prepare(
        'INSERT INTO network_versions (network_id, version, kv_key, created_at, changelog) VALUES (?, ?, ?, ?, ?)'
      ).bind(networkId, network.version, versionKvKey, Date.now(), changelog || null).run();
    }

    // Update network data in KV
    const newKvKey = `network:${networkId}:current`;
    await env.NETWORK_STORE.put(newKvKey, JSON.stringify(data));

    // Update metadata in D1
    const newVersion = network.version + 1;
    const now = Date.now();
    await env.DB.prepare(
      'UPDATE networks SET updated_at = ?, version = ?, kv_key = ? WHERE id = ?'
    ).bind(now, newVersion, newKvKey, networkId).run();

    return new Response(
      JSON.stringify({
        success: true,
        version: newVersion,
        updated_at: now
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating network:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to update network',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * DELETE - Delete a network (owner only)
 */
export async function onRequestDelete(context) {
  const { env, params } = context;
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

    // Check ownership (only owner can delete)
    const network = await env.DB.prepare(
      'SELECT * FROM networks WHERE id = ? AND user_id = ?'
    ).bind(networkId, userId).first();

    if (!network) {
      return new Response(
        JSON.stringify({ error: 'Network not found or access denied' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete from KV
    await env.NETWORK_STORE.delete(network.kv_key);

    // Delete version history from KV
    const { results: versions } = await env.DB.prepare(
      'SELECT kv_key FROM network_versions WHERE network_id = ?'
    ).bind(networkId).all();

    for (const version of versions) {
      await env.NETWORK_STORE.delete(version.kv_key);
    }

    // Delete from D1 (cascade will delete versions and shares)
    await env.DB.prepare(
      'DELETE FROM networks WHERE id = ? AND user_id = ?'
    ).bind(networkId, userId).run();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Network deleted successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting network:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to delete network',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
