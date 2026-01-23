/**
 * ReadOnlyBanner Component
 * Displayed when user has view-only access to a shared network
 */

import React from 'react';

const Icon = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ReadOnlyBanner = ({ ownerEmail, theme }) => {
  return (
    <div
      className="px-4 py-2.5 flex items-center gap-3 text-sm border-b"
      style={{
        background: '#fef3c7',
        borderColor: '#fbbf24',
        color: '#78350f'
      }}
    >
      <div className="flex items-center gap-2">
        <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" s={18} />
        <span className="font-medium">Read-Only Access</span>
      </div>
      <div className="flex-1 text-xs">
        You have view-only access to this network. Contact <span className="font-medium">{ownerEmail}</span> to request edit permissions.
      </div>
      <div className="text-xs opacity-75">
        👁 View Only
      </div>
    </div>
  );
};

export default ReadOnlyBanner;
