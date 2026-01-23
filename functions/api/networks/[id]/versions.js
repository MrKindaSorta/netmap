/**
 * Version History API
 * GET /api/networks/:id/versions - List all versions
 * GET /api/networks/:id/versions/:version - Load specific version
 */

/**
 * GET - List all versions or load specific version
 */
export async function onRequestGet(context) {
  const { request, env, params } = context;
  const networkId = params.id;
  const url = new URL(request.url);
  const version = url.searchParams.get('version');

  try {
    const userId = request.headers.get('X-User-Id') || 'anonymous';

    // Premium feature check
    const isPremium = await checkUserSubscription(env.DB, userId);
    if (!isPremium) {
      return premiumRequiredResponse();
    }

    // Verify network ownership
    const { results: networkResults } = await env.DB.prepare(
      'SELECT id FROM networks WHERE id = ? AND user_id = ?'
    ).bind(networkId, userId).all();

    if (networkResults.length === 0) {
      return new Response(JSON.stringify({
        error: 'Network not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If specific version requested, load it
    if (version) {
      const versionNum = parseInt(version, 10);

      const { results: versionResults } = await env.DB.prepare(
        'SELECT * FROM network_versions WHERE network_id = ? AND version = ?'
      ).bind(networkId, versionNum).all();

      if (versionResults.length === 0) {
        return new Response(JSON.stringify({
          error: 'Version not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const versionMeta = versionResults[0];

      // Load version data from KV
      const versionData = await env.NETWORK_STORE.get(versionMeta.kv_key, 'json');

      if (!versionData) {
        return new Response(JSON.stringify({
          error: 'Version data not found in storage'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        metadata: versionMeta,
        data: versionData
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // List all versions
    const { results: versions } = await env.DB.prepare(
      'SELECT id, version, created_at, changelog FROM network_versions WHERE network_id = ? ORDER BY version DESC LIMIT 10'
    ).bind(networkId).all();

    return new Response(JSON.stringify({
      networkId: networkId,
      versions: versions,
      count: versions.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error accessing version history:', error);
    return new Response(JSON.stringify({
      error: 'Failed to access version history',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Utility functions
 */

async function checkUserSubscription(db, userId) {
  if (userId === 'anonymous') {
    return false;
  }

  try {
    const { results } = await db.prepare(
      'SELECT subscription_tier, subscription_expires FROM users WHERE id = ?'
    ).bind(userId).all();

    if (results.length === 0) {
      return false;
    }

    const user = results[0];

    if (user.subscription_tier === 'premium') {
      if (!user.subscription_expires) {
        return true;
      }
      return user.subscription_expires > Date.now();
    }

    return false;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

function premiumRequiredResponse() {
  return new Response(JSON.stringify({
    error: 'Premium subscription required',
    message: 'Upgrade to Premium to access cloud storage features'
  }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}
