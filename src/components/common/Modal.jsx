import React from 'react';
import Icon from './Icon';

/**
 * Enhanced Modal Component
 *
 * Props:
 * - title: Modal title
 * - onClose: Close handler
 * - children: Modal content
 * - theme: Theme object
 * - size: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
 * - footer: Optional footer content (for action buttons)
 * - showCloseButton: Show X button in header (default: true)
 */
const Modal = React.memo(({
  title,
  onClose,
  children,
  theme,
  size = 'md',
  footer = null,
  showCloseButton = true
}) => {
  // Size variants
  const sizeClasses = {
    sm: 'max-w-sm',      // 384px
    md: 'max-w-md',      // 448px
    lg: 'max-w-2xl',     // 672px
    xl: 'max-w-4xl',     // 896px
    full: 'max-w-7xl'    // 1280px
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}
        style={{ background: theme.surface, color: theme.text }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: theme.border }}
        >
          <h3 className="font-bold text-lg">{title}</h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{ color: theme.textMuted }}
              onMouseEnter={(e) => e.currentTarget.style.background = theme.hover}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icon d="M18 6L6 18M6 6l12 12" s={20} />
            </button>
          )}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>

        {/* Footer - Sticky */}
        {footer && (
          <div
            className="px-5 py-4 border-t flex-shrink-0"
            style={{ borderColor: theme.border, background: theme.surface }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

export default Modal;
