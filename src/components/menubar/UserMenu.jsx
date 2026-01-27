import React, { useCallback } from 'react';
import { Icon } from './MenuBarButton';

const UserMenu = ({ user, showUserMenu, setShowUserMenu, setShowUserSettings, setShowUpgradeModal, logout, theme }) => {
  const handleMenuAction = useCallback((action) => {
    action();
    setShowUserMenu(false);
  }, [setShowUserMenu]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="px-2 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
        style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}
        onMouseEnter={(e) => e.currentTarget.style.background = theme.hover}
        onMouseLeave={(e) => e.currentTarget.style.background = theme.bg}
        title={user?.email}
      >
        <Icon d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" s={14} />
        <span>{user?.email?.split('@')[0]}</span>
      </button>

      {/* User Menu Dropdown */}
      {showUserMenu && (
        <div
          className="absolute right-0 mt-1 w-56 rounded-lg shadow-lg z-50"
          style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
        >
          <div className="p-3 border-b" style={{ borderColor: theme.border }}>
            <div className="text-sm font-medium" style={{ color: theme.text }}>{user?.email}</div>
            <div className="text-xs mt-1" style={{ color: theme.textSecondary }}>
              {user?.subscription_tier === 'premium' ? '⭐ Premium' : 'Free Tier'}
            </div>
          </div>
          <div className="p-1">
            <button
              onClick={() => handleMenuAction(() => setShowUserSettings(true))}
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center gap-2"
              style={{ color: theme.text }}
              onMouseEnter={(e) => e.currentTarget.style.background = theme.hover}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icon d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" s={14} />
              Settings
            </button>
            {user?.subscription_tier === 'free' && (
              <button
                onClick={() => handleMenuAction(() => setShowUpgradeModal(true))}
                className="w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center gap-2"
                style={{ color: '#3b82f6' }}
                onMouseEnter={(e) => e.currentTarget.style.background = theme.hover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span className="text-base">⭐</span>
                Upgrade to Premium
              </button>
            )}
            <div className="border-t my-1" style={{ borderColor: theme.border }} />
            <button
              onClick={() => handleMenuAction(() => logout())}
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center gap-2"
              style={{ color: theme.text }}
              onMouseEnter={(e) => e.currentTarget.style.background = theme.hover}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" s={14} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
