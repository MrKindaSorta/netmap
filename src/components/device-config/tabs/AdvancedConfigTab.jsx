import React from 'react';

const AdvancedConfigTab = ({ device, upd, theme }) => (
  <div className="space-y-3">
    <div className="text-sm" style={{ color: theme.textMuted }}>
      Advanced configuration options for this device type.
    </div>
  </div>
);

export default AdvancedConfigTab;
