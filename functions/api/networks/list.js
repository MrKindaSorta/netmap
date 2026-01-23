/**
 * GET /api/networks/list
 * Lists all networks for the authenticated user (owned and shared)
 *
 * Returns: Array of network metadata with access type
 */

import { requireAuth, isPremiumUser } from '../_auth.js';

export async function onRequestGet(context) {
  const { env } = context;

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
          error: 'Premium subscription required for cloud storage',
          upgrade_required: true
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Query both owned and shared networks
    // UNION to combine owned networks and shared networks
    const { results } = await env.DB.prepare(`
      SELECT DISTINCT
        n.id,
        n.name,
        n.description,
        n.created_at,
        n.updated_at,
        n.version,
        'owner' as access_type,
        u.email as owner_email
      FROM networks n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.user_id = ?

      UNION

      SELECT DISTINCT
        n.id,
        n.name,
        n.description,
        n.created_at,
        n.updated_at,
        n.version,
        ns.permission as access_type,
        u.email as owner_email
      FROM networks n
      INNER JOIN network_shares ns ON n.id = ns.network_id
      LEFT JOIN users u ON n.user_id = u.id
      WHERE ns.shared_with_email = ?

      ORDER BY updated_at DESC
    `).bind(userId, userEmail).all();

    return new Response(
      JSON.stringify({
        networks: results,
        count: results.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error listing networks:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to list networks',
        message: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
