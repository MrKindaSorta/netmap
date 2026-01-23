/**
 * UserSettingsPanel Component
 * Central place for account management and network administration
 */

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useStorage } from '../../contexts/StorageContext';

const Icon = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function UserSettingsPanel({ onClose, theme, onOpenShareModal }) {
  const { user } = useAuth();
  const { networks, listShares, revokeShare } = useStorage();
  const [activeTab, setActiveTab] = useState('account'); // account, my-networks, shared-with-me
  const [networkShares, setNetworkShares] = useState({});
  const [loadingShares, setLoadingShares] = useState({});

  // Separate owned and shared networks
  const ownedNetworks = networks.filter(n => n.access_type === 'owner');
  const sharedWithMe = networks.filter(n => n.access_type === 'view' || n.access_type === 'edit');

  // Load shares for a network
  const loadNetworkShares = async (networkId) => {
    if (networkShares[networkId] || loadingShares[networkId]) return;

    setLoadingShares(prev => ({ ...prev, [networkId]: true }));
    try {
      const shares = await listShares(networkId);
      setNetworkShares(prev => ({ ...prev, [networkId]: shares }));
    } catch (error) {
      console.error('Failed to load shares:', error);
    } finally {
      setLoadingShares(prev => ({ ...prev, [networkId]: false }));
    }
  };

  // Revoke a share
  const handleRevokeShare = async (networkId, shareId) => {
    if (!confirm('Revoke this share? The user will lose access immediately.')) {
      return;
    }

    try {
      await revokeShare(networkId, shareId);
      // Reload shares
      setNetworkShares(prev => ({ ...prev, [networkId]: undefined }));
      await loadNetworkShares(networkId);
    } catch (error) {
      console.error('Failed to revoke share:', error);
      alert('Failed to revoke share. Please try again.');
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
    { id: 'my-networks', label: 'My Networks', icon: 'M3 15a9 9 0 0118 0M12 20l-3-3m6 0l-3 3' },
    { id: 'shared-with-me', label: 'Shared With Me', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' }
  ];

  return (
    <Modal
      title="Settings"
      onClose={onClose}
      theme={theme}
      size="lg"
      showCloseButton={true}
    >
      <div className="flex h-96">
        {/* Sidebar */}
        <div className="w-48 border-r flex flex-col" style={{ borderColor: theme.border }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors"
              style={{
                background: activeTab === tab.id ? theme.hover : 'transparent',
                color: activeTab === tab.id ? theme.text : theme.textSecondary
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = theme.bg;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon d={tab.icon} s={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                      Email
                    </label>
                    <div className="mt-1 text-sm" style={{ color: theme.text }}>
                      {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                      Subscription
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      {user?.subscription_tier === 'premium' ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          ⭐ Premium
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: theme.bg, color: theme.textSecondary }}>
                          Free Tier
                        </span>
                      )}
                      {user?.subscription_tier === 'free' && (
                        <button
                          onClick={() => {
                            onClose();
                            // Trigger upgrade modal
                            const event = new CustomEvent('openUpgradeModal');
                            window.dispatchEvent(event);
                          }}
                          className="px-3 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Upgrade to Premium
                        </button>
                      )}
                    </div>
                  </div>
                  {user?.subscription_expires && (
                    <div>
                      <label className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                        Expires
                      </label>
                      <div className="mt-1 text-sm" style={{ color: theme.text }}>
                        {new Date(user.subscription_expires).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t" style={{ borderColor: theme.border }}>
                <h3 className="text-sm font-semibold mb-2" style={{ color: theme.text }}>
                  Features
                </h3>
                <div className="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
                  {user?.subscription_tier === 'premium' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Unlimited cloud storage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Network sharing & collaboration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Version history</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Auto-save</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span style={{ color: theme.textSecondary }}>○</span>
                        <span>Local import/export only</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ color: theme.textSecondary }}>○</span>
                        <span>No cloud storage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ color: theme.textSecondary }}>○</span>
                        <span>No sharing features</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* My Networks Tab */}
          {activeTab === 'my-networks' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>
                My Networks
              </h3>
              {ownedNetworks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📁</div>
                  <div className="text-sm font-medium mb-1" style={{ color: theme.text }}>
                    No networks yet
                  </div>
                  <div className="text-xs" style={{ color: theme.textSecondary }}>
                    Create a network to get started
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {ownedNetworks.map(network => {
                    const shares = networkShares[network.id] || [];
                    const isExpanded = !!networkShares[network.id];

                    return (
                      <div
                        key={network.id}
                        className="border rounded-lg p-4"
                        style={{ borderColor: theme.border }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium mb-1" style={{ color: theme.text }}>
                              {network.name}
                            </div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>
                              v{network.version} • Updated {new Date(network.updated_at).toLocaleDateString()}
                            </div>
                            {isExpanded && shares.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {shares.map(share => (
                                  <div
                                    key={share.id}
                                    className="flex items-center justify-between text-xs p-2 rounded"
                                    style={{ background: theme.bg }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{share.permission === 'view' ? '👁' : '✏️'}</span>
                                      <span style={{ color: theme.text }}>{share.shared_with_email}</span>
                                      <span className="px-1.5 py-0.5 rounded" style={{ background: theme.border, color: theme.textSecondary }}>
                                        {share.permission}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleRevokeShare(network.id, share.id)}
                                      className="px-2 py-1 rounded text-xs text-red-600 hover:bg-red-50"
                                    >
                                      Revoke
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (onOpenShareModal) {
                                  onOpenShareModal(network.id);
                                  onClose();
                                }
                              }}
                              className="px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Share
                            </button>
                            <button
                              onClick={() => {
                                if (isExpanded) {
                                  setNetworkShares(prev => ({ ...prev, [network.id]: undefined }));
                                } else {
                                  loadNetworkShares(network.id);
                                }
                              }}
                              className="px-3 py-1.5 rounded text-xs font-medium"
                              style={{ background: theme.bg, color: theme.text }}
                            >
                              {loadingShares[network.id] ? 'Loading...' : isExpanded ? 'Hide' : `${shares.length || ''} Shares`}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Shared With Me Tab */}
          {activeTab === 'shared-with-me' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>
                Shared With Me
              </h3>
              {sharedWithMe.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📬</div>
                  <div className="text-sm font-medium mb-1" style={{ color: theme.text }}>
                    No shared networks
                  </div>
                  <div className="text-xs" style={{ color: theme.textSecondary }}>
                    Networks shared with you will appear here
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {sharedWithMe.map(network => (
                    <div
                      key={network.id}
                      className="border rounded-lg p-4"
                      style={{ borderColor: theme.border }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {network.access_type === 'view' ? '👁' : '✏️'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium mb-1" style={{ color: theme.text }}>
                            {network.name}
                          </div>
                          <div className="text-xs mb-2" style={{ color: theme.textSecondary }}>
                            Shared by {network.owner_email}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: theme.bg, color: theme.text }}>
                              {network.access_type === 'view' ? 'View Only' : 'Can Edit'}
                            </span>
                            <span className="text-xs" style={{ color: theme.textSecondary }}>
                              v{network.version}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
