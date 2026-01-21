import { useMemo } from 'react';

export const useFiltering = (
  devices,
  connections,
  searchQuery,
  filterVlan,
  viewMode,
  selectedBuilding,
  selectedFloor
) => {
  const filteredDevs = useMemo(() => {
    let result = Object.values(devices);

    // Apply search filter
    if (searchQuery) {
      result = result.filter(d =>
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ip?.includes(searchQuery) ||
        d.mac?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply VLAN filter
    if (filterVlan) {
      result = result.filter(d => d.vlans?.includes(filterVlan));
    }

    // Apply physical view filtering (building/floor)
    if (viewMode === 'physical') {
      result = result.filter(d =>
        (selectedBuilding && d.buildingId === selectedBuilding && d.floor === selectedFloor) ||
        (!selectedBuilding && !d.buildingId)
      );
    }

    return result;
  }, [devices, searchQuery, filterVlan, viewMode, selectedBuilding, selectedFloor]);

  const filteredConns = useMemo(() => {
    const devIds = new Set(filteredDevs.map(d => d.id));
    return Object.values(connections).filter(c =>
      devIds.has(c.from) && devIds.has(c.to)
    );
  }, [connections, filteredDevs]);

  // Convert filtered devices array back to object for easier lookup
  const filteredDevsObj = useMemo(() => {
    return filteredDevs.reduce((acc, d) => {
      acc[d.id] = d;
      return acc;
    }, {});
  }, [filteredDevs]);

  return {
    filteredDevs: filteredDevsObj,
    filteredConns
  };
};
