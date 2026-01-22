import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// Import common components
import { Icon, Modal, ContextMenu } from './components/common';

// Import canvas components
import { ConnLine, DevNode, Minimap, BuildingThumb } from './components/canvas';

// Import panel components
import AiChatPanel from './components/panels/AiChatPanel';
import PathToWan from './components/panels/PathToWan';
import VlanPanel from './components/panels/VlanPanel';

// Import device config components
import { DevModal } from './components/device-config';
import BulkEditModal from './components/device-config/BulkEditModal';

// Import connection config components
import { ConnModal } from './components/connection-config';

// Import VLAN config components
import { VlanModal } from './components/vlan-config';

// Import building config components
import { BuildingModal, RoomModal, WallModal } from './components/building-config';

// Import physical layout components
import EmptyStatePanel from './components/physical-layout/EmptyStatePanel';
import SelectionHandles from './components/physical-layout/SelectionHandles';

// Import services
import { layoutDevicesInBuilding } from './services/deviceLayoutService';

// Import constants
import {
  deviceTypes,
  connTypes,
  cableTypes,
  speeds,
  statusColors,
  DEVICE_CAPABILITIES,
  getDeviceCapabilities,
  getAvailableTabs,
  getDevColor,
  getConnStyle,
  getTheme
} from './constants';

// Import utilities
import {
  ipToNumber,
  checkIpInSubnet,
  validateVlanId,
  validateSubnet,
  validateGateway,
  validateVlanForm,
  migrateDeviceData,
  genId
} from './utils';

// Import services
import {
  findPathToWan,
  exportData,
  importDataFromFile,
  sendMessage,
  formatNetworkContext,
  validateMessage,
  sendMessageWithTools,
  handleAiToolCall
} from './services';

// Import AI services
import { calculateSmartPosition } from './services/aiDevicePositioning';
import {
  extractChangeProposal,
  validateDeviceIds,
  validateProposedUpdates,
  buildAffectedDevicesList,
  applyNestedUpdates
} from './services/aiEditParser';

// Import hooks
import {
  useHistory,
  useFiltering,
  useKeyboardShortcuts,
  useCanvasMouseEvents,
  useContextMenu,
  useViewState,
  useSelectionState,
  useInteractionState,
  useModalState,
  useUIState
} from './hooks';

const NetworkTopologyEditor = () => {
  // Core data state (only 5 useState in main component)
  const [devices, setDevices] = useState({
    'dev-1': { id: 'dev-1', name: 'KSP-BP-MX85', type: 'firewall', ip: '10.0.10.1', mac: 'f8:9e:28:85:b2:4c', x: 400, y: 60, physicalX: 150, physicalY: 120, buildingId: 'bldg-1', floor: 1, notes: 'Meraki MX85 Gateway', isRoot: false, status: 'up', vlans: [1] },
    'dev-2': { id: 'dev-2', name: 'KSP-BP-MDF', type: 'core', ip: '10.0.10.254', mac: 'a4:9b:cd:83:15:85', x: 400, y: 180, physicalX: 150, physicalY: 180, buildingId: 'bldg-1', floor: 1, notes: 'Cisco CBS350-48FP-4G', isRoot: true, status: 'up', vlans: [1, 20, 25, 30, 60, 80] },
    'dev-3': { id: 'dev-3', name: 'KSP-MDF-SW2', type: 'switch', ip: '10.0.10.157', mac: '9c:e3:30:f2:7c:b0', x: 150, y: 300, physicalX: 400, physicalY: 150, buildingId: 'bldg-1', floor: 1, notes: 'Meraki MS350-48FP', isRoot: false, status: 'up', vlans: [1, 2002, 2003] },
    'dev-4': { id: 'dev-4', name: 'KSP-BP-IDF1', type: 'switch', ip: '10.0.10.253', mac: 'a4:9b:cd:82:f1:39', x: 650, y: 300, physicalX: 480, physicalY: 280, buildingId: 'bldg-1', floor: 1, notes: 'Cisco CBS350-48FP-4G', isRoot: false, status: 'up', vlans: [1, 20, 25, 60] },
    'dev-5': { id: 'dev-5', name: 'KSP-BP-IDF2', type: 'switch', ip: '10.0.10.252', mac: 'a4:9b:cd:82:ed:4a', x: 500, y: 420, physicalX: 150, physicalY: 350, buildingId: 'bldg-1', floor: 1, notes: 'Loop: gi16-gi17', isRoot: false, status: 'warning', vlans: [1, 20, 80] },
    'dev-6': { id: 'dev-6', name: 'Warehouse-IDF', type: 'switch', ip: '10.0.10.36', mac: 'e0:63:da:e0:b0:ec', x: 350, y: 540, physicalX: 150, physicalY: 150, buildingId: 'bldg-2', floor: 1, notes: 'Warehouse switch', isRoot: false, status: 'up', vlans: [1, 20] },
  });

  const [connections, setConnections] = useState({
    'conn-1': { id: 'conn-1', from: 'dev-1', to: 'dev-2', fromPort: 'GbE5', toPort: 'gi47', type: 'trunk', speed: '1G', vlans: [1], cableType: 'cat6', cableLength: 3 },
    'conn-2': { id: 'conn-2', from: 'dev-2', to: 'dev-3', fromPort: 'gi2', toPort: 'gi1', type: 'trunk', speed: '1G', vlans: [1, 2002, 2003], cableType: 'cat6', cableLength: 15 },
    'conn-3': { id: 'conn-3', from: 'dev-2', to: 'dev-4', fromPort: 'gi50', toPort: 'gi49', type: 'trunk', speed: '1G', vlans: [1, 20, 25, 60], cableType: 'cat6', cableLength: 45 },
    'conn-4': { id: 'conn-4', from: 'dev-2', to: 'dev-5', fromPort: 'gi49', toPort: 'gi49', type: 'trunk', speed: '1G', vlans: [1, 20, 80], cableType: 'cat6', cableLength: 30 },
    'conn-5': { id: 'conn-5', from: 'dev-2', to: 'dev-6', fromPort: 'gi48', toPort: 'gi1', type: 'fiber', speed: '10G', vlans: [1, 20], cableType: 'smf', cableLength: 150 },
  });

  const [vlans, setVlans] = useState({
    1: { id: 1, name: 'Default', subnet: '10.0.10.0/24', gateway: '10.0.10.1', color: '#3b82f6', description: 'Management' },
    20: { id: 20, name: 'Warehouse', subnet: '10.0.20.0/24', gateway: '10.0.20.1', color: '#10b981', description: 'Warehouse Systems' },
    25: { id: 25, name: 'Polycom', subnet: '10.0.25.0/24', gateway: '10.0.25.1', color: '#8b5cf6', description: 'VoIP Phones' },
    30: { id: 30, name: 'HandHelds', subnet: '10.0.30.0/24', gateway: '10.0.30.1', color: '#f97316', description: 'Mobile Devices' },
    60: { id: 60, name: 'Wireless', subnet: '10.0.60.0/24', gateway: '10.0.60.1', color: '#06b6d4', description: 'AP Management' },
    80: { id: 80, name: 'Cameras', subnet: '10.0.80.0/24', gateway: '10.0.80.1', color: '#ec4899', description: 'Security Cameras' },
    2002: { id: 2002, name: 'LocusBot', subnet: '10.20.2.0/24', gateway: '10.20.2.1', color: '#eab308', description: 'Locus Robot Comm' },
    2003: { id: 2003, name: 'LocusApp', subnet: '10.20.3.0/24', gateway: '10.20.3.1', color: '#ef4444', description: 'Locus App Traffic' },
  });

  const [buildings, setBuildings] = useState({});

  const [interBuildingLinks, setInterBuildingLinks] = useState([]);

  // Refs
  const svgRef = useRef(null);
  const fileInputRef = useRef(null);

  // View state hook - manages all view-related state
  const viewState = useViewState();
  const {
    viewMode, setViewMode,
    measurementUnit, setMeasurementUnit,
    showGrid, setShowGrid,
    darkMode, setDarkMode,
    zoom, setZoom,
    pan, setPan,
    circleScale, setCircleScale,
    deviceLabelScale, setDeviceLabelScale,
    portLabelScale, setPortLabelScale,
    showMinimap, setShowMinimap,
    showVlanPanel, setShowVlanPanel,
    visibilityMode, setVisibilityMode,
    visibilityModeSize, setVisibilityModeSize,
    resetView
  } = viewState;

  // Selection state hook - manages all selection-related state
  const selectionState = useSelectionState();
  const {
    selectedDevices, setSelectedDevices,
    selectedRooms, setSelectedRooms,
    selectedWalls, setSelectedWalls,
    selectedConnection, setSelectedConnection,
    selectedBuilding, setSelectedBuilding,
    selectedFloor, setSelectedFloor,
    selectionBox, setSelectionBox,
    clearAllSelections,
    selectAllDevices
  } = selectionState;

  // Interaction state hook - manages all user interaction state
  const interactionState = useInteractionState();
  const {
    dragging, setDragging,
    connecting, setConnecting,
    tool, setTool,
    isPanning, setIsPanning,
    panStart, setPanStart,
    mouseDownPos, setMouseDownPos,
    mousePosition, setMousePosition,
    drawingMode, setDrawingMode,
    drawingStart, setDrawingStart,
    measurePoints, setMeasurePoints,
    resizingRoom, setResizingRoom,
    movingRooms, setMovingRooms,
    draggingBuilding, setDraggingBuilding,
    cancelAllInteractions
  } = interactionState;

  // Modal state hook - manages all modal/dialog state
  const modalState = useModalState();
  const {
    editingDevice, setEditingDevice,
    editingConnection, setEditingConnection,
    editingVlan, setEditingVlan,
    editingBuilding, setEditingBuilding,
    editingRoom, setEditingRoom,
    editingWall, setEditingWall,
    showBulkEdit, setShowBulkEdit,
    closeAllModals
  } = modalState;

  // UI state hook - manages UI-related state
  const uiState = useUIState();
  const {
    contextMenu, setContextMenu,
    hoveredConn, setHoveredConn,
    searchQuery, setSearchQuery,
    filterVlan, setFilterVlan,
    copiedDevices, setCopiedDevices,
    floorPlanImages, setFloorPlanImages,
    imageOpacity, setImageOpacity,
    highlightedPath, setHighlightedPath,
    showMeasurements, setShowMeasurements,
    aiChatOpen, setAiChatOpen,
    aiMessages, setAiMessages,
    aiInputValue, setAiInputValue,
    aiIsLoading, setAiIsLoading,
    streamingMessage, setStreamingMessage,
    includeNetworkContext, setIncludeNetworkContext,
    aiError, setAiError,
    addAiMessage, clearAiChat,
    showConversationHistory, setShowConversationHistory,
    currentConversationId, setCurrentConversationId,
    aiPendingChange, setAiPendingChange, clearAiPendingChange,
    aiPendingDeviceBatch, setAiPendingDeviceBatch, clearAiPendingDeviceBatch,
    closeContextMenu,
    clearFilters
  } = uiState;

  // Utility functions
  const pxPerFoot = 10, pxPerMeter = 32.8;
  const getPxPerUnit = () => measurementUnit === 'imperial' ? pxPerFoot : pxPerMeter;
  const getUnit = () => measurementUnit === 'imperial' ? 'ft' : 'm';
  const toDisplay = (px) => (px / getPxPerUnit()).toFixed(1);


  // Memoize theme to prevent unnecessary recalculations
  const theme = useMemo(() => getTheme(darkMode), [darkMode]);

  // Use the optimized useHistory hook
  const {
    saveHistory,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo,
    history,
    historyIdx
  } = useHistory(devices, connections, buildings);

  const undo = useCallback(() => {
    const state = undoHistory();
    if (state) {
      setDevices(state.devices);
      setConnections(state.connections);
      setBuildings(state.buildings);
    }
  }, [undoHistory]);

  const redo = useCallback(() => {
    const state = redoHistory();
    if (state) {
      setDevices(state.devices);
      setConnections(state.connections);
      setBuildings(state.buildings);
    }
  }, [redoHistory]);

  const getSvgPt = useCallback((e) => {
    const svg = svgRef.current; if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: (sp.x - pan.x) / zoom, y: (sp.y - pan.y) / zoom };
  }, [pan, zoom]);

  const getGridBounds = useCallback(() => {
    if (!svgRef.current) return { x: 0, y: 0, width: 2000, height: 2000 };

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const padding = 100;

    return {
      x: (-pan.x / zoom) - padding,
      y: (-pan.y / zoom) - padding,
      width: (rect.width / zoom) + (padding * 2),
      height: (rect.height / zoom) + (padding * 2)
    };
  }, [pan, zoom]);

  const handleDeviceUpdate = useCallback((deviceId, updates) => {
    setDevices(prev => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], ...updates }
    }));
  }, []);

  // Deep merge utility for nested object updates
  const deepMerge = useCallback((target, source) => {
    const output = { ...target };

    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && !(source[key] instanceof Date)) {
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    });

    return output;
  }, []);

  const handleBulkDeviceUpdate = useCallback((deviceIds, updates) => {
    setDevices(prev => {
      const updated = { ...prev };

      // Extract special modes
      const notesMode = updates._notesMode;
      const vlanMode = updates.vlanMode;

      // Remove mode flags from updates object
      const cleanUpdates = { ...updates };
      delete cleanUpdates._notesMode;
      delete cleanUpdates.vlanMode;

      // If assigning to a building, use intelligent layout
      let layoutPositions = {};
      if (cleanUpdates.buildingId) {
        const building = buildings[cleanUpdates.buildingId];
        if (building) {
          // Calculate intelligent layout positions for all devices being assigned
          layoutPositions = layoutDevicesInBuilding(prev, deviceIds, building);
        }
      }

      deviceIds.forEach(deviceId => {
        const device = updated[deviceId];
        if (!device) return;

        // Get physical position updates from layout service
        const physicalUpdates = layoutPositions[deviceId] || {};

        // Start with deep merge for nested objects
        let merged = deepMerge(device, cleanUpdates);

        // Apply physical updates
        merged = { ...merged, ...physicalUpdates };

        // Special handling: notes append mode
        if (notesMode === 'append' && cleanUpdates.notes) {
          const existingNotes = device.notes || '';
          merged.notes = existingNotes
            ? `${existingNotes}\n\n${cleanUpdates.notes}`
            : cleanUpdates.notes;
        }

        // Special handling: VLAN add/replace mode
        if (cleanUpdates.vlans && vlanMode) {
          const currentVlans = device.vlans || [1];
          merged.vlans = vlanMode === 'add'
            ? [...new Set([...currentVlans, ...cleanUpdates.vlans])]
            : cleanUpdates.vlans;
        }

        updated[deviceId] = merged;
      });

      return updated;
    });

    // Auto-switch to the assigned building after bulk assignment
    if (updates.buildingId) {
      setSelectedBuilding(updates.buildingId);
      if (updates.floor) {
        setSelectedFloor(updates.floor);
      }

      // Highlight newly assigned devices for 2 seconds
      setSelectedDevices(new Set(deviceIds));
      setTimeout(() => {
        setSelectedDevices(new Set());
      }, 2000);
    }
  }, [buildings, deepMerge]);

  const handleConnectionUpdate = useCallback((connectionId, updates) => {
    setConnections(prev => ({
      ...prev,
      [connectionId]: { ...prev[connectionId], ...updates }
    }));
  }, []);

  const handleVlanSave = useCallback((vlanId, vlanData, isCreate) => {
    if (isCreate) {
      setVlans(prev => ({ ...prev, [vlanData.id]: vlanData }));
    } else {
      setVlans(prev => ({ ...prev, [vlanId]: { ...prev[vlanId], ...vlanData } }));
    }
    setEditingVlan(null);
  }, []);

  const handleVlanDelete = useCallback((vlanId) => {
    setVlans(prev => {
      const newVlans = { ...prev };
      delete newVlans[vlanId];
      return newVlans;
    });

    // Remove from devices
    setDevices(prev => {
      const updated = {};
      Object.keys(prev).forEach(devId => {
        updated[devId] = {
          ...prev[devId],
          vlans: prev[devId].vlans?.filter(v => v !== vlanId) || []
        };
      });
      return updated;
    });

    // Remove from connections
    setConnections(prev => {
      const updated = {};
      Object.keys(prev).forEach(connId => {
        updated[connId] = {
          ...prev[connId],
          vlans: prev[connId].vlans?.filter(v => v !== vlanId) || []
        };
      });
      return updated;
    });

    setEditingVlan(null);
  }, []);

  const handleCloseDevModal = useCallback(() => {
    setEditingDevice(null);
  }, []);

  const handleCloseConnModal = useCallback(() => {
    setEditingConnection(null);
  }, []);

  // AI Chat Handler
  const handleSendAiMessage = useCallback(async () => {
    // Validate input
    const validation = validateMessage(aiInputValue);
    if (!validation.valid) {
      setAiError(validation.error);
      return;
    }

    // Clear error and set loading state
    setAiError(null);
    setAiIsLoading(true);

    // Add user message to history
    addAiMessage('user', aiInputValue);

    // Clear input field
    const userMessage = aiInputValue;
    setAiInputValue('');

    try {
      // Prepare network context if toggle enabled
      const networkContext = includeNetworkContext
        ? formatNetworkContext(
            Object.values(devices),
            Object.values(connections),
            Object.values(vlans),
            Object.values(buildings)
          )
        : null;

      // Prepare messages array for API
      const messages = [
        ...aiMessages
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        { role: 'user', content: userMessage }
      ];

      // Send message with tool support
      let streamingText = '';
      let toolCalls = [];

      const response = await sendMessageWithTools(
        messages,
        networkContext,
        (chunk) => {
          streamingText += chunk;
          setStreamingMessage(streamingText);
        },
        (toolCall) => {
          toolCalls.push(toolCall);
        }
      );

      // Process tool calls
      if (toolCalls.length > 0) {
        // Collect all valid suggestions
        const validSuggestions = [];
        const duplicates = [];
        const errors = [];

        toolCalls.forEach(toolCall => {
          const result = handleAiToolCall(
            toolCall,
            devices,
            connections,
            buildings,
            vlans
          );

          if (result.type === 'device_suggestion') {
            // Recalculate position with smart algorithm
            const smartPosition = calculateSmartPosition(
              result.data.device,
              result.data.connections,
              devices,
              buildings
            );
            result.data.suggestedPosition = smartPosition;
            validSuggestions.push(result.data);

          } else if (result.type === 'device_suggestion_duplicate') {
            duplicates.push(result.existingDevice.name);

          } else if (result.type === 'device_suggestion_error') {
            errors.push(result.error);
            console.error('Device suggestion error:', result.error, result.deviceData);
          }
        });

        // Handle errors
        if (errors.length > 0) {
          addAiMessage('system', `Errors: ${errors.join(', ')}`);
        }

        // Handle duplicates
        if (duplicates.length > 0) {
          addAiMessage('system', `Already exists: ${duplicates.join(', ')}`);
        }

        // Handle valid suggestions
        if (validSuggestions.length > 0) {
          if (validSuggestions.length === 1) {
            // Single device - keep current behavior (backward compatible)
            addAiMessage('device_suggestion', response.text || 'I detected a device:', validSuggestions[0]);
          } else {
            // Multiple devices - use batch approval
            setAiPendingDeviceBatch({
              id: `batch-${Date.now()}`,
              suggestions: validSuggestions,
              messageText: response.text || `I detected ${validSuggestions.length} devices:`,
              timestamp: new Date()
            });
            // Add assistant message for history (without data)
            addAiMessage('assistant', response.text || `I detected ${validSuggestions.length} devices that could be added to your network.`);
          }
        }
      } else if (response.text && response.text.trim().length > 0) {
        // Check for change proposal in text
        const proposal = extractChangeProposal(response.text);

        if (proposal) {
          // Validate device IDs
          const deviceValidation = validateDeviceIds(proposal.deviceIds, devices);
          if (!deviceValidation.valid) {
            addAiMessage('assistant', response.text);
            addAiMessage('system', `Error: Devices not found: ${deviceValidation.missingIds.join(', ')}`);
            setStreamingMessage('');
            setAiIsLoading(false);
            return;
          }

          // Validate updates
          const updateValidation = validateProposedUpdates(proposal.updates, devices);

          // Build affected devices list
          const affectedDevices = buildAffectedDevicesList(
            proposal.deviceIds,
            proposal.updates,
            devices
          );

          // Store pending change
          setAiPendingChange({
            id: `change-${Date.now()}`,
            deviceIds: proposal.deviceIds,
            updates: proposal.updates,
            summary: proposal.summary,
            reasoning: proposal.reasoning,
            affectedDevices,
            validation: updateValidation,
            timestamp: new Date()
          });
        }

        // Add assistant message
        addAiMessage('assistant', response.text);
      } else {
        throw new Error('Received empty response from AI');
      }

      // Clear streaming state
      setStreamingMessage('');
    } catch (error) {
      console.error('AI Chat Error:', error);
      setAiError(error.message || 'An error occurred while sending your message');

      // Remove the user message we just added if there was an error
      setAiMessages(prev => prev.slice(0, -1));

      // Restore input value so user can try again
      setAiInputValue(userMessage);
    } finally {
      setAiIsLoading(false);
    }
  }, [
    aiInputValue,
    aiMessages,
    includeNetworkContext,
    devices,
    connections,
    vlans,
    buildings,
    addAiMessage,
    setAiInputValue,
    setAiIsLoading,
    setStreamingMessage,
    setAiError,
    setAiMessages,
    setAiPendingChange
  ]);

  // Handler for "Add Device" button from AI suggestion
  const handleAddSuggestedDevice = useCallback((suggestionData) => {
    const { device, connections: suggestedConnections, suggestedPosition } = suggestionData;

    // Generate new device ID
    const newDeviceId = genId('dev');

    // Create device with calculated position
    const newDevice = {
      ...device,
      id: newDeviceId,
      x: suggestedPosition.x,
      y: suggestedPosition.y,
      physicalX: suggestedPosition.x,
      physicalY: suggestedPosition.y
    };

    // Save history before making changes
    saveHistory();

    // Add to state
    setDevices(prev => ({ ...prev, [newDeviceId]: newDevice }));

    // Add connections
    if (suggestedConnections && suggestedConnections.length > 0) {
      const newConnections = {};
      suggestedConnections.forEach(conn => {
        const connId = genId('conn');
        newConnections[connId] = {
          id: connId,
          from: newDeviceId,
          to: conn.toDeviceId,
          fromPort: conn.fromPort,
          toPort: conn.toPort,
          type: conn.type,
          speed: conn.speed,
          vlans: conn.vlans,
          cableType: conn.cableType
        };
      });
      setConnections(prev => ({ ...prev, ...newConnections }));
    }

    addAiMessage('system', `✓ Added ${device.name} to your network`);

    // Pan to new device
    if (svgRef.current) {
      const targetX = -(suggestedPosition.x * zoom - window.innerWidth / 2);
      const targetY = -(suggestedPosition.y * zoom - window.innerHeight / 2);
      setPan({ x: targetX, y: targetY });
    }
  }, [devices, buildings, zoom, setPan, setDevices, setConnections, addAiMessage, saveHistory, svgRef]);

  // Handler for "No Thanks" button from AI suggestion
  const handleDeclineSuggestion = useCallback(() => {
    addAiMessage('system', 'Okay, I won\'t add that device. Let me know if you change your mind!');
  }, [addAiMessage]);

  // Handler for batch device approval
  const handleApproveBatchDevices = useCallback(() => {
    if (!aiPendingDeviceBatch) return;

    const { suggestions } = aiPendingDeviceBatch;
    const addedDevices = [];

    saveHistory();

    setDevices(prev => {
      const updated = { ...prev };
      const newConnectionsTemp = {};

      suggestions.forEach(suggestion => {
        const { device, connections: suggestedConnections, suggestedPosition } = suggestion;
        const newDeviceId = genId('dev');

        // Add device
        updated[newDeviceId] = {
          ...device,
          id: newDeviceId,
          x: suggestedPosition.x,
          y: suggestedPosition.y,
          physicalX: suggestedPosition.x,
          physicalY: suggestedPosition.y
        };

        addedDevices.push(device.name);

        // Prepare connections
        if (suggestedConnections && suggestedConnections.length > 0) {
          suggestedConnections.forEach(conn => {
            const connId = genId('conn');
            newConnectionsTemp[connId] = {
              id: connId,
              from: newDeviceId,
              to: conn.toDeviceId,
              fromPort: conn.fromPort || '',
              toPort: conn.toPort || '',
              type: conn.type || 'trunk',
              speed: conn.speed || '1G',
              vlans: conn.vlans || [],
              cableType: conn.cableType || 'cat6',
              status: 'up'
            };
          });
        }
      });

      // Add connections after all devices
      setConnections(prev => ({ ...prev, ...newConnectionsTemp }));

      return updated;
    });

    // Summary message for history
    addAiMessage('system', `✓ Added ${addedDevices.length} devices: ${addedDevices.join(', ')}`);

    clearAiPendingDeviceBatch();
  }, [aiPendingDeviceBatch, setDevices, setConnections, addAiMessage, clearAiPendingDeviceBatch, saveHistory]);

  // Handler for batch device decline
  const handleDeclineBatchDevices = useCallback(() => {
    if (!aiPendingDeviceBatch) return;

    const { suggestions } = aiPendingDeviceBatch;
    addAiMessage('system', `Declined ${suggestions.length} device suggestions`);
    clearAiPendingDeviceBatch();
  }, [aiPendingDeviceBatch, addAiMessage, clearAiPendingDeviceBatch]);

  // Handler for "Approve" button from AI change proposal
  const handleApproveAiChange = useCallback(() => {
    if (!aiPendingChange || !aiPendingChange.validation.valid) return;

    const { deviceIds, updates } = aiPendingChange;

    saveHistory();

    // Apply changes to each device
    setDevices(prev => {
      const updated = { ...prev };
      deviceIds.forEach(deviceId => {
        if (updated[deviceId]) {
          updated[deviceId] = applyNestedUpdates(updated[deviceId], updates);
        }
      });
      return updated;
    });

    const confirmationMsg = deviceIds.length === 1
      ? `✓ Applied changes to ${devices[deviceIds[0]]?.name}`
      : `✓ Applied changes to ${deviceIds.length} devices`;

    addAiMessage('system', confirmationMsg);
    clearAiPendingChange();
  }, [aiPendingChange, devices, setDevices, addAiMessage, clearAiPendingChange, saveHistory]);

  // Handler for "Continue Chatting" button from AI change proposal
  const handleDismissAiChange = useCallback(() => {
    if (!aiPendingChange) return;
    addAiMessage('system', '✗ Change cancelled - no modifications made');
    clearAiPendingChange();
  }, [aiPendingChange, addAiMessage, clearAiPendingChange]);

  // Auto-save history on state changes
  useEffect(() => { const t = setTimeout(saveHistory, 600); return () => clearTimeout(t); }, [devices, connections, buildings, saveHistory]);

  // Use the extended useFiltering hook
  const { filteredDevs, filteredConns } = useFiltering(
    devices,
    connections,
    searchQuery,
    filterVlan,
    viewMode,
    selectedBuilding,
    selectedFloor
  );

  // Context Menu Action Handlers
  const copyIpAddress = useCallback((deviceId) => {
    const device = devices[deviceId];
    if (device?.ip) {
      navigator.clipboard.writeText(device.ip).catch(err => console.error('Failed to copy IP:', err));
    }
  }, [devices]);

  const copyMacAddress = useCallback((deviceId) => {
    const device = devices[deviceId];
    if (device?.mac) {
      navigator.clipboard.writeText(device.mac).catch(err => console.error('Failed to copy MAC:', err));
    }
  }, [devices]);

  const startConnectionFrom = useCallback((deviceId) => {
    setConnecting({ from: deviceId, fromPort: '', toPort: '', startX: devices[deviceId].x, startY: devices[deviceId].y });
  }, [devices]);

  const addToSelection = useCallback((deviceId) => {
    setSelectedDevices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  }, []);

  const changeDeviceType = useCallback((deviceId, newType) => {
    setDevices(prev => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], type: newType }
    }));
  }, []);

  const setAsRootBridge = useCallback((deviceId) => {
    setDevices(prev => {
      const updated = { ...prev };
      // Clear old root
      Object.keys(updated).forEach(id => {
        if (updated[id].isRoot) {
          updated[id] = { ...updated[id], isRoot: false };
        }
      });
      // Set new root
      updated[deviceId] = { ...updated[deviceId], isRoot: true };
      return updated;
    });
  }, []);

  const copyDevices = useCallback(() => {
    const devicesToCopy = Array.from(selectedDevices).map(id => devices[id]).filter(Boolean);
    if (devicesToCopy.length > 0) {
      setCopiedDevices(devicesToCopy);
    }
  }, [selectedDevices, devices]);

  const pasteDevicesAt = useCallback((svgX, svgY) => {
    if (!copiedDevices || copiedDevices.length === 0) return;

    const idMap = {};
    const newDevices = { ...devices };

    // Calculate offset from first device
    const firstDevice = copiedDevices[0];
    const offsetX = svgX - (viewMode === 'logical' ? firstDevice.x : firstDevice.physicalX);
    const offsetY = svgY - (viewMode === 'logical' ? firstDevice.y : firstDevice.physicalY);

    copiedDevices.forEach(device => {
      const newId = genId('dev');
      idMap[device.id] = newId;

      const newX = viewMode === 'logical'
        ? Math.round((device.x + offsetX) / 20) * 20
        : device.physicalX + offsetX;
      const newY = viewMode === 'logical'
        ? Math.round((device.y + offsetY) / 20) * 20
        : device.physicalY + offsetY;

      newDevices[newId] = {
        ...device,
        id: newId,
        name: device.name + ' Copy',
        x: viewMode === 'logical' ? newX : device.x,
        y: viewMode === 'logical' ? newY : device.y,
        physicalX: viewMode === 'physical' ? newX : device.physicalX,
        physicalY: viewMode === 'physical' ? newY : device.physicalY,
        isRoot: false // Don't copy root bridge status
      };
    });

    setDevices(newDevices);
    setSelectedDevices(new Set(Object.values(idMap)));
  }, [copiedDevices, devices, viewMode]);

  // Override selectAllDevices from hook to use filteredDevs
  const selectAllDevicesFiltered = useCallback(() => {
    setSelectedDevices(new Set(Object.keys(filteredDevs)));
  }, [filteredDevs, setSelectedDevices]);

  const reverseConnection = useCallback((connectionId) => {
    setConnections(prev => ({
      ...prev,
      [connectionId]: {
        ...prev[connectionId],
        from: prev[connectionId].to,
        to: prev[connectionId].from,
        fromPort: prev[connectionId].toPort,
        toPort: prev[connectionId].fromPort
      }
    }));
  }, []);

  const changeConnectionType = useCallback((connectionId, newType) => {
    setConnections(prev => ({
      ...prev,
      [connectionId]: { ...prev[connectionId], type: newType }
    }));
  }, []);

  const changeConnectionSpeed = useCallback((connectionId, newSpeed) => {
    setConnections(prev => ({
      ...prev,
      [connectionId]: { ...prev[connectionId], speed: newSpeed }
    }));
  }, []);

  const deleteConnection = useCallback((connectionId) => {
    setConnections(prev => {
      const updated = { ...prev };
      delete updated[connectionId];
      return updated;
    });
    setSelectedConnection(null);
  }, []);

  // Context menu logic handled by useContextMenu hook
  const {
    handleDeviceContextMenu,
    handleConnectionContextMenu,
    handleRoomContextMenu,
    handleWallContextMenu,
    handleBuildingContextMenu,
    handleCanvasContextMenu,
    handleBuildingSave,
    handleBuildingDelete,
    handleRoomSave,
    handleRoomDelete,
    handleWallSave,
    handleWallDelete,
    getDeviceMenuItems,
    getConnectionMenuItems,
    getCanvasMenuItems,
    getBuildingMenuItems,
    getRoomMenuItems,
    getWallMenuItems
  } = useContextMenu({
    devices, setDevices,
    connections, setConnections,
    buildings, setBuildings,
    deviceTypes,
    connTypes,
    selectedDevices, setSelectedDevices,
    selectedConnection, setSelectedConnection,
    selectedRooms, setSelectedRooms,
    selectedWalls, setSelectedWalls,
    selectedBuilding, setSelectedBuilding,
    selectedFloor,
    setContextMenu,
    setShowBulkEdit,
    setEditingDevice,
    setEditingConnection,
    setEditingBuilding,
    setEditingRoom,
    setEditingWall,
    viewMode,
    copiedDevices,
    getSvgPt,
    genId,
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
    selectAllDevices: selectAllDevicesFiltered,
    resetView
  });

  // Mouse event handlers handled by useCanvasMouseEvents hook
  const {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDevDown,
    handleConnClick
  } = useCanvasMouseEvents({
    svgRef,
    viewMode,
    zoom, setZoom,
    pan, setPan,
    showGrid,
    selectedDevices, setSelectedDevices,
    selectedConnection, setSelectedConnection,
    setEditingConnection,
    selectionBox, setSelectionBox,
    selectedBuilding,
    selectedFloor,
    dragging, setDragging,
    isPanning, setIsPanning,
    panStart, setPanStart,
    connecting, setConnecting,
    mousePosition, setMousePosition,
    mouseDownPos, setMouseDownPos,
    drawingMode,
    drawingStart, setDrawingStart,
    resizingRoom, setResizingRoom,
    movingRooms, setMovingRooms,
    draggingBuilding, setDraggingBuilding,
    devices, setDevices,
    buildings, setBuildings,
    connections, setConnections,
    setContextMenu,
    getSvgPt,
    genId
  });

  const delDevices = useCallback((ids) => {
    setConnections(p => { const n = { ...p }; Object.keys(n).forEach(i => { if (ids.includes(n[i].from) || ids.includes(n[i].to)) delete n[i]; }); return n; });
    setDevices(p => { const n = { ...p }; ids.forEach(i => delete n[i]); return n; });
    setSelectedDevices(new Set());
  }, []);

  const handleImageUpload = (e) => {
    const f = e.target.files?.[0];
    if (f) { const r = new FileReader(); r.onload = (ev) => setFloorPlanImages(p => ({ ...p, [`${selectedBuilding}-${selectedFloor}`]: ev.target.result })); r.readAsDataURL(f); }
  };

  const addBuilding = () => {
    setEditingBuilding('new');
  };

  const duplicateSelected = useCallback(() => {
    const newDevs = {}, idMap = {};
    selectedDevices.forEach(id => {
      const dev = devices[id];
      const newId = genId('dev');
      idMap[id] = newId;
      newDevs[newId] = { ...dev, id: newId, name: dev.name + ' (copy)', x: dev.x + 40, y: dev.y + 40, physicalX: dev.physicalX + 20, physicalY: dev.physicalY + 20 };
    });
    setDevices(p => ({ ...p, ...newDevs }));
    setSelectedDevices(new Set(Object.keys(newDevs)));
  }, [selectedDevices, devices]);

  const findPathToWan = useCallback((startDeviceId) => {
    // 1. Find all WAN devices
    const wanDevices = Object.values(devices).filter(d => d.type === 'wan');

    if (wanDevices.length === 0) {
      return { found: false, reason: 'no-wan' };
    }

    // 2. Check if selected device is WAN
    if (devices[startDeviceId]?.type === 'wan') {
      return { found: false, reason: 'is-wan' };
    }

    // 3. Check if device has any connections
    const deviceConns = Object.values(connections).filter(c =>
      c.from === startDeviceId || c.to === startDeviceId
    );
    if (deviceConns.length === 0) {
      return { found: false, reason: 'disconnected' };
    }

    // 4. BFS to find shortest path to any WAN device
    const queue = [[startDeviceId, []]]; // [currentId, pathSoFar]
    const visited = new Set([startDeviceId]);

    while (queue.length > 0) {
      const [currentId, pathSoFar] = queue.shift();

      // Get all connections from current device
      const conns = Object.values(connections).filter(c =>
        c.from === currentId || c.to === currentId
      );

      for (const conn of conns) {
        const nextId = conn.from === currentId ? conn.to : conn.from;

        if (visited.has(nextId)) continue;
        visited.add(nextId);

        const nextDevice = devices[nextId];
        if (!nextDevice) continue;

        // Build path segment
        const segment = {
          deviceId: currentId,
          deviceName: devices[currentId].name,
          deviceType: devices[currentId].type,
          outPort: conn.from === currentId ? conn.fromPort : conn.toPort,
          connectionId: conn.id,
          cableType: conn.cableType,
          cableLength: conn.cableLength,
          speed: conn.speed,
          nextPort: conn.from === currentId ? conn.toPort : conn.fromPort,
          nextDeviceId: nextId,
          nextDeviceName: nextDevice.name
        };

        const newPath = [...pathSoFar, segment];

        // Check if we reached a WAN device
        if (nextDevice.type === 'wan') {
          return {
            found: true,
            path: newPath,
            wanDevice: { id: nextId, name: nextDevice.name }
          };
        }

        queue.push([nextId, newPath]);
      }
    }

    return { found: false, reason: 'no-path' };
  }, [devices, connections]);

  // Keyboard shortcuts handled by useKeyboardShortcuts hook
  useKeyboardShortcuts({
    viewMode, setViewMode,
    visibilityMode, setVisibilityMode,
    showGrid, setShowGrid,
    zoom, setZoom,
    setPan,
    circleScale, setCircleScale,
    deviceLabelScale, setDeviceLabelScale,
    portLabelScale, setPortLabelScale,
    selectedDevices, setSelectedDevices,
    selectedConnection, setSelectedConnection,
    selectedRooms, setSelectedRooms,
    selectedWalls, setSelectedWalls,
    selectedBuilding, selectedFloor,
    devices,
    tool, setTool,
    drawingMode, setDrawingMode,
    measurePoints, setMeasurePoints,
    resizingRoom, setResizingRoom,
    movingRooms, setMovingRooms,
    connecting, setConnecting,
    contextMenu, setContextMenu,
    aiChatOpen, setAiChatOpen,
    undo, redo,
    duplicateSelected, copyDevices, delDevices,
    setConnections,
    handleRoomDelete, handleWallDelete
  });

  const exportData = () => {
    const d = { devices, connections, vlans, buildings, interBuildingLinks, v: '3.1', t: new Date().toISOString() };
    const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'network-topology.json'; a.click();
  };

  const importData = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = (ev) => {
        try {
          const d = JSON.parse(ev.target.result);

          // Migrate devices to new format
          if (d.devices) {
            const migratedDevices = Object.entries(d.devices).reduce((acc, [id, dev]) => {
              acc[id] = migrateDeviceData(dev);
              return acc;
            }, {});
            setDevices(migratedDevices);
          }

          if (d.connections) setConnections(d.connections);
          if (d.vlans) setVlans(d.vlans);
          if (d.buildings) setBuildings(d.buildings);
          if (d.interBuildingLinks) setInterBuildingLinks(d.interBuildingLinks);
        } catch (err) {
          console.error('Import failed:', err);
        }
      };
      r.readAsText(f);
    }
  };

  // AI Chat service - mock implementation
  const sendAiMessage = async (message, context) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock responses based on context
    const responses = {
      greeting: "Hello! I'm here to help you with your network topology. I can answer questions about devices, connections, VLANs, and provide network design advice.",
      deviceCount: `Your network currently has ${Object.keys(context.devices).length} devices and ${Object.keys(context.connections).length} connections.`,
      default: "I understand your question. In a production environment, I would provide detailed network analysis and recommendations here."
    };

    // Simple keyword matching for demo
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) return responses.greeting;
    if (lowerMsg.includes('how many') || lowerMsg.includes('count')) return responses.deviceCount;

    return responses.default;
  };

  // LocalStorage helpers for conversation management
  const CONVERSATIONS_STORAGE_KEY = 'netmap_ai_conversations';
  const CURRENT_CONVERSATION_KEY = 'netmap_ai_current_conversation';
  const MAX_CONVERSATIONS = 50;

  const getAllConversations = () => {
    try {
      const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveConversations = (conversations) => {
    try {
      const toStore = conversations.slice(-MAX_CONVERSATIONS);
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn('Failed to save conversations:', e);
    }
  };

  const saveCurrentConversation = (messages, conversationId = null) => {
    if (messages.length === 0) return;

    const convId = conversationId || currentConversationId || `conv-${Date.now()}`;
    const conversations = getAllConversations();
    const existingIndex = conversations.findIndex(c => c.id === convId);

    // Generate title from first user message
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '') : 'New Conversation';

    const conversation = {
      id: convId,
      title,
      messages,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }

    saveConversations(conversations);
    localStorage.setItem(CURRENT_CONVERSATION_KEY, convId);
    if (!currentConversationId) {
      setCurrentConversationId(convId);
    }
  };

  const loadConversation = (conversationId) => {
    const conversations = getAllConversations();
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setAiMessages(conversation.messages);
      setCurrentConversationId(conversationId);
      localStorage.setItem(CURRENT_CONVERSATION_KEY, conversationId);
      setShowConversationHistory(false);
    }
  };

  const startNewConversation = () => {
    setAiMessages([]);
    setCurrentConversationId(null);
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
    setShowConversationHistory(false);
  };

  const deleteConversation = (conversationId) => {
    const conversations = getAllConversations().filter(c => c.id !== conversationId);
    saveConversations(conversations);
    if (currentConversationId === conversationId) {
      startNewConversation();
    }
  };

  // Minimap component extracted to /components/canvas/Minimap.jsx

  // VlanPanel component extracted to /components/panels/VlanPanel.jsx

  // AiChatPanel component extracted to /components/panels/AiChatPanel.jsx

  // PathToWan component extracted to /components/panels/PathToWan.jsx

  // ConnLine component extracted to /components/canvas/ConnLine.jsx

  // DevNode component extracted to /components/canvas/DevNode.jsx

  const handleRoomClick = (e, roomId) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setSelectedRooms(prev => {
        const newSet = new Set(prev);
        if (newSet.has(roomId)) newSet.delete(roomId);
        else newSet.add(roomId);
        return newSet;
      });
    } else {
      setSelectedRooms(new Set([roomId]));
    }
  };

  const handleRoomDoubleClick = (e, roomId) => {
    e.stopPropagation();
    const building = buildings[selectedBuilding];
    const floor = building.floors.find(f => f.id === selectedFloor);
    const room = floor.rooms.find(r => r.id === roomId);
    setEditingRoom({ room, buildingId: selectedBuilding, floorId: selectedFloor });
  };

  const handleWallClick = (e, wallId) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setSelectedWalls(prev => {
        const newSet = new Set(prev);
        if (newSet.has(wallId)) newSet.delete(wallId);
        else newSet.add(wallId);
        return newSet;
      });
    } else {
      setSelectedWalls(new Set([wallId]));
    }
  };

  const handleWallDoubleClick = (e, wallId) => {
    e.stopPropagation();
    const building = buildings[selectedBuilding];
    const floor = building.floors.find(f => f.id === selectedFloor);
    const wall = floor.walls.find(w => w.id === wallId);
    setEditingWall({ wall, buildingId: selectedBuilding, floorId: selectedFloor });
  };

  const handleResizeStart = (roomId, handleId, e) => {
    e.stopPropagation();
    const pt = getSvgPt(e);
    const building = buildings[selectedBuilding];
    const floor = building.floors.find(f => f.id === selectedFloor);
    const room = floor.rooms.find(r => r.id === roomId);
    setResizingRoom({
      roomId,
      handleId,
      startX: pt.x,
      startY: pt.y,
      startRoom: { ...room }
    });
  };

  const handleRoomMoveStart = (e, roomId) => {
    if (e.button !== 0 || !selectedRooms.has(roomId)) return; // Only left click on selected rooms
    e.stopPropagation();
    const pt = getSvgPt(e);
    const building = buildings[selectedBuilding];
    const floor = building.floors.find(f => f.id === selectedFloor);

    // Store starting positions for all selected rooms
    const startPositions = {};
    selectedRooms.forEach(id => {
      const room = floor.rooms.find(r => r.id === id);
      if (room) {
        startPositions[id] = { x: room.x, y: room.y };
      }
    });

    setMovingRooms({
      roomIds: Array.from(selectedRooms),
      startX: pt.x,
      startY: pt.y,
      startPositions
    });
  };

  const renderFloorPlan = () => {
    const b = buildings[selectedBuilding]; if (!b) return null;
    const floor = b.floors?.find(f => f.id === selectedFloor);
    if (!floor) return null;
    const rooms = floor.rooms || [];
    const walls = floor.walls || [];
    const imgKey = `${selectedBuilding}-${selectedFloor}`;
    return (
      <g transform={`translate(${b.x},${b.y})`}>
        <rect
          className="bg-layer"
          width={b.width}
          height={b.height}
          fill={b.color}
          stroke={theme.border}
          strokeWidth="2"
          rx="4"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditingBuilding(selectedBuilding);
          }}
          onMouseDown={(e) => {
            // Only drag building if clicking on empty space (not on room/wall) and not locked
            if (e.target.classList.contains('bg-layer') && !b.locked) {
              handleBuildingDragStart(e, selectedBuilding);
            }
          }}
          style={{ cursor: b.locked ? 'default' : (draggingBuilding?.buildingId === selectedBuilding ? 'grabbing' : 'grab') }}
        />
        {b.locked && (
          <g transform={`translate(${b.width - 25}, 5)`}>
            <circle cx="10" cy="10" r="10" fill="#ef4444" opacity="0.9" />
            <path d="M10 5a2.5 2.5 0 012.5 2.5v1.25h-5V7.5A2.5 2.5 0 0110 5zm3.5 5V7.5a3.5 3.5 0 10-7 0V10H5v7h10v-7h-1.5z" fill="white" transform="scale(0.6) translate(2,0)" />
          </g>
        )}
        {floorPlanImages[imgKey] && <image href={floorPlanImages[imgKey]} width={b.width} height={b.height} opacity={imageOpacity} preserveAspectRatio="xMidYMid slice" />}
        {rooms.map(r => {
          const isSelected = selectedRooms.has(r.id);
          const isSingleSelected = selectedRooms.size === 1 && isSelected;
          return (
            <g
              key={r.id}
              transform={`translate(${r.x},${r.y})`}
              onClick={(e) => handleRoomClick(e, r.id)}
              onDoubleClick={(e) => handleRoomDoubleClick(e, r.id)}
              onMouseDown={(e) => handleRoomMoveStart(e, r.id)}
              onContextMenu={(e) => handleRoomContextMenu(e, r.id)}
              style={{ cursor: isSelected ? 'move' : 'pointer' }}
            >
              <rect
                width={r.width}
                height={r.height}
                fill={r.color}
                stroke={isSelected ? '#3b82f6' : theme.border}
                strokeWidth={isSelected ? 3 : 1}
                strokeDasharray="4,2"
              />
              <text
                x={r.width / 2}
                y={r.height / 2}
                textAnchor="middle"
                fontSize="8"
                fill={theme.textMuted}
              >
                {r.name}
              </text>
              {showMeasurements && (
                <text
                  x={r.width / 2}
                  y={-3}
                  textAnchor="middle"
                  fontSize="7"
                  fill={theme.textMuted}
                >
                  {toDisplay(r.width)}{getUnit()}
                </text>
              )}
              {isSingleSelected && (
                <SelectionHandles
                  room={r}
                  onResizeStart={handleResizeStart}
                  theme={theme}
                />
              )}
            </g>
          );
        })}
        {walls.map(w => {
          const isSelected = selectedWalls.has(w.id);
          return (
            <line
              key={w.id}
              x1={w.x1}
              y1={w.y1}
              x2={w.x2}
              y2={w.y2}
              stroke={isSelected ? '#3b82f6' : theme.text}
              strokeWidth={isSelected ? 5 : 3}
              onClick={(e) => handleWallClick(e, w.id)}
              onDoubleClick={(e) => handleWallDoubleClick(e, w.id)}
              onContextMenu={(e) => handleWallContextMenu(e, w.id)}
              style={{ cursor: 'pointer' }}
            />
          );
        })}
        {showMeasurements && <><text x={b.width / 2} y={-8} textAnchor="middle" fontSize="10" fill={theme.text}>{toDisplay(b.width)} {getUnit()}</text><text x={b.width + 8} y={b.height / 2} fontSize="10" fill={theme.text} transform={`rotate(90,${b.width + 8},${b.height / 2})`}>{toDisplay(b.height)} {getUnit()}</text></>}
      </g>
    );
  };

  const renderMeasure = () => {
    if (measurePoints.length < 2) return null;
    return measurePoints.slice(0, -1).map((p, i) => {
      const p2 = measurePoints[i + 1], dist = Math.sqrt((p2.x - p.x) ** 2 + (p2.y - p.y) ** 2), mx = (p.x + p2.x) / 2, my = (p.y + p2.y) / 2;
      return <g key={i}><line x1={p.x} y1={p.y} x2={p2.x} y2={p2.y} stroke="#ef4444" strokeWidth="2" strokeDasharray="6,3" /><circle cx={p.x} cy={p.y} r="4" fill="#ef4444" /><circle cx={p2.x} cy={p2.y} r="4" fill="#ef4444" /><rect x={mx - 28} y={my - 10} width="56" height="18" fill="#fff" stroke="#ef4444" rx="4" /><text x={mx} y={my + 4} textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="600">{toDisplay(dist)} {getUnit()}</text></g>;
    });
  };

  const handleBuildingDragStart = (e, buildingId) => {
    e.stopPropagation();
    const building = buildings[buildingId];
    if (building?.locked) return; // Don't allow dragging locked buildings

    const pt = getSvgPt(e);
    setDraggingBuilding({
      buildingId,
      startX: pt.x,
      startY: pt.y,
      startBuildingPos: { x: building.x, y: building.y }
    });
  };

  // BuildingThumb component extracted to /components/canvas/BuildingThumb.jsx

  return (
    <div className="w-full h-screen flex flex-col" style={{ background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="h-12 px-3 flex items-center gap-2 border-b" style={{ background: theme.surface, borderColor: theme.border }}>
        <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white"><Icon d="M6 6m-3 0a3 3 0 106 0M18 6m-3 0a3 3 0 106 0M6 18m-3 0a3 3 0 106 0M18 18m-3 0a3 3 0 106 0M6 9v6M18 9v6M9 6h6M9 18h6" s={14} /></div><span className="font-bold">NetMap</span><span className="text-xs px-1.5 py-0.5 rounded" style={{ background: theme.bg }}>v3</span></div>
        <div className="w-px h-5" style={{ background: theme.border }} />
        <div className="flex rounded overflow-hidden" style={{ background: theme.bg }}>
          <button onClick={() => setViewMode('logical')} className="px-2.5 py-1 text-xs font-medium" style={viewMode === 'logical' ? { background: '#2563eb', color: 'white' } : { color: theme.text }}>Logical</button>
          <button onClick={() => setViewMode('physical')} className="px-2.5 py-1 text-xs font-medium" style={viewMode === 'physical' ? { background: '#2563eb', color: 'white' } : { color: theme.text }}>Physical</button>
        </div>
        {viewMode === 'physical' && <>
          <div className="w-px h-5" style={{ background: theme.border }} />
          <div className="flex rounded p-0.5 gap-0.5" style={{ background: theme.bg }}>
            <button onClick={() => setDrawingMode(drawingMode === 'wall' ? null : 'wall')} className="p-1.5 rounded transition-colors" style={drawingMode === 'wall' ? { background: '#f97316', color: 'white' } : { color: theme.text }} onMouseEnter={(e) => drawingMode !== 'wall' && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => drawingMode !== 'wall' && (e.currentTarget.style.background = 'transparent')} title="Draw Wall"><Icon d="M3 21V3h18v18" s={16} /></button>
            <button onClick={() => setDrawingMode(drawingMode === 'room' ? null : 'room')} className="p-1.5 rounded transition-colors" style={drawingMode === 'room' ? { background: '#a855f7', color: 'white' } : { color: theme.text }} onMouseEnter={(e) => drawingMode !== 'room' && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => drawingMode !== 'room' && (e.currentTarget.style.background = 'transparent')} title="Draw Room"><Icon d="M3 3h18v18H3zM9 3v18M15 3v18" s={16} /></button>
            <button onClick={() => setDrawingMode(drawingMode === 'measure' ? null : 'measure')} className="p-1.5 rounded transition-colors" style={drawingMode === 'measure' ? { background: '#ef4444', color: 'white' } : { color: theme.text }} onMouseEnter={(e) => drawingMode !== 'measure' && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => drawingMode !== 'measure' && (e.currentTarget.style.background = 'transparent')} title="Measure"><Icon d="M2 12h20M12 2v20" s={16} /></button>
            <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} title="Upload Floor Plan"><Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12M8 8l4-4 4 4" s={16} /></button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
          <select value={measurementUnit} onChange={(e) => setMeasurementUnit(e.target.value)} className="px-2 py-1 rounded text-xs border" style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}><option value="imperial">Feet</option><option value="metric">Meters</option></select>
          <button onClick={() => setShowMeasurements(!showMeasurements)} className="p-1.5 rounded transition-colors" style={showMeasurements ? { background: theme.buttonActive, color: theme.buttonActiveText } : { color: theme.text }} onMouseEnter={(e) => !showMeasurements && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => !showMeasurements && (e.currentTarget.style.background = 'transparent')} title="Measurements"><Icon d="M6 6l12 12M6 18L18 6" s={16} /></button>
          <div className="w-px h-5" style={{ background: theme.border }} />
          <button onClick={() => setVisibilityMode(!visibilityMode)} className="p-1.5 rounded transition-colors" style={visibilityMode ? { background: theme.buttonActive, color: theme.buttonActiveText } : { color: theme.text }} onMouseEnter={(e) => !visibilityMode && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => !visibilityMode && (e.currentTarget.style.background = 'transparent')} title="Visibility Mode (V) - Keep device size constant when zooming"><Icon d={visibilityMode ? "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z" : "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22"} s={16} /></button>
          {visibilityMode && <div className="flex items-center gap-1 px-2"><span className="text-xs" style={{ color: theme.textMuted }}>Size:</span><button onClick={() => setVisibilityModeSize('small')} className="px-2 py-0.5 rounded text-xs transition-colors" style={visibilityModeSize === 'small' ? { background: theme.buttonActive, color: theme.buttonActiveText } : { color: theme.text }} onMouseEnter={(e) => visibilityModeSize !== 'small' && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => visibilityModeSize !== 'small' && (e.currentTarget.style.background = 'transparent')}>S</button><button onClick={() => setVisibilityModeSize('medium')} className="px-2 py-0.5 rounded text-xs transition-colors" style={visibilityModeSize === 'medium' ? { background: theme.buttonActive, color: theme.buttonActiveText } : { color: theme.text }} onMouseEnter={(e) => visibilityModeSize !== 'medium' && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => visibilityModeSize !== 'medium' && (e.currentTarget.style.background = 'transparent')}>M</button><button onClick={() => setVisibilityModeSize('large')} className="px-2 py-0.5 rounded text-xs transition-colors" style={visibilityModeSize === 'large' ? { background: theme.buttonActive, color: theme.buttonActiveText } : { color: theme.text }} onMouseEnter={(e) => visibilityModeSize !== 'large' && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => visibilityModeSize !== 'large' && (e.currentTarget.style.background = 'transparent')}>L</button></div>}
        </>}
        <div className="w-px h-5" style={{ background: theme.border }} />
        <button onClick={() => setShowGrid(g => !g)} className="p-1.5 rounded transition-colors" style={showGrid ? { background: theme.buttonActive, color: theme.buttonActiveText } : { color: theme.text }} onMouseEnter={(e) => !showGrid && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => !showGrid && (e.currentTarget.style.background = 'transparent')} title="Toggle grid (G)"><Icon d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" s={16} /></button>
        <button onClick={() => setDarkMode(d => !d)} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} title="Toggle dark mode"><Icon d={darkMode ? 'M12 3v1M12 20v1M4.2 4.2l.7.7M18.4 18.4l.7.7M3 12h1M20 12h1' : 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'} s={16} /></button>
        {viewMode === 'logical' && <>
          <div className="w-px h-5" style={{ background: theme.border }} />
          <button onClick={() => setShowMinimap(m => !m)} className="p-1.5 rounded transition-colors" style={showMinimap ? { background: theme.buttonActive, color: theme.buttonActiveText } : { color: theme.text }} onMouseEnter={(e) => !showMinimap && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => !showMinimap && (e.currentTarget.style.background = 'transparent')} title="Minimap"><Icon d="M9 9h6v6H9zM3 3h18v18H3z" s={16} /></button>
        </>}
        <div className="w-px h-5" style={{ background: theme.border }} />
        <button onClick={undo} disabled={historyIdx <= 0} className="p-1.5 rounded transition-colors disabled:opacity-30" style={{ color: theme.text }} onMouseEnter={(e) => historyIdx > 0 && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} title="Undo (Ctrl+Z)"><Icon d="M9 14l-4-4 4-4M5 10h11a4 4 0 110 8h-1" s={16} /></button>
        <button onClick={redo} disabled={historyIdx >= history.length - 1} className="p-1.5 rounded transition-colors disabled:opacity-30" style={{ color: theme.text }} onMouseEnter={(e) => historyIdx < history.length - 1 && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} title="Redo (Ctrl+Y)"><Icon d="M15 14l4-4-4-4M19 10H8a4 4 0 100 8h1" s={16} /></button>
        <div className="w-px h-5" style={{ background: theme.border }} />
        <button onClick={() => setCircleScale(s => Math.max(s - 0.1, 0.5))} disabled={viewMode === 'physical' && visibilityMode} className="p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: theme.text }} title="Shrink circles" onMouseEnter={(e) => !(viewMode === 'physical' && visibilityMode) && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M5 12h14" s={16} /></button>
        <span className="px-2 text-xs font-medium w-12 text-center">{Math.round(circleScale * 100)}%</span>
        <button onClick={() => setCircleScale(s => Math.min(s + 0.1, 2.5))} disabled={viewMode === 'physical' && visibilityMode} className="p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: theme.text }} title="Grow circles" onMouseEnter={(e) => !(viewMode === 'physical' && visibilityMode) && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M12 5v14M5 12h14" s={16} /></button>
        <div className="w-px h-5" style={{ background: theme.border }} />
        <button onClick={() => setDeviceLabelScale(s => Math.max(s - 0.1, 0.5))} disabled={viewMode === 'physical' && visibilityMode} className="p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: theme.text }} title="Shrink device labels (;)" onMouseEnter={(e) => !(viewMode === 'physical' && visibilityMode) && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M5 12h14" s={16} /></button>
        <span className="px-2 text-xs font-medium w-12 text-center">{Math.round(deviceLabelScale * 100)}%</span>
        <button onClick={() => setDeviceLabelScale(s => Math.min(s + 0.1, 2.5))} disabled={viewMode === 'physical' && visibilityMode} className="p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: theme.text }} title="Grow device labels (')" onMouseEnter={(e) => !(viewMode === 'physical' && visibilityMode) && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M12 5v14M5 12h14" s={16} /></button>
        <div className="w-px h-5" style={{ background: theme.border }} />
        <button onClick={() => setPortLabelScale(s => Math.max(s - 0.1, 0.5))} disabled={viewMode === 'physical' && visibilityMode} className="p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: theme.text }} title="Shrink port labels ({)" onMouseEnter={(e) => !(viewMode === 'physical' && visibilityMode) && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M5 12h14" s={16} /></button>
        <span className="px-2 text-xs font-medium w-12 text-center">{Math.round(portLabelScale * 100)}%</span>
        <button onClick={() => setPortLabelScale(s => Math.min(s + 0.1, 2.5))} disabled={viewMode === 'physical' && visibilityMode} className="p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: theme.text }} title="Grow port labels (})" onMouseEnter={(e) => !(viewMode === 'physical' && visibilityMode) && (e.currentTarget.style.background = theme.hover)} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M12 5v14M5 12h14" s={16} /></button>
        <div className="flex-1" />
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-32 px-2 py-1 rounded text-xs border" style={{ background: theme.bg, borderColor: theme.border, color: theme.text }} />
        {viewMode === 'logical' && <button onClick={() => setShowVlanPanel(!showVlanPanel)} className="px-2 py-1 rounded text-xs font-medium transition-colors" style={showVlanPanel ? { background: '#2563eb', color: 'white' } : { background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}>VLANs {filterVlan !== null && <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-500 text-white text-xs">{filterVlan}</span>}</button>}
        <div className="w-px h-5" style={{ background: theme.border }} />
        <label className="px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>Import<input type="file" accept=".json" onChange={importData} className="hidden" /></label>
        <button onClick={exportData} className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white">Export</button>
        <button
          onClick={() => setAiChatOpen(!aiChatOpen)}
          className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
          style={aiChatOpen
            ? { background: '#2563eb', color: 'white' }
            : { background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }
          }
          onMouseEnter={(e) => !aiChatOpen && (e.currentTarget.style.background = theme.hover)}
          onMouseLeave={(e) => !aiChatOpen && (e.currentTarget.style.background = theme.bg)}
          title="AI Assistant (Ctrl+I)"
        >
          <Icon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" s={14} />
          <span>AI Chat</span>
        </button>
      </div>
      {drawingMode && <div className="px-3 py-1.5 text-xs flex items-center gap-2" style={{ background: theme.bg, borderBottom: `1px solid ${theme.border}` }}><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />{drawingMode === 'wall' && 'Click & drag to draw wall'}{drawingMode === 'room' && 'Click & drag to draw room'}{drawingMode === 'measure' && `Click points to measure (${measurePoints.length} pts)`}</div>}
      {visibilityMode && viewMode === 'physical' && <div className="px-3 py-1.5 text-xs flex items-center gap-2" style={{ background: '#3b82f6', color: 'white', borderBottom: `1px solid ${theme.border}` }}><span className="w-1.5 h-1.5 rounded-full bg-white" />Visibility Mode Active ({visibilityModeSize === 'small' ? 'Small' : visibilityModeSize === 'medium' ? 'Medium' : 'Large'}) - Devices maintain constant screen size</div>}
      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'physical' && Object.keys(buildings).length === 0 && (
          <EmptyStatePanel
            onCreateBuilding={addBuilding}
            onImport={() => document.querySelector('input[type="file"][accept=".json"]')?.click()}
            theme={theme}
          />
        )}
        <svg ref={svgRef} className="w-full h-full" onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onContextMenu={handleCanvasContextMenu} style={{ cursor: connecting ? 'crosshair' : drawingMode ? 'crosshair' : isPanning ? 'grabbing' : 'grab' }}>
          <defs><pattern id="gs" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke={theme.grid} strokeWidth="0.5" /></pattern><pattern id="gl" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke={theme.gridL} strokeWidth="1" /></pattern></defs>
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {showGrid && (() => {
              const bounds = getGridBounds();
              return <>
                <rect x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height} fill="url(#gs)" className="bg-layer" />
                <rect x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height} fill="url(#gl)" className="bg-layer" />
              </>;
            })()}
            {viewMode === 'logical' ? <>
              {Object.values(filteredConns).map(c => (
                <ConnLine
                  key={c.id}
                  connection={c}
                  fromDevice={filteredDevs[c.from]}
                  toDevice={filteredDevs[c.to]}
                  isSelected={selectedConnection === c.id}
                  isHovered={hoveredConn === c.id}
                  isHighlighted={highlightedPath?.connections.has(c.id)}
                  highlightedPath={highlightedPath}
                  theme={theme}
                  circleScale={circleScale}
                  portLabelScale={portLabelScale}
                  isPhysical={false}
                  showMeasurements={showMeasurements}
                  measurementUnit={measurementUnit}
                  onConnClick={handleConnClick}
                  onDoubleClick={setEditingConnection}
                  onMouseEnter={setHoveredConn}
                  onMouseLeave={() => setHoveredConn(null)}
                  onContextMenu={handleConnectionContextMenu}
                />
              ))}
              {connecting && devices[connecting.from] && <circle cx={devices[connecting.from].x} cy={devices[connecting.from].y} r="45" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3" opacity="0.5" />}
              {connecting && devices[connecting.from] && mousePosition && (
                <line
                  x1={devices[connecting.from].x}
                  y1={devices[connecting.from].y}
                  x2={mousePosition.x}
                  y2={mousePosition.y}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  opacity="0.6"
                  pointerEvents="none"
                />
              )}
              {Object.values(filteredDevs).map(d => (
                <DevNode
                  key={d.id}
                  device={d}
                  isSelected={selectedDevices.has(d.id)}
                  isHighlighted={highlightedPath?.devices.has(d.id)}
                  isConnecting={connecting === d.id}
                  isValidTarget={connecting && connecting.from !== d.id}
                  highlightedPath={highlightedPath}
                  theme={theme}
                  circleScale={circleScale}
                  deviceLabelScale={deviceLabelScale}
                  isPhysical={false}
                  visibilityMode={false}
                  visibilityModeSize="medium"
                  zoom={zoom}
                  onMouseDown={handleDevDown}
                  onDoubleClick={(id) => { setEditingDevice(id); setSelectedDevices(new Set([id])); }}
                  onContextMenu={handleDeviceContextMenu}
                />
              ))}
            </> : <>
              {Object.values(buildings).map(b => b.id === selectedBuilding ? null : <BuildingThumb key={b.id} building={b} devices={devices} isSelected={selectedBuilding === b.id} isDragging={draggingBuilding?.buildingId === b.id} theme={theme} onBuildingClick={setSelectedBuilding} onDoubleClick={setEditingBuilding} onMouseDown={handleBuildingDragStart} onContextMenu={handleBuildingContextMenu} />)}
              {selectedBuilding && renderFloorPlan()}
              {interBuildingLinks.map(l => { const f = buildings[l.from], t = buildings[l.to]; if (!f || !t) return null; return <g key={l.id}><line x1={f.x + f.width / 2} y1={f.y + f.height / 2} x2={t.x + t.width / 2} y2={t.y + t.height / 2} stroke="#eab308" strokeWidth="3" strokeDasharray="10,5" /><text x={(f.x + t.x + f.width / 2 + t.width / 2) / 2} y={(f.y + t.y + f.height / 2 + t.height / 2) / 2 - 8} textAnchor="middle" fontSize="9" fill="#eab308" fontWeight="600">{l.label}</text></g>; })}
              {selectedBuilding && (
                <g transform={`translate(${buildings[selectedBuilding].x},${buildings[selectedBuilding].y})`}>
                  {Object.values(filteredConns).map(c => (
                    <ConnLine
                      key={c.id}
                      connection={c}
                      fromDevice={filteredDevs[c.from]}
                      toDevice={filteredDevs[c.to]}
                      isSelected={selectedConnection === c.id}
                      isHovered={hoveredConn === c.id}
                      isHighlighted={highlightedPath?.connections.has(c.id)}
                      highlightedPath={highlightedPath}
                      theme={theme}
                      circleScale={circleScale}
                      portLabelScale={portLabelScale}
                      isPhysical={true}
                      showMeasurements={showMeasurements}
                      measurementUnit={measurementUnit}
                      onConnClick={handleConnClick}
                      onDoubleClick={setEditingConnection}
                      onMouseEnter={setHoveredConn}
                      onMouseLeave={() => setHoveredConn(null)}
                      onContextMenu={handleConnectionContextMenu}
                    />
                  ))}
                  {Object.values(filteredDevs).map(d => (
                    <DevNode
                      key={d.id}
                      device={d}
                      isSelected={selectedDevices.has(d.id)}
                      isHighlighted={highlightedPath?.devices.has(d.id)}
                      isConnecting={connecting === d.id}
                      isValidTarget={connecting && connecting.from !== d.id}
                      highlightedPath={highlightedPath}
                      theme={theme}
                      circleScale={circleScale}
                      deviceLabelScale={deviceLabelScale}
                      isPhysical={true}
                      visibilityMode={visibilityMode}
                      visibilityModeSize={visibilityModeSize}
                      zoom={zoom}
                      onMouseDown={handleDevDown}
                      onDoubleClick={(id) => { setEditingDevice(id); setSelectedDevices(new Set([id])); }}
                      onContextMenu={handleDeviceContextMenu}
                    />
                  ))}
                </g>
              )}
              {drawingMode === 'measure' && renderMeasure()}
            </>}
            {selectionBox && (
              <rect
                x={Math.min(selectionBox.startX, selectionBox.endX)}
                y={Math.min(selectionBox.startY, selectionBox.endY)}
                width={Math.abs(selectionBox.endX - selectionBox.startX)}
                height={Math.abs(selectionBox.endY - selectionBox.startY)}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
                pointerEvents="none"
              />
            )}
          </g>
        </svg>
        {viewMode === 'physical' && <div className="absolute top-2 left-2 w-52 rounded-lg shadow-lg overflow-hidden" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}><div className="px-3 py-2 border-b flex items-center justify-between text-sm font-medium" style={{ borderColor: theme.border }}>Buildings<button onClick={addBuilding} className="p-1 rounded transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M12 5v14M5 12h14" s={14} /></button></div><div className="p-2 space-y-1 max-h-48 overflow-y-auto">{Object.values(buildings).map(b => <div key={b.id} onClick={() => setSelectedBuilding(b.id)} className={`p-2 rounded cursor-pointer text-xs ${selectedBuilding === b.id ? 'ring-2 ring-blue-500' : ''}`} style={{ background: b.color }}><div className="font-medium">{b.name}</div><div style={{ color: theme.textMuted }}>{toDisplay(b.width)} × {toDisplay(b.height)} {getUnit()}</div></div>)}</div>{selectedBuilding && <div className="p-2 border-t" style={{ borderColor: theme.border }}><select value={selectedFloor} onChange={(e) => setSelectedFloor(parseInt(e.target.value))} className="w-full px-2 py-1 rounded text-xs border" style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}>{(buildings[selectedBuilding]?.floors || []).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>}</div>}
        {viewMode === 'logical' && showVlanPanel && (
          <VlanPanel
            vlans={vlans}
            filterVlan={filterVlan}
            onFilterChange={setFilterVlan}
            onClose={() => setShowVlanPanel(false)}
            onEditVlan={setEditingVlan}
            onAddVlan={() => setEditingVlan({ vlan: null, vlanId: null })}
            theme={theme}
          />
        )}
        {viewMode === 'logical' && showMinimap && (
          <Minimap
            devices={devices}
            connections={connections}
            selectedDevices={selectedDevices}
            pan={pan}
            zoom={zoom}
            svgRef={svgRef}
            theme={theme}
          />
        )}
        <AiChatPanel
          isOpen={aiChatOpen}
          onClose={() => setAiChatOpen(false)}
          theme={theme}
          messages={aiMessages}
          streamingMessage={streamingMessage}
          inputValue={aiInputValue}
          setInputValue={setAiInputValue}
          isLoading={aiIsLoading}
          onSendMessage={handleSendAiMessage}
          onClearChat={clearAiChat}
          includeNetworkContext={includeNetworkContext}
          onToggleContext={setIncludeNetworkContext}
          error={aiError}
          devices={devices}
          deviceTypes={deviceTypes}
          getDevColor={getDevColor}
          pendingChange={aiPendingChange}
          onApproveChange={handleApproveAiChange}
          onDismissChange={handleDismissAiChange}
          onAddDevice={handleAddSuggestedDevice}
          onDeclineSuggestion={handleDeclineSuggestion}
          pendingDeviceBatch={aiPendingDeviceBatch}
          onApproveBatchDevices={handleApproveBatchDevices}
          onDeclineBatchDevices={handleDeclineBatchDevices}
        />
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg shadow p-1" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}><button onClick={() => setZoom(z => Math.max(z * 0.8, 0.15))} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M5 12h14" s={14} /></button><span className="px-2 text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span><button onClick={() => setZoom(z => Math.min(z * 1.2, 5))} className="p-1.5 rounded transition-colors" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Icon d="M12 5v14M5 12h14" s={14} /></button><button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="px-2 py-1 rounded transition-colors text-xs" style={{ color: theme.text }} onMouseEnter={(e) => e.currentTarget.style.background = theme.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>Reset</button></div>
        <div className="absolute top-0 right-0 bottom-0 w-64 border-l overflow-y-auto" style={{ background: theme.surface, borderColor: theme.border, zIndex: 40 }}>
          {selectedDevices.size === 1 && (() => { const d = devices[[...selectedDevices][0]]; if (!d) return null; return <div className="p-3"><div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: getDevColor(d) + '20', color: getDevColor(d) }}><Icon d={deviceTypes.find(t => t.value === d.type)?.icon || ''} s={18} /></div><div className="flex-1 min-w-0"><h3 className="font-bold text-sm truncate">{d.name}</h3><p className="text-xs" style={{ color: theme.textMuted }}>{deviceTypes.find(t => t.value === d.type)?.label}</p></div><div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[d.status] }} /></div>{d.ip && <div className="mb-1.5"><span className="text-xs" style={{ color: theme.textMuted }}>IP</span><p className="font-mono text-xs">{d.ip}</p></div>}{d.mac && <div className="mb-1.5"><span className="text-xs" style={{ color: theme.textMuted }}>MAC</span><p className="font-mono text-xs">{d.mac}</p></div>}<div className="mb-1.5"><span className="text-xs" style={{ color: theme.textMuted }}>Location</span><p className="text-xs">{buildings[d.buildingId]?.name || 'Not Assigned'}</p></div>{d.locked && (<div className="mb-2 p-2 rounded" style={{ background: '#fef3c7', border: '1px solid #f59e0b' }}><div className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg><div><span className="text-xs font-semibold" style={{ color: '#92400e' }}>Position Locked</span><p className="text-xs" style={{ color: '#78350f' }}>This device cannot be moved. Edit to unlock.</p></div></div></div>)}{d.vlans?.length > 0 && <div className="mb-2"><span className="text-xs" style={{ color: theme.textMuted }}>VLANs</span><div className="flex flex-wrap gap-1 mt-0.5">{d.vlans.map(v => vlans[v] && <span key={v} className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: vlans[v].color + '20', color: vlans[v].color }}>{v}</span>)}</div></div>}{d.notes && <div className="mb-2"><span className="text-xs" style={{ color: theme.textMuted }}>Notes</span><p className="text-xs whitespace-pre-wrap">{d.notes}</p></div>}<PathToWan deviceId={d.id} devices={devices} connections={connections} theme={theme} onHighlightPath={setHighlightedPath} getUnit={getUnit} /><button onClick={() => setEditingDevice(d.id)} className="w-full py-1.5 text-xs font-medium bg-blue-600 text-white rounded">Edit</button></div>; })()}
          {selectedDevices.size > 1 && <div className="p-3"><h3 className="font-bold text-sm mb-3">{selectedDevices.size} Devices Selected</h3><div className="space-y-2"><button onClick={() => setShowBulkEdit(true)} className="w-full py-2 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">Bulk Edit</button><button onClick={() => duplicateSelected()} className="w-full py-2 text-xs font-medium rounded" style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}>Duplicate All</button><button onClick={() => delDevices([...selectedDevices])} className="w-full py-2 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700">Delete All</button></div></div>}
          {selectedConnection && (() => { const c = connections[selectedConnection]; if (!c) return null; return <div className="p-3"><h3 className="font-bold text-sm mb-2">Connection</h3><div className="text-center p-2 rounded mb-2 text-xs" style={{ background: theme.bg }}><div>{devices[c.from]?.name} <span className="font-mono" style={{ color: theme.textMuted }}>{c.fromPort || '?'}</span></div><div className="my-0.5">↕</div><div>{devices[c.to]?.name} <span className="font-mono" style={{ color: theme.textMuted }}>{c.toPort || '?'}</span></div></div><div className="space-y-1 text-xs mb-2"><div className="flex justify-between"><span style={{ color: theme.textMuted }}>Type</span><span>{connTypes.find(t => t.value === c.type)?.label}</span></div><div className="flex justify-between"><span style={{ color: theme.textMuted }}>Speed</span><span>{c.speed}</span></div><div className="flex justify-between"><span style={{ color: theme.textMuted }}>Cable</span><span>{cableTypes.find(t => t.value === c.cableType)?.label}</span></div>{c.cableLength > 0 && <div className="flex justify-between"><span style={{ color: theme.textMuted }}>Length</span><span>{c.cableLength} {getUnit()}</span></div>}</div><button onClick={() => setEditingConnection(c.id)} className="w-full py-1.5 text-xs font-medium bg-blue-600 text-white rounded">Edit</button></div>; })()}
          {selectedDevices.size === 0 && !selectedConnection && <div className="p-4 text-center" style={{ color: theme.textMuted }}><div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: theme.bg }}><Icon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" s={24} /></div><p className="text-xs mb-3">Select device or connection</p><div className="text-xs text-left space-y-0.5"><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>V</kbd> Select</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>A</kbd> Add</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>C</kbd> Connect</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>Del</kbd> Delete</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>Shift+Click</kbd> Multi-select</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>Ctrl+Drag</kbd> Box select</p><p>Drag selected to move all</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>Ctrl+Z</kbd> Undo</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>Ctrl+D</kbd> Duplicate</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>[</kbd> Shrink circles</p><p><kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>]</kbd> Grow circles</p></div></div>}
        </div>
      </div>
      <div className="h-6 px-3 flex items-center gap-3 text-xs border-t" style={{ background: theme.surface, borderColor: theme.border, color: theme.textMuted }}><span>{Object.keys(devices).length} devices</span><span>{Object.keys(connections).length} connections</span>{viewMode === 'logical' ? <span>{Object.keys(vlans).length} VLANs</span> : <span>{Object.keys(buildings).length} buildings</span>}{filterVlan !== null && <span style={{ color: '#3b82f6' }}>Filtered: VLAN {filterVlan}</span>}{searchQuery && <span style={{ color: '#3b82f6' }}>Search: "{searchQuery}"</span>}<div className="flex-1" />{viewMode === 'physical' ? <span>{measurementUnit === 'imperial' ? 'Feet' : 'Meters'}</span> : null}<span>Zoom: {Math.round(zoom * 100)}%</span></div>
      {contextMenu.visible && (
        <ContextMenu
          visible={contextMenu.visible}
          x={contextMenu.x}
          y={contextMenu.y}
          items={
            contextMenu.type === 'device'
              ? getDeviceMenuItems(contextMenu.targetId)
              : contextMenu.type === 'connection'
              ? getConnectionMenuItems(contextMenu.targetId)
              : contextMenu.type === 'building'
              ? getBuildingMenuItems(contextMenu.targetData.buildingId)
              : contextMenu.type === 'room'
              ? getRoomMenuItems(contextMenu.targetData.buildingId, contextMenu.targetData.floorId, contextMenu.targetData.roomId)
              : contextMenu.type === 'wall'
              ? getWallMenuItems(contextMenu.targetData.buildingId, contextMenu.targetData.floorId, contextMenu.targetData.wallId)
              : getCanvasMenuItems(contextMenu.targetData.svgX, contextMenu.targetData.svgY)
          }
          onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
          theme={theme}
        />
      )}
      {showBulkEdit && (
        <BulkEditModal
          selectedDeviceIds={Array.from(selectedDevices)}
          devices={devices}
          buildings={buildings}
          vlans={vlans}
          onClose={() => setShowBulkEdit(false)}
          onUpdate={handleBulkDeviceUpdate}
          theme={theme}
        />
      )}
      {editingDevice && (
        <DevModal
          device={devices[editingDevice]}
          deviceId={editingDevice}
          onClose={handleCloseDevModal}
          onUpdate={handleDeviceUpdate}
          theme={theme}
          deviceTypes={deviceTypes}
          statusColors={statusColors}
          buildings={buildings}
          vlans={vlans}
        />
      )}
      {editingConnection && (
        <ConnModal
          connection={connections[editingConnection]}
          connectionId={editingConnection}
          devices={devices}
          onClose={handleCloseConnModal}
          onUpdate={handleConnectionUpdate}
          theme={theme}
          connTypes={connTypes}
          speeds={speeds}
          cableTypes={cableTypes}
          vlans={vlans}
          getUnit={getUnit}
        />
      )}
      {editingVlan && (
        <VlanModal
          vlan={editingVlan.vlan}
          vlanId={editingVlan.vlanId}
          onClose={() => setEditingVlan(null)}
          onSave={handleVlanSave}
          onDelete={handleVlanDelete}
          theme={theme}
          existingVlans={vlans}
        />
      )}
      {editingBuilding && (
        <BuildingModal
          building={editingBuilding === 'new' ? null : buildings[editingBuilding]}
          onClose={() => setEditingBuilding(null)}
          onSave={handleBuildingSave}
          onDelete={handleBuildingDelete}
          theme={theme}
        />
      )}
      {editingRoom && (
        <RoomModal
          room={editingRoom.room}
          buildingId={editingRoom.buildingId}
          floorId={editingRoom.floorId}
          onClose={() => setEditingRoom(null)}
          onSave={handleRoomSave}
          onDelete={handleRoomDelete}
          theme={theme}
        />
      )}
      {editingWall && (
        <WallModal
          wall={editingWall.wall}
          buildingId={editingWall.buildingId}
          floorId={editingWall.floorId}
          onClose={() => setEditingWall(null)}
          onSave={handleWallSave}
          onDelete={handleWallDelete}
          theme={theme}
        />
      )}
    </div>
  );
};

export default NetworkTopologyEditor;
