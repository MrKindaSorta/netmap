import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

const ContextMenu = ({ visible, x, y, items, onClose, theme }) => {
  const menuRef = useRef(null);
  const [submenuState, setSubmenuState] = useState({ index: null, x: 0, y: 0 });
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    if (!visible || !menuRef.current) return;

    // Boundary detection
    const rect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 10;
    }
    if (y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 10;
    }

    if (adjustedX !== x || adjustedY !== y) {
      setPosition({ x: adjustedX, y: adjustedY });
    }

    // Click outside to close
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    // Escape key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, x, y, onClose]);

  if (!visible) return null;

  const handleItemClick = (item) => {
    if (item.disabled || item.submenu) return;
    if (item.action) {
      item.action();
    }
    onClose();
  };

  const handleMouseEnter = (item, index, e) => {
    if (item.submenu) {
      const itemRect = e.currentTarget.getBoundingClientRect();
      const submenuX = itemRect.right + 5;
      const submenuY = itemRect.top;

      // Check if submenu would go off-screen to the right
      const estimatedWidth = 200;
      const adjustedX = submenuX + estimatedWidth > window.innerWidth
        ? itemRect.left - estimatedWidth - 5
        : submenuX;

      setSubmenuState({ index, x: adjustedX, y: submenuY });
    }
  };

  const handleMouseLeave = () => {
    setSubmenuState({ index: null, x: 0, y: 0 });
  };

  return (
    <>
      <div
        ref={menuRef}
        className="fixed rounded-lg shadow-2xl py-1 min-w-[200px] z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          color: theme.text
        }}
      >
        {items.map((item, index) => {
          if (item.divider) {
            return (
              <div
                key={index}
                className="my-1"
                style={{ borderTop: `1px solid ${theme.border}` }}
              />
            );
          }

          return (
            <div
              key={index}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-sm ${
                item.disabled ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              style={{
                background: submenuState.index === index ? theme.hover : 'transparent'
              }}
              onClick={() => handleItemClick(item)}
              onMouseEnter={(e) => handleMouseEnter(item, index, e)}
              onMouseLeave={handleMouseLeave}
            >
              {item.icon && (
                <Icon d={item.icon} s={16} />
              )}
              <span className="flex-1">{item.label}</span>
              {item.submenu && (
                <Icon d="M9 18l6-6-6-6" s={16} />
              )}
            </div>
          );
        })}
      </div>

      {/* Render submenu */}
      {submenuState.index !== null && items[submenuState.index]?.submenu && (
        <div
          className="fixed rounded-lg shadow-2xl py-1 min-w-[180px] z-50"
          style={{
            left: `${submenuState.x}px`,
            top: `${submenuState.y}px`,
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            color: theme.text
          }}
          onMouseEnter={() => {/* Keep submenu open */}}
          onMouseLeave={handleMouseLeave}
        >
          {items[submenuState.index].submenu.map((subItem, subIndex) => (
            <div
              key={subIndex}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-sm ${
                subItem.disabled ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              style={{ background: 'transparent' }}
              onClick={() => handleItemClick(subItem)}
            >
              {subItem.icon && (
                <Icon d={subItem.icon} s={16} />
              )}
              <span>{subItem.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ContextMenu;
