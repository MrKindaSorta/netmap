import React from 'react';
import { Icon } from '../common';

const VlanPanel = ({
  vlans,
  filterVlan,
  onFilterChange,
  onClose,
  onEditVlan,
  onAddVlan,
  theme
}) => {
  return (
    <div
      className="absolute top-16 left-4 w-72 rounded-xl shadow-2xl overflow-hidden"
      style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: theme.border }}
      >
        <h3 className="font-bold">VLAN Manager</h3>
        <button
          onClick={onClose}
          className="p-1 rounded transition-colors"
          style={{ color: theme.text }}
          onMouseEnter={(e) => (e.currentTarget.style.background = theme.hover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon d="M18 6L6 18M6 6l12 12" s={16} />
        </button>
      </div>

      {/* VLAN List */}
      <div className="p-3 max-h-96 overflow-y-auto space-y-2">
        {Object.values(vlans).map(vlan => (
          <div
            key={vlan.id}
            className={`p-3 rounded-lg relative group transition-all ${
              filterVlan === vlan.id ? 'ring-2' : ''
            }`}
            style={{
              background: vlan.color + '10',
              borderLeft: `4px solid ${vlan.color}`,
              ringColor: vlan.color
            }}
          >
            <div
              onClick={() => onFilterChange(filterVlan === vlan.id ? null : vlan.id)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: vlan.color }}>
                  VLAN {vlan.id}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: vlan.color + '20', color: vlan.color }}
                >
                  {vlan.name}
                </span>
              </div>
              <div className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                <div className="font-mono">{vlan.subnet}</div>
                {vlan.description && <div>{vlan.description}</div>}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditVlan({ vlan, vlanId: vlan.id });
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
              style={{ background: theme.surface }}
            >
              <Icon
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                s={14}
              />
            </button>
          </div>
        ))}

        {/* Add VLAN Button */}
        <button
          onClick={onAddVlan}
          className="w-full p-2 border-2 border-dashed rounded-lg text-sm font-medium transition-colors"
          style={{ borderColor: theme.border, color: theme.textMuted }}
        >
          + Add VLAN
        </button>
      </div>
    </div>
  );
};

export default React.memo(VlanPanel);
