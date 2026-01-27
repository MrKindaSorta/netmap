import React from 'react';
import { Icon } from './MenuBarButton';

const CollaborationControls = ({ currentNetwork, isPremium, setShareNetworkId, setShowShareModal, theme }) => {
  if (!currentNetwork || currentNetwork.permission === 'view' || !isPremium) {
    return null;
  }

  return (
    <button
      onClick={() => {
        setShareNetworkId(currentNetwork.id);
        setShowShareModal(true);
      }}
      className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
      style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}
      onMouseEnter={(e) => e.currentTarget.style.background = theme.hover}
      onMouseLeave={(e) => e.currentTarget.style.background = theme.bg}
      title="Share this network"
    >
      <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" s={14} />
      Share
    </button>
  );
};

export default CollaborationControls;
