/**
 * POST /api/networks/create
 * Create a new network
 */

import { requireAuth, isPremiumUser } from '../_auth.js';
import { generateSecureId } from '../../utils/crypto.js';
import { validateNetworkName } from '../../utils/validation.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  // Require authentication
  const authError = await requireAuth(context);
  if (authError) return authError;

  try {
    const userId = context.user.id;
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

    const body = await request.json();
    const { name, description, data } = body;

    // Validate network name
    const nameValidation = validateNetworkName(name);
    if (!nameValidation.valid) {
      return new Response(
        JSON.stringify({ error: nameValidation.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Network data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate network ID
    const networkId = generateSecureId('net');
    const kvKey = `network:${networkId}:current`;
    const timestamp = Date.now();

    // Store network data in KV
    await env.NETWORK_STORE.put(kvKey, JSON.stringify(data));

    // Store network metadata in D1
    await env.DB.prepare(
      `INSERT INTO networks (id, user_id, name, description, created_at, updated_at, version, kv_key, is_cloud_stored)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      networkId,
      userId,
      name.trim(),
      description?.trim() || null,
      timestamp,
      timestamp,
      1,
      kvKey,
      1
    ).run();

    return new Response(
      JSON.stringify({
        success: true,
        network: {
          id: networkId,
          name: name.trim(),
          description: description?.trim() || null,
          version: 1,
          created_at: timestamp
        }
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating network:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create network',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
