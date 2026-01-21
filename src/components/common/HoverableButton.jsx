import React, { useState } from 'react';

/**
 * HoverableButton Component
 *
 * Reusable button with consistent hover behavior.
 * Eliminates 50+ repetitions of inline hover handlers throughout the codebase.
 */
const HoverableButton = ({
  onClick,
  children,
  theme,
  className = '',
  style = {},
  title,
  disabled = false,
  active = false,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getBackgroundColor = () => {
    if (disabled) return 'transparent';
    if (active) return theme.buttonActive;
    if (isHovered) return theme.hover;
    return 'transparent';
  };

  const getTextColor = () => {
    if (active) return theme.buttonActiveText;
    return theme.text;
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`transition-colors ${className}`}
      style={{
        background: getBackgroundColor(),
        color: getTextColor(),
        ...style
      }}
      title={title}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default HoverableButton;
