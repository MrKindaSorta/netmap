import React from 'react';

/**
 * Standardized Button Components
 * Provides consistent styling across all modals and UI elements
 */

// Primary action button (blue)
export const PrimaryButton = ({ children, onClick, disabled = false, className = '', fullWidth = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className}`}
  >
    {children}
  </button>
);

// Secondary action button (outlined)
export const SecondaryButton = ({ children, onClick, disabled = false, theme, className = '', fullWidth = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className}`}
    style={{
      background: theme.bg,
      border: `1px solid ${theme.border}`,
      color: theme.text
    }}
  >
    {children}
  </button>
);

// Danger button (red)
export const DangerButton = ({ children, onClick, disabled = false, className = '', fullWidth = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className}`}
  >
    {children}
  </button>
);

// Ghost button (minimal styling)
export const GhostButton = ({ children, onClick, disabled = false, theme, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    style={{ color: theme.textMuted }}
    onMouseEnter={(e) => e.currentTarget.style.background = theme.hover}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
  >
    {children}
  </button>
);

// Success button (green)
export const SuccessButton = ({ children, onClick, disabled = false, className = '', fullWidth = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className}`}
  >
    {children}
  </button>
);

// Modal footer with action buttons
export const ModalFooter = ({ children, className = '' }) => (
  <div className={`flex gap-3 ${className}`}>
    {children}
  </div>
);

export default {
  Primary: PrimaryButton,
  Secondary: SecondaryButton,
  Danger: DangerButton,
  Ghost: GhostButton,
  Success: SuccessButton,
  Footer: ModalFooter
};
