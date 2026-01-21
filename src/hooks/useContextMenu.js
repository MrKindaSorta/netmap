import { useCallback } from 'react';

/**
 * useContextMenu Hook
 *
 * Handles all context menu logic for devices, connections, buildings, rooms, walls, and canvas.
 * Provides event handlers and menu item builders for each entity type.
 */
export const useContextMenu = ({
  // Data
  devices,
  setDevices,
  connections,
  setConnections,
  buildings,
  setBuildings,
  deviceTypes,
  connTypes,

  // Selection state
  selectedDevices,
  setSelectedDevices,
  selectedConnection,
  setSelectedConnection,
  selectedRooms,
  setSelectedRooms,
  selectedWalls,
  setSelectedWalls,
  selectedBuilding,
  setSelectedBuilding,
  selectedFloor,

  // Context menu state
  setContextMenu,

  // Modal state
  setShowBulkEdit,
  setEditingDevice,
  setEditingConnection,
  setEditingBuilding,
  setEditingRoom,
  setEditingWall,

  // View state
  viewMode,

  // UI state
  copiedDevices,

  // Utilities
  getSvgPt,
  genId,

  // Action handlers
  startConnectionFrom,
  addToSelection,
  changeDeviceType,
  copyIpAddress,
  copyMacAddress,
  setAsRootBridge,
  reverseConnection,
  changeConnectionType,
  changeConnectionSpeed,
  deleteConnection,
  pasteDevicesAt,
  selectAllDevices,
  resetView
}) => {
  // Context Menu Event Handlers
  const handleDeviceContextMenu = useCallback((e, deviceId) => {
    e.preventDefault();
    e.stopPropagation();

    // Select device if not already selected
    if (!selectedDevices.has(deviceId)) {
      setSelectedDevices(new Set([deviceId]));
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'device',
      targetId: deviceId,
      targetData: devices[deviceId]
    });
  }, [selectedDevices, devices, setSelectedDevices, setContextMenu]);

  const handleConnectionContextMenu = useCallback((e, connectionId) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedConnection(connectionId);

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'connection',
      targetId: connectionId,
      targetData: connections[connectionId]
    });
  }, [connections, setSelectedConnection, setContextMenu]);

  const handleRoomContextMenu = useCallback((e, roomId) => {
    e.preventDefault();
    e.stopPropagation();

    // Select room if not already selected
    if (!selectedRooms.has(roomId)) {
      setSelectedRooms(new Set([roomId]));
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'room',
      targetId: roomId,
      targetData: { buildingId: selectedBuilding, floorId: selectedFloor, roomId }
    });
  }, [selectedRooms, selectedBuilding, selectedFloor, setSelectedRooms, setContextMenu]);

  const handleWallContextMenu = useCallback((e, wallId) => {
    e.preventDefault();
    e.stopPropagation();

    // Select wall if not already selected
    if (!selectedWalls.has(wallId)) {
      setSelectedWalls(new Set([wallId]));
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'wall',
      targetId: wallId,
      targetData: { buildingId: selectedBuilding, floorId: selectedFloor, wallId }
    });
  }, [selectedWalls, selectedBuilding, selectedFloor, setSelectedWalls, setContextMenu]);

  const handleBuildingContextMenu = useCallback((e, buildingId) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'building',
      targetId: buildingId,
      targetData: { buildingId }
    });
  }, [setContextMenu]);

  const handleCanvasContextMenu = useCallback((e) => {
    e.preventDefault();

    const pt = getSvgPt(e);

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'canvas',
      targetId: null,
      targetData: { svgX: pt.x, svgY: pt.y }
    });
  }, [getSvgPt, setContextMenu]);

  // Building/Room/Wall handler functions
  const handleBuildingSave = useCallback((buildingData, isNew) => {
    if (isNew) {
      const offset = Object.keys(buildings).length * 50;
      buildingData.x = 50 + offset;
      buildingData.y = 50 + offset;
      setBuildings(p => ({ ...p, [buildingData.id]: buildingData }));
      setSelectedBuilding(buildingData.id);
    } else {
      setBuildings(p => ({ ...p, [buildingData.id]: buildingData }));
    }
    setEditingBuilding(null);
  }, [buildings, setBuildings, setSelectedBuilding, setEditingBuilding]);

  const handleBuildingDelete = useCallback((buildingId) => {
    // Unassign all devices from this building instead of deleting them
    const updatedDevices = { ...devices };
    Object.keys(updatedDevices).forEach(devId => {
      if (updatedDevices[devId].buildingId === buildingId) {
        updatedDevices[devId] = {
          ...updatedDevices[devId],
          buildingId: null,
          floor: null
        };
      }
    });
    setDevices(updatedDevices);

    const updatedBuildings = { ...buildings };
    delete updatedBuildings[buildingId];
    setBuildings(updatedBuildings);

    if (selectedBuilding === buildingId) {
      const remainingIds = Object.keys(updatedBuildings);
      setSelectedBuilding(remainingIds.length > 0 ? remainingIds[0] : null);
    }

    setEditingBuilding(null);
  }, [devices, buildings, selectedBuilding, setDevices, setBuildings, setSelectedBuilding, setEditingBuilding]);

  const handleRoomSave = useCallback((buildingId, floorId, roomData) => {
    setBuildings(p => {
      const building = p[buildingId];
      const isNew = !building.floors.find(f => f.id === floorId)?.rooms?.find(r => r.id === roomData.id);

      return {
        ...p,
        [buildingId]: {
          ...building,
          floors: building.floors.map(f =>
            f.id === floorId
              ? {
                  ...f,
                  rooms: isNew
                    ? [...(f.rooms || []), roomData]
                    : f.rooms.map(r => r.id === roomData.id ? roomData : r)
                }
              : f
          )
        }
      };
    });
    setEditingRoom(null);
  }, [setBuildings, setEditingRoom]);

  const handleRoomDelete = useCallback((buildingId, floorId, roomId) => {
    setBuildings(p => {
      const building = p[buildingId];
      return {
        ...p,
        [buildingId]: {
          ...building,
          floors: building.floors.map(f =>
            f.id === floorId
              ? { ...f, rooms: f.rooms.filter(r => r.id !== roomId) }
              : f
          )
        }
      };
    });
    setEditingRoom(null);
  }, [setBuildings, setEditingRoom]);

  const handleWallSave = useCallback((buildingId, floorId, wallData) => {
    setBuildings(p => {
      const building = p[buildingId];
      return {
        ...p,
        [buildingId]: {
          ...building,
          floors: building.floors.map(f =>
            f.id === floorId
              ? { ...f, walls: f.walls.map(w => w.id === wallData.id ? wallData : w) }
              : f
          )
        }
      };
    });
    setEditingWall(null);
  }, [setBuildings, setEditingWall]);

  const handleWallDelete = useCallback((buildingId, floorId, wallId) => {
    setBuildings(p => {
      const building = p[buildingId];
      return {
        ...p,
        [buildingId]: {
          ...building,
          floors: building.floors.map(f =>
            f.id === floorId
              ? { ...f, walls: f.walls.filter(w => w.id !== wallId) }
              : f
          )
        }
      };
    });
    setEditingWall(null);
  }, [setBuildings, setEditingWall]);

  // Menu Item Builders
  const getDeviceMenuItems = useCallback((deviceId) => {
    const device = devices[deviceId];
    const isMultiSelect = selectedDevices.size > 1;
    const isSwitch = device?.type === 'switch' || device?.type === 'core';

    return [
      {
        label: isMultiSelect ? `Bulk Edit ${selectedDevices.size} Devices` : 'Edit Device',
        icon: isMultiSelect ? 'M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01' : 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
        action: () => isMultiSelect ? setShowBulkEdit(true) : setEditingDevice(deviceId)
      },
      ...(isMultiSelect ? [] : [{
        label: 'Duplicate Device',
        icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
        action: () => {
          Array.from(selectedDevices).forEach(id => {
            const dev = devices[id];
            const newId = genId('dev');
            const offset = 40;
            setDevices(prev => ({
              ...prev,
              [newId]: {
                ...dev,
                id: newId,
                name: dev.name + ' Copy',
                x: dev.x + offset,
                y: dev.y + offset,
                physicalX: dev.physicalX + offset,
                physicalY: dev.physicalY + offset,
                isRoot: false
              }
            }));
          });
        }
      }]),
      {
        label: isMultiSelect ? `Delete ${selectedDevices.size} Devices` : 'Delete Device',
        icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
        action: () => {
          setDevices(prev => {
            const updated = { ...prev };
            selectedDevices.forEach(id => delete updated[id]);
            return updated;
          });
          setConnections(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(cId => {
              if (selectedDevices.has(updated[cId].from) || selectedDevices.has(updated[cId].to)) {
                delete updated[cId];
              }
            });
            return updated;
          });
          setSelectedDevices(new Set());
        }
      },
      { divider: true },
      {
        label: 'Start Connection From Here',
        icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
        action: () => startConnectionFrom(deviceId),
        disabled: isMultiSelect
      },
      {
        label: selectedDevices.has(deviceId) && selectedDevices.size > 1 ? 'Remove from Selection' : 'Add to Selection',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        action: () => addToSelection(deviceId)
      },
      { divider: true },
      {
        label: 'Change Device Type',
        icon: 'M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01',
        submenu: deviceTypes.map(type => ({
          label: type.label,
          icon: type.icon,
          action: () => {
            selectedDevices.forEach(id => changeDeviceType(id, type.value));
          }
        }))
      },
      { divider: true },
      {
        label: 'Copy IP Address',
        icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
        action: () => copyIpAddress(deviceId),
        disabled: !device?.ip || isMultiSelect
      },
      {
        label: 'Copy MAC Address',
        icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
        action: () => copyMacAddress(deviceId),
        disabled: !device?.mac || isMultiSelect
      },
      ...(isSwitch ? [
        { divider: true },
        {
          label: 'Set as Root Bridge',
          icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
          action: () => setAsRootBridge(deviceId),
          disabled: isMultiSelect
        }
      ] : [])
    ].filter(item => item !== undefined);
  }, [devices, selectedDevices, deviceTypes, genId, setDevices, setConnections, setSelectedDevices, setShowBulkEdit, setEditingDevice, startConnectionFrom, addToSelection, changeDeviceType, copyIpAddress, copyMacAddress, setAsRootBridge]);

  const getConnectionMenuItems = useCallback((connectionId) => {
    return [
      {
        label: 'Edit Connection',
        icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
        action: () => setEditingConnection(connectionId)
      },
      {
        label: 'Delete Connection',
        icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
        action: () => deleteConnection(connectionId)
      },
      { divider: true },
      {
        label: 'Reverse Direction',
        icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
        action: () => reverseConnection(connectionId)
      },
      { divider: true },
      {
        label: 'Change Type',
        icon: 'M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01',
        submenu: connTypes.map(type => ({
          label: type.label,
          action: () => changeConnectionType(connectionId, type.value)
        }))
      },
      {
        label: 'Change Speed',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        submenu: [
          { label: '10 Mbps', action: () => changeConnectionSpeed(connectionId, '10M') },
          { label: '100 Mbps', action: () => changeConnectionSpeed(connectionId, '100M') },
          { label: '1 Gbps', action: () => changeConnectionSpeed(connectionId, '1G') },
          { label: '10 Gbps', action: () => changeConnectionSpeed(connectionId, '10G') },
          { label: '25 Gbps', action: () => changeConnectionSpeed(connectionId, '25G') },
          { label: '40 Gbps', action: () => changeConnectionSpeed(connectionId, '40G') },
          { label: '100 Gbps', action: () => changeConnectionSpeed(connectionId, '100G') }
        ]
      }
    ];
  }, [connTypes, setEditingConnection, deleteConnection, reverseConnection, changeConnectionType, changeConnectionSpeed]);

  const getCanvasMenuItems = useCallback((svgX, svgY) => {
    const hasDevices = Object.keys(devices).length > 0;
    const hasCopiedDevices = copiedDevices && copiedDevices.length > 0;

    return [
      {
        label: 'Add Device Here',
        icon: 'M12 4v16m8-8H4',
        action: () => {
          const id = genId('dev');
          const x = viewMode === 'logical' ? Math.round(svgX / 20) * 20 : svgX;
          const y = viewMode === 'logical' ? Math.round(svgY / 20) * 20 : svgY;
          const newDev = {
            id,
            name: 'New Device',
            type: 'switch',
            ip: '',
            mac: '',
            x: viewMode === 'logical' ? x : 400,
            y: viewMode === 'logical' ? y : 300,
            physicalX: viewMode === 'physical' ? x : 100,
            physicalY: viewMode === 'physical' ? y : 100,
            buildingId: selectedBuilding,
            floor: selectedFloor,
            notes: '',
            isRoot: false,
            status: 'unknown',
            vlans: [1]
          };
          setDevices(prev => ({ ...prev, [id]: newDev }));
          setSelectedDevices(new Set([id]));
          setEditingDevice(id);
        }
      },
      {
        label: 'Paste',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        action: () => pasteDevicesAt(svgX, svgY),
        disabled: !hasCopiedDevices
      },
      { divider: true },
      {
        label: 'Select All',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        action: () => selectAllDevices(),
        disabled: !hasDevices
      },
      { divider: true },
      {
        label: 'Reset View',
        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
        action: () => resetView()
      }
    ];
  }, [devices, copiedDevices, viewMode, selectedBuilding, selectedFloor, genId, setDevices, setSelectedDevices, setEditingDevice, pasteDevicesAt, selectAllDevices, resetView]);

  const getBuildingMenuItems = useCallback((buildingId) => {
    const building = buildings[buildingId];
    return [
      {
        label: 'Edit Building',
        icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
        action: () => setEditingBuilding(buildingId)
      },
      { divider: true },
      {
        label: 'Add Floor',
        icon: 'M12 4v16m8-8H4',
        action: () => {
          const newFloor = {
            id: building.floors.length + 1,
            name: `Floor ${building.floors.length + 1}`,
            rooms: [],
            walls: []
          };
          setBuildings(p => ({
            ...p,
            [buildingId]: {
              ...building,
              floors: [...building.floors, newFloor]
            }
          }));
        }
      },
      {
        label: 'Upload Floor Plan',
        icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12M8 8l4-4 4 4',
        action: () => {
          setSelectedBuilding(buildingId);
          document.querySelector('input[type="file"][accept="image/*"]')?.click();
        }
      },
      { divider: true },
      {
        label: 'Duplicate Building',
        icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
        action: () => {
          const newId = genId('bld');
          const offset = 50;
          setBuildings(p => ({
            ...p,
            [newId]: {
              ...building,
              id: newId,
              name: building.name + ' Copy',
              x: building.x + offset,
              y: building.y + offset
            }
          }));
        }
      },
      {
        label: 'Delete Building',
        icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
        action: () => handleBuildingDelete(buildingId)
      }
    ];
  }, [buildings, genId, setBuildings, setSelectedBuilding, setEditingBuilding, handleBuildingDelete]);

  const getRoomMenuItems = useCallback((buildingId, floorId, roomId) => {
    const building = buildings[buildingId];
    const floor = building?.floors.find(f => f.id === floorId);
    const room = floor?.rooms.find(r => r.id === roomId);
    if (!room) return [];

    return [
      {
        label: 'Edit Room',
        icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
        action: () => setEditingRoom({ room, buildingId, floorId })
      },
      {
        label: 'Duplicate Room',
        icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
        action: () => {
          const newId = genId('room');
          const newRoom = {
            ...room,
            id: newId,
            name: room.name + ' Copy',
            x: room.x + 20,
            y: room.y + 20
          };
          handleRoomSave(buildingId, floorId, newRoom);
        }
      },
      { divider: true },
      {
        label: 'Place Device Here',
        icon: 'M12 4v16m8-8H4',
        action: () => {
          const id = genId('dev');
          const newDev = {
            id,
            name: 'New Device',
            type: 'switch',
            ip: '',
            mac: '',
            x: 400,
            y: 300,
            physicalX: room.x + room.width / 2,
            physicalY: room.y + room.height / 2,
            buildingId,
            floor: floorId,
            notes: '',
            isRoot: false,
            status: 'unknown',
            vlans: [1]
          };
          setDevices(prev => ({ ...prev, [id]: newDev }));
          setEditingDevice(id);
        }
      },
      { divider: true },
      {
        label: 'Delete Room',
        icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
        action: () => handleRoomDelete(buildingId, floorId, roomId)
      }
    ];
  }, [buildings, genId, setDevices, setEditingDevice, setEditingRoom, handleRoomSave, handleRoomDelete]);

  const getWallMenuItems = useCallback((buildingId, floorId, wallId) => {
    const building = buildings[buildingId];
    const floor = building?.floors.find(f => f.id === floorId);
    const wall = floor?.walls.find(w => w.id === wallId);
    if (!wall) return [];

    return [
      {
        label: 'Edit Wall',
        icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
        action: () => setEditingWall({ wall, buildingId, floorId })
      },
      {
        label: 'Delete Wall',
        icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
        action: () => handleWallDelete(buildingId, floorId, wallId)
      }
    ];
  }, [buildings, setEditingWall, handleWallDelete]);

  return {
    // Event handlers
    handleDeviceContextMenu,
    handleConnectionContextMenu,
    handleRoomContextMenu,
    handleWallContextMenu,
    handleBuildingContextMenu,
    handleCanvasContextMenu,

    // Building/Room/Wall handlers
    handleBuildingSave,
    handleBuildingDelete,
    handleRoomSave,
    handleRoomDelete,
    handleWallSave,
    handleWallDelete,

    // Menu item builders
    getDeviceMenuItems,
    getConnectionMenuItems,
    getCanvasMenuItems,
    getBuildingMenuItems,
    getRoomMenuItems,
    getWallMenuItems
  };
};

export default useContextMenu;
