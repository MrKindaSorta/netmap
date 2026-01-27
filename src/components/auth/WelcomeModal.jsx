/**
 * Welcome Modal Component
 * Shown to first-time users with no networks
 * Offers options to create blank network, import, or load example
 */

import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useStorage } from '../../contexts/StorageContext';

export default function WelcomeModal({ onClose, onNetworkCreated, theme }) {
  const { user } = useAuth();
  const { createNetwork, isPremium } = useStorage();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);

  const handleCreateBlank = async () => {
    if (!isPremium) {
      setShowUpgradeMessage(true);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const network = await createNetwork('My Network', 'Network created via NetMap', {
        devices: {},
        connections: {},
        vlans: {},
        buildings: {},
        viewState: {
          circleScale: 1,
          deviceLabelScale: 1,
          portLabelScale: 1
        }
      });

      onNetworkCreated(network);
      onClose();
    } catch (err) {
      console.error('Error creating network:', err);
      if (err.message === 'UPGRADE_REQUIRED') {
        setShowUpgradeMessage(true);
      } else {
        setError(err.message || 'Failed to create network');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleImport = () => {
    // Trigger file input click
    document.querySelector('input[type="file"][accept=".json"]')?.click();
    onClose();
  };

  return (
    <Modal
      title="Welcome to NetMap"
      onClose={onClose}
      theme={theme}
      size="md"
      showCloseButton={true}
    >
      <div className="p-6 space-y-6">
        {/* Welcome Message */}
        <div className="text-center">
          <p className="text-lg font-medium mb-2" style={{ color: theme.text }}>
            Get Started with Your Network
          </p>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            Choose how you'd like to begin mapping your network infrastructure
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Create Blank Network */}
          <button
            onClick={handleCreateBlank}
            disabled={isCreating}
            className="w-full p-4 rounded-lg border-2 transition-all text-left hover:scale-[1.02]"
            style={{
              borderColor: theme.border,
              background: theme.bg
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.background = theme.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.background = theme.bg;
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                <span className="text-2xl">📝</span>
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1" style={{ color: theme.text }}>
                  Start with Blank Network
                </div>
                <div className="text-sm" style={{ color: theme.textSecondary }}>
                  Create an empty network and add devices manually
                </div>
              </div>
            </div>
          </button>

          {/* Import Network */}
          <button
            onClick={handleImport}
            className="w-full p-4 rounded-lg border-2 transition-all text-left hover:scale-[1.02]"
            style={{
              borderColor: theme.border,
              background: theme.bg
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.background = theme.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.background = theme.bg;
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                <span className="text-2xl">📥</span>
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1" style={{ color: theme.text }}>
                  Import Existing Network
                </div>
                <div className="text-sm" style={{ color: theme.textSecondary }}>
                  Upload a network JSON file from a previous export
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Upgrade Message for Free Users */}
        {showUpgradeMessage && (
          <div
            className="p-4 rounded-lg border"
            style={{
              background: '#fef3c7',
              borderColor: '#fbbf24',
              color: '#78350f'
            }}
          >
            <div className="font-medium mb-1">Premium Feature</div>
            <div className="text-sm">
              Cloud storage for networks is a premium feature. Upgrade to Premium to save networks to the cloud, or use Import/Export for local file management.
            </div>
          </div>
        )}

        {/* Error Message */}
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

        {/* Premium Badge */}
        {isPremium && (
          <div className="text-center text-xs" style={{ color: theme.textSecondary }}>
            ⭐ You have premium access to cloud storage
          </div>
        )}
      </div>
    </Modal>
  );
}
