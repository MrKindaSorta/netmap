import { migrateDeviceData, migrateNetworkData } from '../utils';

// Migrate building data from old format (building-level rooms/walls) to new format (floor-level)
export const migrateBuildingData = (building) => {
  // If building already has floors with rooms/walls, it's already in new format
  if (building.floors && building.floors.length > 0 && building.floors[0].rooms !== undefined) {
    return building;
  }

  // Migrate from old format
  const migratedFloors = building.floors || [{ id: 1, name: 'Floor 1', image: null }];

  // Move rooms and walls from building level to first floor
  migratedFloors[0] = {
    ...migratedFloors[0],
    rooms: building.rooms || [],
    walls: building.walls || []
  };

  // Return building without rooms/walls at top level
  const { rooms, walls, ...restOfBuilding } = building;

  return {
    ...restOfBuilding,
    floors: migratedFloors
  };
};

// Export network data to JSON
export const exportData = (devices, connections, vlans, buildings, interBuildingLinks) => {
  const data = {
    devices,
    connections,
    vlans,
    buildings,
    interBuildingLinks,
    v: '4.0',
    t: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'network-topology.json';
  a.click();
};

// Parse and migrate imported data
export const parseImportedData = (jsonString) => {
  try {
    let data = JSON.parse(jsonString);

    // Migrate network data (devices, connections, VLANs) to v4.0
    data = migrateNetworkData(data);

    // Migrate buildings to new format (floor-level rooms/walls)
    if (data.buildings) {
      const migratedBuildings = Object.entries(data.buildings).reduce((acc, [id, building]) => {
        acc[id] = migrateBuildingData(building);
        return acc;
      }, {});
      data.buildings = migratedBuildings;
    }

    return {
      success: true,
      data: {
        devices: data.devices || {},
        connections: data.connections || {},
        vlans: data.vlans || {},
        buildings: data.buildings || {},
        interBuildingLinks: data.interBuildingLinks || {}
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid JSON file'
    };
  }
};

// Handle file import
export const importDataFromFile = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const result = parseImportedData(event.target.result);
    callback(result);
  };
  reader.onerror = () => {
    callback({ success: false, error: 'Failed to read file' });
  };
  reader.readAsText(file);
};
