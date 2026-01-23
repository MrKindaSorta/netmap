import React, { useState, useEffect } from 'react';
import { useStorage } from '../../contexts/StorageContext';

/**
 * NetworkSelector - Dropdown for switching between saved networks
 *
 * Features:
 * - List all user networks
 * - Switch between networks
 * - Create new network
 * - Delete network
 * - Premium upgrade prompt for free users
 */

const Icon = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const NetworkSelector = ({ theme, onLoadNetwork, currentData }) => {
  const {
    networks,
    currentNetworkId,
    isPremium,
    listNetworks,
    loadNetwork,
    createNetwork,
    deleteNetwork,
    setCurrentNetworkId
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
        const data = await loadNetwork(result.networkId);
        onLoadNetwork(data, result.networkId);
      }
    } catch (error) {
      if (error.message.includes('Premium')) {
        setShowUpgrade(true);
      }
      console.error('Failed to create network:', error);
    }
  };

  const handleSelectNetwork = async (networkId) => {
    try {
      const data = await loadNetwork(networkId);
      setIsOpen(false);

      if (onLoadNetwork) {
        onLoadNetwork(data, networkId);
      }
    } catch (error) {
      console.error('Failed to load network:', error);
    }
  };

  const handleDeleteNetwork = async (networkId, e) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this network? This cannot be undone.')) {
      return;
    }

    try {
      await deleteNetwork(networkId);
    } catch (error) {
      console.error('Failed to delete network:', error);
    }
  };

  // Show upgrade prompt for free users
  if (!isPremium && showUpgrade) {
    return (
      <div className="relative">
        <div className="absolute top-12 left-0 z-50 w-80 rounded-lg shadow-xl p-4" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Icon d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" s={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2" style={{ color: theme.text }}>Upgrade to Premium</h3>
              <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
                Cloud storage requires a Premium subscription. Get auto-save, version history, and multi-device sync.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => alert('Subscription feature coming soon!')}
                  className="px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  Upgrade Now
                </button>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="px-3 py-1.5 rounded text-xs font-medium"
                  style={{ background: theme.bg, color: theme.text }}
                >
                  Maybe Later
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
        style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.textMuted }}
        title="Upgrade to Premium for cloud storage"
      >
        <Icon d="M3 15a9 9 0 0118 0M12 20l-3-3m6 0l-3 3" s={14} />
        <span>Cloud Storage</span>
        <Icon d="M9 5l7 7-7 7" s={12} />
      </button>
    );
  }

  // Premium user - show network selector
  const currentNetwork = networks.find(n => n.id === currentNetworkId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2"
        style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}
      >
        <Icon d="M3 15a9 9 0 0118 0M12 20l-3-3m6 0l-3 3" s={14} />
        <span>{currentNetwork ? currentNetwork.name : 'Select Network'}</span>
        <Icon d="M19 9l-7 7-7-7" s={12} />
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 z-50 w-64 rounded-lg shadow-xl" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          {/* Network List */}
          <div className="max-h-64 overflow-y-auto">
            {networks.length === 0 ? (
              <div className="px-4 py-3 text-xs text-center" style={{ color: theme.textMuted }}>
                No networks yet. Create one to get started!
              </div>
            ) : (
              networks.map(network => (
                <div
                  key={network.id}
                  onClick={() => handleSelectNetwork(network.id)}
                  className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-opacity-50"
                  style={{
                    background: currentNetworkId === network.id ? theme.hover : 'transparent',
                    color: theme.text
                  }}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{network.name}</div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>
                      v{network.version} • {new Date(network.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNetwork(network.id, e)}
                    className="p-1 rounded hover:bg-red-500 hover:text-white"
                    title="Delete network"
                  >
                    <Icon d="M6 18L18 6M6 6l12 12" s={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Create New */}
          <div className="border-t" style={{ borderColor: theme.border }}>
            {isCreating ? (
              <div className="px-4 py-3">
                <input
                  type="text"
                  value={newNetworkName}
                  onChange={(e) => setNewNetworkName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateNetwork()}
                  placeholder="Network name..."
                  autoFocus
                  className="w-full px-2 py-1.5 rounded text-sm mb-2"
                  style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateNetwork}
                    className="flex-1 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white"
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
              >
                <Icon d="M12 5v14M5 12h14" s={16} />
                <span>New Network</span>
              </button>
            )}
          </div>

          {/* Close */}
          <div className="border-t" style={{ borderColor: theme.border }}>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 text-xs text-center"
              style={{ color: theme.textMuted }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
