import { useState, useCallback } from 'react';

/**
 * useUIState Hook
 *
 * Manages all UI-related state including:
 * - Context menu
 * - Search and filtering
 * - Floor plan images
 * - Highlighted paths
 * - AI chat (placeholder)
 * - Clipboard
 */
export const useUIState = () => {
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    type: null,
    targetId: null,
    targetData: null
  });
  const [hoveredConn, setHoveredConn] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVlan, setFilterVlan] = useState(null);
  const [copiedDevices, setCopiedDevices] = useState(null);
  const [floorPlanImages, setFloorPlanImages] = useState({});
  const [imageOpacity, setImageOpacity] = useState(0.5);
  const [highlightedPath, setHighlightedPath] = useState(null);
  const [showMeasurements, setShowMeasurements] = useState(true);

  // AI chat state
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInputValue, setAiInputValue] = useState('');
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [includeNetworkContext, setIncludeNetworkContext] = useState(true);
  const [aiError, setAiError] = useState(null);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [aiPendingChange, setAiPendingChange] = useState(null);
  const [aiPendingDeviceBatch, setAiPendingDeviceBatch] = useState(null);
  const [pendingConnectionSuggestion, setPendingConnectionSuggestion] = useState(null);
  const [pendingVlanSuggestion, setPendingVlanSuggestion] = useState(null);
  const [securityReport, setSecurityReport] = useState(null);
  const [showMerakiImport, setShowMerakiImport] = useState(false);

  // Helper functions
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterVlan(null);
  }, []);

  // AI chat helper functions
  const addAiMessage = useCallback((role, content, data = null) => {
    // Validate content is not empty for non-special message types
    if (role !== 'device_suggestion' && (!content || content.trim().length === 0)) {
      console.warn('Attempted to add message with empty content:', { role, content });
      return;
    }

    const newMessage = {
      role,
      type: role, // For backwards compatibility
      content,
      data, // For device suggestions and other special message types
      timestamp: new Date()
    };
    setAiMessages(prev => [...prev, newMessage]);
  }, []);

  const clearAiChat = useCallback(() => {
    setAiMessages([]);
    setAiInputValue('');
    setStreamingMessage('');
    setAiError(null);
    setAiIsLoading(false);
    setAiPendingChange(null);
  }, []);

  const clearAiPendingChange = useCallback(() => {
    setAiPendingChange(null);
  }, []);

  const clearAiPendingDeviceBatch = useCallback(() => {
    setAiPendingDeviceBatch(null);
  }, []);

  const clearConnectionSuggestion = useCallback(() => {
    setPendingConnectionSuggestion(null);
  }, []);

  const clearVlanSuggestion = useCallback(() => {
    setPendingVlanSuggestion(null);
  }, []);

  const clearSecurityReport = useCallback(() => {
    setSecurityReport(null);
  }, []);

  return {
    // Context menu
    contextMenu,
    setContextMenu,
    closeContextMenu,

    // Hover state
    hoveredConn,
    setHoveredConn,

    // Search and filtering
    searchQuery,
    setSearchQuery,
    filterVlan,
    setFilterVlan,
    clearFilters,

    // Clipboard
    copiedDevices,
    setCopiedDevices,

    // Floor plan images
    floorPlanImages,
    setFloorPlanImages,
    imageOpacity,
    setImageOpacity,

    // Path highlighting
    highlightedPath,
    setHighlightedPath,

    // Measurements
    showMeasurements,
    setShowMeasurements,

    // AI chat
    aiChatOpen,
    setAiChatOpen,
    aiMessages,
    setAiMessages,
    aiInputValue,
    setAiInputValue,
    aiIsLoading,
    setAiIsLoading,
    streamingMessage,
    setStreamingMessage,
    includeNetworkContext,
    setIncludeNetworkContext,
    aiError,
    setAiError,
    addAiMessage,
    clearAiChat,
    showConversationHistory,
    setShowConversationHistory,
    currentConversationId,
    setCurrentConversationId,
    aiPendingChange,
    setAiPendingChange,
    clearAiPendingChange,
    aiPendingDeviceBatch,
    setAiPendingDeviceBatch,
    clearAiPendingDeviceBatch,

    // New AI suggestion types
    pendingConnectionSuggestion,
    setPendingConnectionSuggestion,
    clearConnectionSuggestion,
    pendingVlanSuggestion,
    setPendingVlanSuggestion,
    clearVlanSuggestion,
    securityReport,
    setSecurityReport,
    clearSecurityReport,
    showMerakiImport,
    setShowMerakiImport
  };
};

export default useUIState;
