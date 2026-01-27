import React from 'react';
import HoverableButton from '../common/HoverableButton';

const Icon = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// Button size variants
const SIZE_CLASSES = {
  icon: 'p-1.5',           // 24px - icon only
  compact: 'px-2 py-1',    // 24px height - compact text
  standard: 'px-3 py-1.5', // 28px height - icon+text
};

/**
 * IconButton - Standardized icon-only button
 */
export const IconButton = ({ onClick, icon, title, disabled = false, active = false, theme, size = 'icon', ...props }) => {
  return (
    <HoverableButton
      onClick={onClick}
      theme={theme}
      className={`${SIZE_CLASSES[size]} rounded`}
      title={title}
      disabled={disabled}
      active={active}
      {...props}
    >
      {icon}
    </HoverableButton>
  );
};

/**
 * ToggleButton - Text button with active state
 */
export const ToggleButton = ({ onClick, isActive, label, theme, title, ...props }) => {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 text-xs font-medium"
      style={isActive ? { background: '#2563eb', color: 'white' } : { color: theme.text }}
      title={title}
      {...props}
    >
      {label}
    </button>
  );
};

/**
 * DrawingToolButton - Color-coded drawing tool button for physical view
 */
export const DrawingToolButton = ({ onClick, isActive, tool, disabled, theme, title, icon }) => {
  const getStyle = () => {
    if (isActive) {
      switch (tool) {
        case 'wall':
          return { background: '#f97316', color: 'white' };
        case 'room':
          return { background: '#a855f7', color: 'white' };
        case 'measure':
          return { background: '#ef4444', color: 'white' };
        default:
          return { color: theme.text };
      }
    }
    return { color: theme.text };
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      style={isHovered && !isActive && !disabled ? { background: theme.hover } : getStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
    >
      {icon}
    </button>
  );
};

export { Icon };
