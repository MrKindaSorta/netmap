import React, { useState, useEffect } from 'react';
import { useStorage } from '../../contexts/StorageContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * NetworkSelector - Dropdown for switching between networks
 * Supports owned and shared networks with permission indicators
 */

const Icon = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const NetworkSelector = ({ theme, onLoadNetwork, currentData, hasUnsavedChanges }) => {
  const { user } = useAuth();
  const {
    networks,
    currentNetwork,
    isPremium,
    listNetworks,
    loadNetwork,
    createNetwork,
    deleteNetwork
  } = useStorage();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newNetworkName, setNewNetworkName] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (isPremium) {
      listNetworks();
    }
  }, [isPremium, listNetworks]);

  // Separate owned and shared networks
  const ownedNetworks = networks.filter(n => n.access_type === 'owner');
  const sharedNetworks = networks.filter(n => n.access_type === 'view' || n.access_type === 'edit');

  const handleCreateNetwork = async () => {
    if (!newNetworkName.trim()) return;

    try {
      const result = await createNetwork(
        newNetworkName,
        '',
        currentData || { devices: {}, connections: {}, vlans: {}, buildings: {} }
      );

      setNewNetworkName('');
      setIsCreating(false);
      setIsOpen(false);

      // Load the newly created network
      if (onLoadNetwork) {
        const data = await loadNetwork(result.id);
        onLoadNetwork(data, result.id);
      }
    } catch (error) {
      if (error.message === 'UPGRADE_REQUIRED' || error.message.includes('Premium')) {
        setShowUpgrade(true);
      }
      console.error('Failed to create network:', error);
    }
  };

  const handleSelectNetwork = async (networkId) => {
    // Check for unsaved changes
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Switch networks anyway?')) {
        return;
      }
    }

    try {
      const data = await loadNetwork(networkId);
      setIsOpen(false);

      if (onLoadNetwork) {
        onLoadNetwork(data, networkId);
      }
    } catch (error) {
      console.error('Failed to load network:', error);
      alert('Failed to load network. Please try again.');
    }
  };

  const handleDeleteNetwork = async (networkId, e) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this network? This cannot be undone.')) {
      return;
    }

    try {
      await deleteNetwork(networkId);
      // Network list will auto-refresh via useEffect
    } catch (error) {
      console.error('Failed to delete network:', error);
      alert('Failed to delete network. Please try again.');
    }
  };

  // Show upgrade prompt for free users
  if (!isPremium && showUpgrade) {
    return (
      <div className="relative">
        <div className="absolute top-12 left-0 z-50 w-80 rounded-lg shadow-xl p-4" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl">⭐</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2" style={{ color: theme.text }}>Upgrade to Premium</h3>
              <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>
                Cloud storage requires a Premium subscription. Get auto-save, version history, and multi-device sync.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => alert('Contact your administrator to upgrade to Premium.')}
                  className="px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  Learn More
                </button>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="px-3 py-1.5 rounded text-xs font-medium"
                  style={{ background: theme.bg, color: theme.text }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Free user - show cloud storage disabled
  if (!isPremium) {
    return (
      <button
        onClick={() => setShowUpgrade(true)}
        className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2"
        style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.textSecondary }}
        title="Upgrade to Premium for cloud storage"
      >
        <Icon d="M3 15a9 9 0 0118 0M12 20l-3-3m6 0l-3 3" s={14} />
        <span>Cloud Storage</span>
      </button>
    );
  }

  // Premium user - show network selector
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2"
        style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}
        title={currentNetwork ? `Current: ${currentNetwork.name} (${currentNetwork.permission})` : 'Select Network'}
      >
        <Icon d="M3 15a9 9 0 0118 0M12 20l-3-3m6 0l-3 3" s={14} />
        <span className="max-w-32 truncate">
          {currentNetwork ? currentNetwork.name : 'Select Network'}
        </span>
        {currentNetwork && currentNetwork.permission === 'view' && (
          <span title="View Only">👁</span>
        )}
        {currentNetwork && currentNetwork.permission === 'edit' && (
          <span title="Can Edit">✏️</span>
        )}
        <Icon d="M19 9l-7 7-7-7" s={12} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-12 left-0 z-50 w-80 rounded-lg shadow-xl" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            {/* My Networks */}
            {ownedNetworks.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold" style={{ color: theme.textSecondary, background: theme.bg }}>
                  My Networks
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {ownedNetworks.map(network => (
                    <div
                      key={network.id}
                      onClick={() => handleSelectNetwork(network.id)}
                      className="px-4 py-2.5 flex items-center justify-between cursor-pointer"
                      style={{
                        background: currentNetwork?.id === network.id ? theme.hover : 'transparent',
                        color: theme.text
                      }}
                      onMouseEnter={(e) => {
                        if (currentNetwork?.id !== network.id) {
                          e.currentTarget.style.background = theme.hover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentNetwork?.id !== network.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium flex items-center gap-2">
                          {currentNetwork?.id === network.id && <span className="text-blue-500">✓</span>}
                          <span className="truncate">{network.name}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                          v{network.version} • {new Date(network.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteNetwork(network.id, e)}
                        className="p-1.5 rounded hover:bg-red-500 hover:text-white ml-2"
                        title="Delete network"
                      >
                        <Icon d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" s={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Shared With Me */}
            {sharedNetworks.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold border-t" style={{ color: theme.textSecondary, background: theme.bg, borderColor: theme.border }}>
                  Shared With Me
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {sharedNetworks.map(network => (
                    <div
                      key={network.id}
                      onClick={() => handleSelectNetwork(network.id)}
                      className="px-4 py-2.5 flex items-center gap-2 cursor-pointer"
                      style={{
                        background: currentNetwork?.id === network.id ? theme.hover : 'transparent',
                        color: theme.text
                      }}
                      onMouseEnter={(e) => {
                        if (currentNetwork?.id !== network.id) {
                          e.currentTarget.style.background = theme.hover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentNetwork?.id !== network.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {/* Permission Icon */}
                      <div className="text-lg" title={network.access_type === 'view' ? 'View Only' : 'Can Edit'}>
                        {network.access_type === 'view' ? '👁' : '✏️'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium flex items-center gap-2">
                          {currentNetwork?.id === network.id && <span className="text-blue-500">✓</span>}
                          <span className="truncate">{network.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: theme.bg, color: theme.textSecondary }}>
                            {network.access_type}
                          </span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                          Shared by {network.owner_email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Empty State */}
            {networks.length === 0 && (
              <div className="px-4 py-6 text-center">
                <div className="text-3xl mb-2">📁</div>
                <div className="text-sm font-medium mb-1" style={{ color: theme.text }}>
                  No networks yet
                </div>
                <div className="text-xs" style={{ color: theme.textSecondary }}>
                  Create a network to get started
                </div>
              </div>
            )}

            {/* Create New */}
            <div className="border-t" style={{ borderColor: theme.border }}>
              {isCreating ? (
                <div className="px-4 py-3">
                  <input
                    type="text"
                    value={newNetworkName}
                    onChange={(e) => setNewNetworkName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateNetwork();
                      if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewNetworkName('');
                      }
                    }}
                    placeholder="Network name..."
                    autoFocus
                    className="w-full px-2 py-1.5 rounded text-sm mb-2"
                    style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateNetwork}
                      disabled={!newNetworkName.trim()}
                      className="flex-1 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setNewNetworkName('');
                      }}
                      className="px-3 py-1.5 rounded text-xs font-medium"
                      style={{ background: theme.bg, color: theme.text }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full px-4 py-2.5 flex items-center gap-2 text-sm font-medium"
                  style={{ color: '#3b82f6' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = theme.hover}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Icon d="M12 5v14M5 12h14" s={16} />
                  <span>Create New Network</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NetworkSelector;
