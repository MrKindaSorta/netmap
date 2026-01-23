import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * StorageContext - Manages cloud storage for networks
 *
 * Features:
 * - List user's networks (owned and shared)
 * - Load/save networks to cloud
 * - Auto-save with debouncing
 * - Version history
 * - Sync status tracking
 * - Permission tracking for shared networks
 */

const StorageContext = createContext(null);

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
};

export const StorageProvider = ({ children }) => {
  const [networks, setNetworks] = useState([]);
  const [currentNetwork, setCurrentNetwork] = useState(null); // { id, name, permission }
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'saving', 'error', 'loading'
  const [isPremium, setIsPremium] = useState(false);

  /**
   * List all networks for the current user (owned and shared)
   */
  const listNetworks = useCallback(async () => {
    try {
      const response = await fetch('/api/networks/list', {
        method: 'GET',
        credentials: 'include' // Send JWT cookies
      });

      if (!response.ok) {
        if (response.status === 403) {
          // Not premium - expected for free users
          const data = await response.json();
          if (data.upgrade_required) {
            setIsPremium(false);
          }
          return [];
        }
        throw new Error('Failed to list networks');
      }

      const data = await response.json();
      setNetworks(data.networks);
      setIsPremium(true);
      return data.networks;
    } catch (error) {
      console.error('Error listing networks:', error);
      return [];
    }
  }, []);

  /**
   * Load a specific network
   */
  const loadNetwork = useCallback(async (networkId) => {
    try {
      setSyncStatus('loading');
      const response = await fetch(`/api/networks/${networkId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load network');
      }

      const result = await response.json();

      // Store current network with permission info
      setCurrentNetwork({
        id: networkId,
        name: result.name,
        permission: result.permission || 'owner',
        version: result.version
      });

      setSyncStatus('synced');
      return {
        data: result.data,
        version: result.version,
        name: result.name
      };
    } catch (error) {
      console.error('Error loading network:', error);
      setSyncStatus('error');
      throw error;
    }
  }, []);

  /**
   * Save network (with version increment)
   */
  const saveNetwork = useCallback(async (networkId, data, expectedVersion, changelog) => {
    try {
      setSyncStatus('saving');
      const response = await fetch(`/api/networks/${networkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          data,
          expectedVersion,
          changelog
        })
      });

      if (!response.ok) {
        if (response.status === 409) {
          // Version conflict
          const error = await response.json();
          setSyncStatus('conflict');
          throw new Error(`Version conflict: ${error.message}`);
        }
        if (response.status === 403) {
          const error = await response.json();
          throw new Error(error.error || 'Access denied');
        }
        throw new Error('Failed to save network');
      }

      const result = await response.json();
      setSyncStatus('synced');
      return result;
    } catch (error) {
      console.error('Error saving network:', error);
      setSyncStatus('error');
      throw error;
    }
  }, []);

  /**
   * Auto-save draft (no version increment)
   */
  const autosaveNetwork = useCallback(async (networkId, data) => {
    try {
      setSyncStatus('saving');
      const response = await fetch(`/api/networks/${networkId}/autosave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ data })
      });

      if (!response.ok) {
        throw new Error('Failed to autosave network');
      }

      setSyncStatus('synced');
    } catch (error) {
      console.error('Error autosaving network:', error);
      setSyncStatus('error');
    }
  }, []);

  /**
   * Create new network
   */
  const createNetwork = useCallback(async (name, description, data) => {
    try {
      setSyncStatus('saving');
      const response = await fetch('/api/networks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          description,
          data
        })
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          if (error.upgrade_required) {
            throw new Error('UPGRADE_REQUIRED');
          }
          throw new Error('Premium subscription required');
        }
        throw new Error(error.error || 'Failed to create network');
      }

      const result = await response.json();
      setCurrentNetwork({
        id: result.network.id,
        name: result.network.name,
        permission: 'owner'
      });
      setSyncStatus('synced');

      // Refresh network list
      await listNetworks();

      return result.network;
    } catch (error) {
      console.error('Error creating network:', error);
      setSyncStatus('error');
      throw error;
    }
  }, [listNetworks]);

  /**
   * Delete network
   */
  const deleteNetwork = useCallback(async (networkId) => {
    try {
      const response = await fetch(`/api/networks/${networkId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete network');
      }

      // Refresh network list
      await listNetworks();

      // Clear current network if deleted
      if (currentNetwork?.id === networkId) {
        setCurrentNetwork(null);
      }
    } catch (error) {
      console.error('Error deleting network:', error);
      throw error;
    }
  }, [currentNetwork, listNetworks]);

  /**
   * Load version history
   */
  const loadVersionHistory = useCallback(async (networkId) => {
    try {
      const response = await fetch(`/api/networks/${networkId}/versions`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load version history');
      }

      const result = await response.json();
      return result.versions;
    } catch (error) {
      console.error('Error loading version history:', error);
      throw error;
    }
  }, []);

  /**
   * Load specific version
   */
  const loadVersion = useCallback(async (networkId, version) => {
    try {
      const response = await fetch(`/api/networks/${networkId}/versions?version=${version}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load version');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error loading version:', error);
      throw error;
    }
  }, []);

  /**
   * Share network with another user
   */
  const shareNetwork = useCallback(async (networkId, shareWithEmail, permission) => {
    try {
      const response = await fetch(`/api/networks/${networkId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          shareWithEmail,
          permission
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to share network');
      }

      const result = await response.json();
      return result.share;
    } catch (error) {
      console.error('Error sharing network:', error);
      throw error;
    }
  }, []);

  /**
   * List network shares
   */
  const listShares = useCallback(async (networkId) => {
    try {
      const response = await fetch(`/api/networks/${networkId}/shares`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to list shares');
      }

      const result = await response.json();
      return result.shares;
    } catch (error) {
      console.error('Error listing shares:', error);
      throw error;
    }
  }, []);

  /**
   * Revoke network share
   */
  const revokeShare = useCallback(async (networkId, shareId) => {
    try {
      const response = await fetch(`/api/networks/${networkId}/shares/${shareId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to revoke share');
      }

      return true;
    } catch (error) {
      console.error('Error revoking share:', error);
      throw error;
    }
  }, []);

  const value = {
    // State
    networks,
    currentNetwork,
    syncStatus,
    isPremium,

    // Actions
    setCurrentNetwork,
    listNetworks,
    loadNetwork,
    saveNetwork,
    autosaveNetwork,
    createNetwork,
    deleteNetwork,
    loadVersionHistory,
    loadVersion,
    shareNetwork,
    listShares,
    revokeShare
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};

export default StorageContext;
