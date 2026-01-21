import { genId } from '../utils';

// Add a new building
export const addBuilding = (buildings) => {
  const newId = genId('bld');
  return {
    ...buildings,
    [newId]: {
      id: newId,
      name: `Building ${Object.keys(buildings).length + 1}`,
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      floors: [
        {
          id: 1,
          name: 'Floor 1',
          rooms: [],
          walls: []
        }
      ],
      floorPlanUrl: null
    }
  };
};

// Add a room to a building
export const addRoom = (buildings, buildingId, floorId) => {
  const building = buildings[buildingId];
  if (!building) return buildings;

  const floor = building.floors.find(f => f.id === floorId);
  if (!floor) return buildings;

  const newRoom = {
    id: genId('room'),
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    name: `Room ${floor.rooms.length + 1}`,
    color: '#e0e0e0'
  };

  return {
    ...buildings,
    [buildingId]: {
      ...building,
      floors: building.floors.map(f =>
        f.id === floorId
          ? { ...f, rooms: [...f.rooms, newRoom] }
          : f
      )
    }
  };
};

// Add a wall to a building floor
export const addWall = (buildings, buildingId, floorId, wall) => {
  const building = buildings[buildingId];
  if (!building) return buildings;

  return {
    ...buildings,
    [buildingId]: {
      ...building,
      floors: building.floors.map(f =>
        f.id === floorId
          ? { ...f, walls: [...f.walls, { ...wall, id: genId('wall') }] }
          : f
      )
    }
  };
};

// Add a floor to a building
export const addFloor = (buildings, buildingId) => {
  const building = buildings[buildingId];
  if (!building) return buildings;

  const newFloor = {
    id: building.floors.length + 1,
    name: `Floor ${building.floors.length + 1}`,
    rooms: [],
    walls: []
  };

  return {
    ...buildings,
    [buildingId]: {
      ...building,
      floors: [...building.floors, newFloor]
    }
  };
};

// Update building
export const updateBuilding = (buildings, buildingId, updates) => {
  return {
    ...buildings,
    [buildingId]: { ...buildings[buildingId], ...updates }
  };
};

// Delete building
export const deleteBuilding = (buildings, buildingId) => {
  const updated = { ...buildings };
  delete updated[buildingId];
  return updated;
};

// Update room
export const updateRoom = (buildings, buildingId, floorId, roomId, updates) => {
  const building = buildings[buildingId];
  if (!building) return buildings;

  return {
    ...buildings,
    [buildingId]: {
      ...building,
      floors: building.floors.map(f =>
        f.id === floorId
          ? {
              ...f,
              rooms: f.rooms.map(r =>
                r.id === roomId ? { ...r, ...updates } : r
              )
            }
          : f
      )
    }
  };
};

// Delete room
export const deleteRoom = (buildings, buildingId, floorId, roomId) => {
  const building = buildings[buildingId];
  if (!building) return buildings;

  return {
    ...buildings,
    [buildingId]: {
      ...building,
      floors: building.floors.map(f =>
        f.id === floorId
          ? { ...f, rooms: f.rooms.filter(r => r.id !== roomId) }
          : f
      )
    }
  };
};

// Update wall
export const updateWall = (buildings, buildingId, floorId, wallId, updates) => {
  const building = buildings[buildingId];
  if (!building) return buildings;

  return {
    ...buildings,
    [buildingId]: {
      ...building,
      floors: building.floors.map(f =>
        f.id === floorId
          ? {
              ...f,
              walls: f.walls.map(w =>
                w.id === wallId ? { ...w, ...updates } : w
              )
            }
          : f
      )
    }
  };
};

// Delete wall
export const deleteWall = (buildings, buildingId, floorId, wallId) => {
  const building = buildings[buildingId];
  if (!building) return buildings;

  return {
    ...buildings,
    [buildingId]: {
      ...building,
      floors: building.floors.map(f =>
        f.id === floorId
          ? { ...f, walls: f.walls.filter(w => w.id !== wallId) }
          : f
      )
    }
  };
};
