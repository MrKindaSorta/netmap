import React from 'react';
import { Icon } from './MenuBarButton';

const BrandSection = ({ theme }) => {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
        <Icon d="M6 6m-3 0a3 3 0 106 0M18 6m-3 0a3 3 0 106 0M6 18m-3 0a3 3 0 106 0M18 18m-3 0a3 3 0 106 0M6 9v6M18 9v6M9 6h6M9 18h6" s={14} />
      </div>
      <span className="font-bold">NetMap</span>
      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: theme.bg }}>v3</span>
    </div>
  );
};

export default BrandSection;
