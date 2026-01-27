import React from 'react';
import BrandSection from './BrandSection';
import ViewModeToggle from './ViewModeToggle';
import PhysicalViewControls from './PhysicalViewControls';
import ViewControls from './ViewControls';
import HistoryControls from './HistoryControls';
import ScalingControlsDropdown from './ScalingControlsDropdown';
import SearchAndFilters from './SearchAndFilters';
import DataActions from './DataActions';
import CollaborationControls from './CollaborationControls';
import AiChatButton from './AiChatButton';
import UserMenu from './UserMenu';
import NetworkSelector from '../ui/NetworkSelector';
import SyncStatus from '../ui/SyncStatus';
import styles from './MenuBar.module.css';

const MenuBar = ({
  // View mode
  viewMode,
  setViewMode,
  theme,

  // Physical view controls
  drawingMode,
  setDrawingMode,
  canEdit,
  isReadOnly,
  fileInputRef,
  handleImageUpload,
  measurementUnit,
  setMeasurementUnit,
  showMeasurements,
  setShowMeasurements,
  visibilityMode,
  setVisibilityMode,
  visibilityModeSize,
  setVisibilityModeSize,

  // View controls
  showGrid,
  setShowGrid,
  darkMode,
  setDarkMode,
  showMinimap,
  setShowMinimap,

  // History
  undo,
  redo,
  historyIdx,
  history,

  // Scaling
  circleScale,
  setCircleScale,
  deviceLabelScale,
  setDeviceLabelScale,
  portLabelScale,
  setPortLabelScale,

  // Network management
  devices,
  setDevices,
  connections,
  setConnections,
  vlans,
  setVlans,
  buildings,
  setBuildings,
  setCurrentVersion,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  networks,
  currentNetwork,

  // Search and filters
  searchQuery,
  setSearchQuery,
  showVlanPanel,
  setShowVlanPanel,
  filterVlan,

  // Data actions
  importData,
  exportData,
  handleSaveNetwork,
  isPremium,
  isSaving,

  // Collaboration
  setShareNetworkId,
  setShowShareModal,

  // AI Chat
  aiChatOpen,
  setAiChatOpen,

  // User menu
  user,
  showUserMenu,
  setShowUserMenu,
  setShowUserSettings,
  setShowUpgradeModal,
  logout
}) => {
  return (
    <nav className={styles.menubar} style={{ background: theme.surface, borderColor: theme.border }}>
      {/* Brand & View Mode */}
      <BrandSection theme={theme} />
      <div className={styles.divider} style={{ background: theme.border }} />
      <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} theme={theme} />

      {/* Physical View Tools */}
      {viewMode === 'physical' && (
        <>
          <div className={styles.divider} style={{ background: theme.border }} />
          <PhysicalViewControls
            drawingMode={drawingMode}
            setDrawingMode={setDrawingMode}
            canEdit={canEdit}
            isReadOnly={isReadOnly}
            fileInputRef={fileInputRef}
            handleImageUpload={handleImageUpload}
            measurementUnit={measurementUnit}
            setMeasurementUnit={setMeasurementUnit}
            showMeasurements={showMeasurements}
            setShowMeasurements={setShowMeasurements}
            visibilityMode={visibilityMode}
            setVisibilityMode={setVisibilityMode}
            visibilityModeSize={visibilityModeSize}
            setVisibilityModeSize={setVisibilityModeSize}
            theme={theme}
          />
        </>
      )}

      {/* View Controls */}
      <div className={styles.divider} style={{ background: theme.border }} />
      <ViewControls
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showMinimap={showMinimap}
        setShowMinimap={setShowMinimap}
        viewMode={viewMode}
        theme={theme}
      />

      {/* History */}
      <div className={styles.divider} style={{ background: theme.border }} />
      <HistoryControls
        undo={undo}
        redo={redo}
        historyIdx={historyIdx}
        history={history}
        theme={theme}
      />

      {/* Scaling - Compact Dropdown */}
      <ScalingControlsDropdown
        circleScale={circleScale}
        setCircleScale={setCircleScale}
        deviceLabelScale={deviceLabelScale}
        setDeviceLabelScale={setDeviceLabelScale}
        portLabelScale={portLabelScale}
        setPortLabelScale={setPortLabelScale}
        viewMode={viewMode}
        visibilityMode={visibilityMode}
        theme={theme}
      />

      {/* Spacer */}
      <div className={styles.spacer} />

      {/* Network Management */}
      <NetworkSelector
        theme={theme}
        onLoadNetwork={(result, networkId) => {
          setDevices(result.data.devices || {});
          setConnections(result.data.connections || {});
          setVlans(result.data.vlans || {});
          setBuildings(result.data.buildings || {});

          // Load view state if present
          if (result.data.viewState) {
            if (result.data.viewState.circleScale !== undefined) setCircleScale(result.data.viewState.circleScale);
            if (result.data.viewState.deviceLabelScale !== undefined) setDeviceLabelScale(result.data.viewState.deviceLabelScale);
            if (result.data.viewState.portLabelScale !== undefined) setPortLabelScale(result.data.viewState.portLabelScale);
          }

          setCurrentVersion(result.version);
          setHasUnsavedChanges(false);
        }}
        currentData={{ devices, connections, vlans, buildings }}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <SyncStatus theme={theme} />

      {/* Search & Filters */}
      <div className={styles.divider} style={{ background: theme.border }} />
      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        showVlanPanel={showVlanPanel}
        setShowVlanPanel={setShowVlanPanel}
        filterVlan={filterVlan}
        theme={theme}
      />

      {/* Data Actions */}
      <div className={styles.divider} style={{ background: theme.border }} />
      <DataActions
        importData={importData}
        exportData={exportData}
        handleSaveNetwork={handleSaveNetwork}
        hasUnsavedChanges={hasUnsavedChanges}
        canEdit={canEdit}
        currentNetwork={currentNetwork}
        isPremium={isPremium}
        isSaving={isSaving}
        theme={theme}
      />

      {/* Collaboration */}
      <CollaborationControls
        currentNetwork={currentNetwork}
        isPremium={isPremium}
        setShareNetworkId={setShareNetworkId}
        setShowShareModal={setShowShareModal}
        theme={theme}
      />

      {/* AI Chat */}
      <AiChatButton
        aiChatOpen={aiChatOpen}
        setAiChatOpen={setAiChatOpen}
        theme={theme}
      />

      {/* User Menu */}
      <UserMenu
        user={user}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        setShowUserSettings={setShowUserSettings}
        setShowUpgradeModal={setShowUpgradeModal}
        logout={logout}
        theme={theme}
      />
    </nav>
  );
};

export default MenuBar;
