// Reverse connection direction
export const reverseConnection = (connections, connectionId) => {
  const conn = connections[connectionId];
  return {
    ...connections,
    [connectionId]: {
      ...conn,
      from: conn.to,
      to: conn.from,
      fromPort: conn.toPort,
      toPort: conn.fromPort
    }
  };
};

// Change connection type
export const changeConnectionType = (connections, connectionId, newType) => {
  return {
    ...connections,
    [connectionId]: { ...connections[connectionId], type: newType }
  };
};

// Change connection speed
export const changeConnectionSpeed = (connections, connectionId, newSpeed) => {
  return {
    ...connections,
    [connectionId]: { ...connections[connectionId], speed: newSpeed }
  };
};

// Delete connection
export const deleteConnection = (connections, connectionId) => {
  const updated = { ...connections };
  delete updated[connectionId];
  return updated;
};

// Update connection
export const updateConnection = (connections, connectionId, updates) => {
  return {
    ...connections,
    [connectionId]: { ...connections[connectionId], ...updates }
  };
};

// Validate connection (prevent duplicates)
export const validateConnection = (connections, fromId, toId) => {
  const existingConn = Object.values(connections).find(
    c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
  );
  return existingConn ? { valid: false, reason: 'Connection already exists' } : { valid: true };
};
