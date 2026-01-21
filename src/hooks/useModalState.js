import { useState, useCallback } from 'react';

/**
 * useModalState Hook
 *
 * Manages all modal/dialog state including:
 * - Entity editing modals (device, connection, building, room, wall, VLAN)
 * - Bulk edit modal
 */
export const useModalState = () => {
  const [editingDevice, setEditingDevice] = useState(null);
  const [editingConnection, setEditingConnection] = useState(null);
  const [editingVlan, setEditingVlan] = useState(null);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingWall, setEditingWall] = useState(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  // Helper functions
  const closeAllModals = useCallback(() => {
    setEditingDevice(null);
    setEditingConnection(null);
    setEditingVlan(null);
    setEditingBuilding(null);
    setEditingRoom(null);
    setEditingWall(null);
    setShowBulkEdit(false);
  }, []);

  const openDeviceModal = useCallback((deviceId) => {
    closeAllModals();
    setEditingDevice(deviceId);
  }, []);

  const openConnectionModal = useCallback((connectionId) => {
    closeAllModals();
    setEditingConnection(connectionId);
  }, []);

  return {
    // Entity editing
    editingDevice,
    setEditingDevice,
    editingConnection,
    setEditingConnection,
    editingVlan,
    setEditingVlan,
    editingBuilding,
    setEditingBuilding,
    editingRoom,
    setEditingRoom,
    editingWall,
    setEditingWall,

    // Bulk edit
    showBulkEdit,
    setShowBulkEdit,

    // Helpers
    closeAllModals,
    openDeviceModal,
    openConnectionModal
  };
};

export default useModalState;
