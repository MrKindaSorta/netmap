/**
 * ShareNetworkModal Component
 * UI for sharing networks with other users via email
 */

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useStorage } from '../../contexts/StorageContext';

const Icon = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function ShareNetworkModal({ networkId, networkName, onClose, theme }) {
  const { shareNetwork, listShares, revokeShare } = useStorage();
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load existing shares
  useEffect(() => {
    loadShares();
  }, [networkId]);

  const loadShares = async () => {
    setLoading(true);
    try {
      const result = await listShares(networkId);
      setShares(result);
    } catch (err) {
      console.error('Failed to load shares:', err);
      setError('Failed to load shares');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSharing(true);
    try {
      await shareNetwork(networkId, email, permission);
      setSuccess(`Shared with ${email}`);
      setEmail('');
      // Reload shares
      await loadShares();
    } catch (err) {
      console.error('Failed to share network:', err);
      setError(err.message || 'Failed to share network');
    } finally {
      setSharing(false);
    }
  };

  const handleRevoke = async (shareId, sharedEmail) => {
    if (!confirm(`Revoke access for ${sharedEmail}?`)) {
      return;
    }

    try {
      await revokeShare(networkId, shareId);
      setSuccess(`Revoked access for ${sharedEmail}`);
      // Reload shares
      await loadShares();
    } catch (err) {
      console.error('Failed to revoke share:', err);
      setError('Failed to revoke share');
    }
  };

  return (
    <Modal
      title={`Share "${networkName}"`}
      onClose={onClose}
      theme={theme}
      size="md"
      showCloseButton={true}
    >
      <div className="p-6 space-y-6">
        {/* Share Form */}
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Share with
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{
                background: theme.inputBg || theme.bg,
                borderColor: theme.border,
                color: theme.text
              }}
              disabled={sharing}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Permission
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="permission"
                  value="view"
                  checked={permission === 'view'}
                  onChange={(e) => setPermission(e.target.value)}
                  className="w-4 h-4"
                  disabled={sharing}
                />
                <div>
                  <div className="text-sm font-medium" style={{ color: theme.text }}>
                    👁 View Only
                  </div>
                  <div className="text-xs" style={{ color: theme.textSecondary }}>
                    Can view and export
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="permission"
                  value="edit"
                  checked={permission === 'edit'}
                  onChange={(e) => setPermission(e.target.value)}
                  className="w-4 h-4"
                  disabled={sharing}
                />
                <div>
                  <div className="text-sm font-medium" style={{ color: theme.text }}>
                    ✏️ Can Edit
                  </div>
                  <div className="text-xs" style={{ color: theme.textSecondary }}>
                    Can view and modify
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={sharing || !email}
            className="w-full py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sharing ? 'Sharing...' : 'Send Invitation'}
          </button>
        </form>

        {/* Success/Error Messages */}
        {success && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              background: '#d1fae5',
              color: '#065f46',
              border: '1px solid #10b981'
            }}
          >
            {success}
          </div>
        )}
        {error && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              background: `${theme.error || '#ef4444'}10`,
              color: theme.error || '#ef4444',
              border: `1px solid ${theme.error || '#ef4444'}30`
            }}
          >
            {error}
          </div>
        )}

        {/* Current Shares */}
        <div className="border-t pt-6" style={{ borderColor: theme.border }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: theme.text }}>
            Currently Shared With
          </h4>

          {loading ? (
            <div className="text-center py-4 text-sm" style={{ color: theme.textSecondary }}>
              Loading shares...
            </div>
          ) : shares.length === 0 ? (
            <div className="text-center py-4 text-sm" style={{ color: theme.textSecondary }}>
              Not shared with anyone yet
            </div>
          ) : (
            <div className="space-y-2">
              {shares.map(share => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderColor: theme.border, background: theme.bg }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {share.permission === 'view' ? '👁' : '✏️'}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: theme.text }}>
                        {share.shared_with_email}
                      </div>
                      <div className="text-xs" style={{ color: theme.textSecondary }}>
                        {share.permission === 'view' ? 'View Only' : 'Can Edit'} •
                        Added {new Date(share.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(share.id, share.shared_with_email)}
                    className="px-3 py-1.5 rounded text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Icon d="M6 18L18 6M6 6l12 12" s={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
