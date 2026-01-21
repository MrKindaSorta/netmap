import React from 'react';

const LocationConfigTab = ({ device, upd, theme }) => {
  const location = device.location || {};
  const rackUnit = location.rackUnit || {};
  const coordinates = location.coordinates || {};

  const updateLocation = (field, value) => {
    upd({ location: { ...device.location, [field]: value } });
  };

  const updateRackUnit = (field, value) => {
    upd({
      location: {
        ...device.location,
        rackUnit: { ...rackUnit, [field]: value }
      }
    });
  };

  const updateCoordinates = (field, value) => {
    upd({
      location: {
        ...device.location,
        coordinates: { ...coordinates, [field]: value }
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Basic Location */}
      <div>
        <label className="block text-sm font-medium mb-2">Building Name</label>
        <input
          value={location.building || ''}
          onChange={(e) => updateLocation('building', e.target.value)}
          placeholder="e.g., Main Office, Data Center 1"
          className="w-full px-3 py-2 rounded border"
          style={{ background: theme.bg, borderColor: theme.border }}
        />
        <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
          Descriptive building name (independent of building assignment in Basic tab)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Floor</label>
          <input
            value={location.floor || ''}
            onChange={(e) => updateLocation('floor', e.target.value)}
            placeholder="e.g., 2nd Floor, Basement"
            className="w-full px-3 py-2 rounded border"
            style={{ background: theme.bg, borderColor: theme.border }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Room</label>
          <input
            value={location.room || ''}
            onChange={(e) => updateLocation('room', e.target.value)}
            placeholder="e.g., Server Room A, MDF"
            className="w-full px-3 py-2 rounded border"
            style={{ background: theme.bg, borderColor: theme.border }}
          />
        </div>
      </div>

      {/* Rack Information */}
      <div className="border rounded p-3" style={{ borderColor: theme.border }}>
        <h4 className="text-sm font-semibold mb-3">Rack Mount Information</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
              Rack ID / Name
            </label>
            <input
              value={location.rack || ''}
              onChange={(e) => updateLocation('rack', e.target.value)}
              placeholder="e.g., Rack-A1, R42"
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ background: theme.bg, borderColor: theme.border }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Rack Unit Start (U)
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={rackUnit.start || ''}
                onChange={(e) => updateRackUnit('start', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="e.g., 12"
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                Height (U)
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={rackUnit.height || ''}
                onChange={(e) => updateRackUnit('height', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="e.g., 2"
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ background: theme.bg, borderColor: theme.border }}
              />
            </div>
          </div>

          {rackUnit.start && rackUnit.height && (
            <p className="text-xs" style={{ color: theme.textMuted }}>
              Occupies rack units {rackUnit.start} through {rackUnit.start + rackUnit.height - 1}
            </p>
          )}
        </div>
      </div>

      {/* Geographic Coordinates */}
      <div className="border rounded p-3" style={{ borderColor: theme.border }}>
        <h4 className="text-sm font-semibold mb-3">Geographic Coordinates</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              min="-90"
              max="90"
              value={coordinates.latitude || ''}
              onChange={(e) => updateCoordinates('latitude', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="e.g., 37.7749"
              className="w-full px-3 py-2 rounded border text-sm font-mono"
              style={{ background: theme.bg, borderColor: theme.border }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
              Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              min="-180"
              max="180"
              value={coordinates.longitude || ''}
              onChange={(e) => updateCoordinates('longitude', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="e.g., -122.4194"
              className="w-full px-3 py-2 rounded border text-sm font-mono"
              style={{ background: theme.bg, borderColor: theme.border }}
            />
          </div>
        </div>

        {coordinates.latitude && coordinates.longitude && (
          <a
            href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-xs text-blue-600 hover:underline"
          >
            View on Google Maps →
          </a>
        )}
      </div>

      <p className="text-xs" style={{ color: theme.textMuted }}>
        Detailed physical location information helps with site surveys, cabling planning, and asset tracking.
      </p>
    </div>
  );
};

export default LocationConfigTab;
