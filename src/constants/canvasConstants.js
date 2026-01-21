/**
 * Canvas and Layout Constants
 *
 * Centralized configuration for canvas behavior, sizing, and thresholds.
 * All magic numbers from the original codebase are defined here with explanations.
 */

export const CANVAS_CONSTANTS = {
  // Click and drag thresholds
  CLICK_DISTANCE_THRESHOLD: 5,    // Max pixel distance to differentiate click from drag

  // Offset and padding
  OFFSET_DEFAULT: 20,              // Default offset for duplicated items (px)
  PADDING_DEFAULT: 100,            // Padding around canvas viewport (px)

  // Device and connection sizing
  DEVICE_CIRCLE_RADIUS_LOGICAL: 32,  // Base device circle radius in logical view (px)
  DEVICE_CIRCLE_RADIUS_PHYSICAL: 20, // Base device circle radius in physical view (px)
  PORT_LABEL_OFFSET_MIN: 0.2,        // Minimum port label offset as fraction of line length
  PORT_LABEL_OFFSET_MAX: 0.45,       // Maximum port label offset as fraction of line length
  PORT_LABEL_PADDING: 20,            // Padding around port labels (px)

  // Room and building constraints
  MIN_ROOM_SIZE: 20,               // Minimum room dimensions (px)
  BUILDING_DRAG_THRESHOLD: 5,      // Threshold to start building drag (px)

  // Zoom constraints
  ZOOM_MIN: 0.15,                  // Minimum zoom level (15%)
  ZOOM_MAX: 5,                     // Maximum zoom level (500%)
  ZOOM_INTENSITY: 0.05,            // Zoom step per scroll event
  ZOOM_FACTOR_IN: 1.2,             // Zoom in multiplier
  ZOOM_FACTOR_OUT: 0.8,            // Zoom out multiplier

  // Grid settings
  GRID_SIZE_SMALL: 20,             // Small grid line spacing (px)
  GRID_SIZE_LARGE: 100,            // Large grid line spacing (px)

  // Minimap settings
  MINIMAP_WIDTH: 150,              // Minimap SVG width (px)
  MINIMAP_HEIGHT: 110,             // Minimap SVG height (px)
  MINIMAP_VIEWPORT_WIDTH: 140,     // Minimap viewport width (px)
  MINIMAP_VIEWPORT_HEIGHT: 100,    // Minimap viewport height (px)
  MINIMAP_PADDING: 50,             // Padding around minimap content (px)
  MINIMAP_DEVICE_RADIUS: 4,        // Device circle radius in minimap (px)

  // History settings
  HISTORY_MAX_SIZE: 40,            // Maximum number of history states to keep
  HISTORY_SAVE_DELAY: 600,         // Debounce delay for auto-save (ms)

  // Animation durations
  ANIMATION_PULSE_DURATION: 2000,  // Duration of pulse animations (ms)
  ANIMATION_CONNECT_DURATION: 1000, // Duration of connection animations (ms)

  // Connection line widths
  CONNECTION_STROKE_WIDTH_DEFAULT: 2,  // Default connection line width (px)
  CONNECTION_STROKE_WIDTH_LACP: 4,     // LACP connection line width (px)
  CONNECTION_STROKE_WIDTH_HIGHLIGHTED: 4, // Highlighted connection line width (px)
  CONNECTION_STROKE_WIDTH_HOVER: 8,    // Hover overlay width (px)
  CONNECTION_HIT_AREA_WIDTH: 14,       // Invisible hit area for clicking (px)

  // Selection and highlight
  SELECTION_RING_OFFSET: 4,        // Distance of selection ring from device (px)
  SELECTION_RING_WIDTH: 3,         // Width of selection ring stroke (px)
  HIGHLIGHT_GLOW_RADIUS: 8,        // Radius of highlight glow effect (px)

  // Visibility mode counter-scale
  VISIBILITY_MODE_MULTIPLIER_SMALL: 1,   // Small visibility mode size multiplier
  VISIBILITY_MODE_MULTIPLIER_MEDIUM: 2,  // Medium visibility mode size multiplier
  VISIBILITY_MODE_MULTIPLIER_LARGE: 3,   // Large visibility mode size multiplier

  // Floor plan image
  FLOOR_PLAN_OPACITY_DEFAULT: 0.3, // Default floor plan image opacity

  // SVG viewport
  SVG_DEFAULT_WIDTH: 800,          // Default SVG width when not mounted (px)
  SVG_DEFAULT_HEIGHT: 600,         // Default SVG height when not mounted (px)

  // Context menu
  CONTEXT_MENU_MIN_WIDTH: 200,     // Minimum context menu width (px)

  // Panel widths
  PANEL_SIDEBAR_WIDTH: 256,        // Right sidebar panel width (px) - 64 * 4 = w-64
  PANEL_AI_CHAT_WIDTH: 450,        // AI chat panel width (px)
  PANEL_VLAN_WIDTH: 288,           // VLAN panel width (px) - 72 * 4 = w-72
  PANEL_BUILDING_LIST_WIDTH: 208,  // Building list panel width (px) - 52 * 4 = w-52

  // Badge and label sizes
  BADGE_RADIUS: 3,                 // Badge border radius (px)
  LABEL_FONT_SIZE_SMALL: 6,        // Minimum font size for labels (px)
  LABEL_FONT_SIZE_DEFAULT: 9,      // Default font size for labels (px)

  // Status indicator
  STATUS_INDICATOR_RADIUS_LOGICAL: 5,  // Status indicator radius in logical view (px)
  STATUS_INDICATOR_RADIUS_PHYSICAL: 3, // Status indicator radius in physical view (px)
};

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  DELETE: ['Delete', 'Backspace'],
  UNDO: 'z',
  REDO: 'y',
  DUPLICATE: 'd',
  SELECT_ALL: 'a',
  DESELECT: 'Escape',
  ADD_DEVICE: 'a',
  CONNECT_MODE: 'c',
  SELECT_MODE: 'v',
  MEASURE_MODE: 'm',
  ZOOM_IN: ']',
  ZOOM_OUT: '[',
  TOGGLE_GRID: 'g',
  TOGGLE_MINIMAP: 'n',
};

/**
 * Z-index layers for stacking context
 */
export const Z_INDEX = {
  BACKGROUND: 0,
  GRID: 1,
  FLOOR_PLAN: 2,
  CONNECTIONS: 10,
  DEVICES: 20,
  ROOMS: 5,
  WALLS: 6,
  BUILDINGS: 15,
  SELECTION_BOX: 25,
  PANELS: 40,
  AI_CHAT: 50,
  CONTEXT_MENU: 100,
  MODAL: 1000,
};

export default CANVAS_CONSTANTS;
