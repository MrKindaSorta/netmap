import React from 'react';

const AssetConfigTab = ({ device, upd, theme }) => {
  const asset = device.asset || {};

  const updateAsset = (field, value) => {
    upd({ asset: { ...device.asset, [field]: value } });
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const warrantyDays = getDaysUntil(asset.warrantyExpires);
  const eolDays = getDaysUntil(asset.eolDate);
  const eosDays = getDaysUntil(asset.eosDate);

  return (
    <div className="space-y-4">
      {/* Asset Identification */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Asset Tag</label>
          <input
            value={asset.assetTag || ''}
            onChange={(e) => updateAsset('assetTag', e.target.value)}
            placeholder="e.g., IT-2024-0142"
            className="w-full px-3 py-2 rounded border font-mono text-sm"
            style={{ background: theme.bg, borderColor: theme.border }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Owner / Assigned To</label>
          <input
            value={asset.owner || ''}
            onChange={(e) => updateAsset('owner', e.target.value)}
            placeholder="e.g., IT Department, John Smith"
            className="w-full px-3 py-2 rounded border"
            style={{ background: theme.bg, borderColor: theme.border }}
          />
        </div>
      </div>

      {/* Purchase Information */}
      <div className="border rounded p-3" style={{ borderColor: theme.border }}>
        <h4 className="text-sm font-semibold mb-3">Purchase Information</h4>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Purchase Date
              </label>
              <input
                type="date"
                value={asset.purchaseDate || ''}
                onChange={(e) => updateAsset('purchaseDate', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Purchase Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={asset.purchasePrice || ''}
                onChange={(e) => updateAsset('purchasePrice', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
              {asset.purchasePrice && (
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                  {formatCurrency(asset.purchasePrice)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Vendor
              </label>
              <input
                value={asset.vendor || ''}
                onChange={(e) => updateAsset('vendor', e.target.value)}
                placeholder="e.g., CDW, Amazon Business"
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Cost Center
              </label>
              <input
                value={asset.costCenter || ''}
                onChange={(e) => updateAsset('costCenter', e.target.value)}
                placeholder="e.g., CC-1234"
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Warranty Information */}
      <div className="border rounded p-3" style={{ borderColor: theme.border }}>
        <h4 className="text-sm font-semibold mb-3">Warranty Information</h4>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Warranty Expires
              </label>
              <input
                type="date"
                value={asset.warrantyExpires || ''}
                onChange={(e) => updateAsset('warrantyExpires', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
              {warrantyDays !== null && (
                <p
                  className="text-xs mt-1 font-medium"
                  style={{
                    color: warrantyDays < 0
                      ? '#ef4444'
                      : warrantyDays < 90
                      ? '#f59e0b'
                      : '#10b981'
                  }}
                >
                  {warrantyDays < 0
                    ? `Expired ${Math.abs(warrantyDays)} days ago`
                    : `${warrantyDays} days remaining`}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Warranty Type
              </label>
              <select
                value={asset.warrantyType || 'none'}
                onChange={(e) => updateAsset('warrantyType', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              >
                <option value="none">None</option>
                <option value="standard">Standard</option>
                <option value="extended">Extended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
              Maintenance Contract
            </label>
            <input
              value={asset.maintenanceContract || ''}
              onChange={(e) => updateAsset('maintenanceContract', e.target.value)}
              placeholder="Contract number or description"
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ background: theme.bg, borderColor: theme.border }}
            />
          </div>
        </div>
      </div>

      {/* End of Life Information */}
      <div className="border rounded p-3" style={{ borderColor: theme.border }}>
        <h4 className="text-sm font-semibold mb-3">Lifecycle Dates</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
              End of Life (EOL)
            </label>
            <input
              type="date"
              value={asset.eolDate || ''}
              onChange={(e) => updateAsset('eolDate', e.target.value)}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ background: theme.bg, borderColor: theme.border }}
            />
            {eolDays !== null && (
              <p
                className="text-xs mt-1 font-medium"
                style={{
                  color: eolDays < 0 ? '#ef4444' : eolDays < 180 ? '#f59e0b' : theme.textMuted
                }}
              >
                {eolDays < 0 ? `Reached ${Math.abs(eolDays)} days ago` : `${eolDays} days until EOL`}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
              No longer sold by manufacturer
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
              End of Support (EOS)
            </label>
            <input
              type="date"
              value={asset.eosDate || ''}
              onChange={(e) => updateAsset('eosDate', e.target.value)}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ background: theme.bg, borderColor: theme.border }}
            />
            {eosDays !== null && (
              <p
                className="text-xs mt-1 font-medium"
                style={{
                  color: eosDays < 0 ? '#ef4444' : eosDays < 180 ? '#f59e0b' : theme.textMuted
                }}
              >
                {eosDays < 0 ? `Reached ${Math.abs(eosDays)} days ago` : `${eosDays} days until EOS`}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
              No longer supported by manufacturer
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs" style={{ color: theme.textMuted }}>
        Track asset lifecycle, warranties, and costs for budgeting and replacement planning.
      </p>
    </div>
  );
};

export default AssetConfigTab;
