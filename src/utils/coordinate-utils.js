// Screen to SVG coordinate conversion
export const createGetSvgPt = (svgRef, pan, zoom) => {
  return (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: (sp.x - pan.x) / zoom, y: (sp.y - pan.y) / zoom };
  };
};

// Grid snapping logic
export const snapToGrid = (value, gridSize = 20) => {
  return Math.round(value / gridSize) * gridSize;
};

export const snapPointToGrid = (point, gridSize = 20) => {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize)
  };
};

// Boundary calculations
export const clampToBounds = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

export const clampPointToBounds = (point, bounds) => {
  return {
    x: clampToBounds(point.x, bounds.minX, bounds.maxX),
    y: clampToBounds(point.y, bounds.minY, bounds.maxY)
  };
};
