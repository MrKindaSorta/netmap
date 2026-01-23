import React from 'react';
import { useStorage } from '../../contexts/StorageContext';

/**
 * SyncStatus - Shows cloud sync status
 *
 * Status indicators:
 * - synced: All changes saved
 * - saving: Currently saving
 * - error: Failed to save
 * - conflict: Version conflict detected
 */

const Icon = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const SyncStatus = ({ theme }) => {
  const { syncStatus, isPremium, currentNetworkId } = useStorage();

  // Don't show for free users or if no network is loaded
  if (!isPremium || !currentNetworkId) {
    return null;
  }

  const statusConfig = {
    synced: {
      icon: 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
      color: '#22c55e',
      text: 'All changes saved',
      animate: false
    },
    saving: {
      icon: 'M3 15a9 9 0 0118 0M12 20l-3-3m6 0l-3 3',
      color: '#3b82f6',
      text: 'Saving...',
      animate: true
    },
    loading: {
      icon: 'M3 15a9 9 0 0118 0M12 20l-3-3m6 0l-3 3',
      color: '#3b82f6',
      text: 'Loading...',
      animate: true
    },
    error: {
      icon: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
      color: '#ef4444',
      text: 'Failed to save',
      animate: false
    },
    conflict: {
      icon: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
      color: '#f59e0b',
      text: 'Version conflict - reload required',
      animate: false
    }
  };

  const config = statusConfig[syncStatus] || statusConfig.synced;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium"
      style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: config.color }}
    >
      <div className={config.animate ? 'animate-pulse' : ''}>
        <Icon d={config.icon} s={14} />
      </div>
      <span>{config.text}</span>
    </div>
  );
};

export default SyncStatus;
