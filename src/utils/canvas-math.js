// Distance calculations
export const calculateDistance = (p1, p2) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Calculate offset for port labels along a connection line
export const calculatePortLabelOffset = (fromPos, toPos, distance, isFromPort) => {
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len === 0) return { x: 0, y: 0 };

  const normalizedDx = dx / len;
  const normalizedDy = dy / len;

  if (isFromPort) {
    return {
      x: fromPos.x + normalizedDx * distance,
      y: fromPos.y + normalizedDy * distance
    };
  } else {
    return {
      x: toPos.x - normalizedDx * distance,
      y: toPos.y - normalizedDy * distance
    };
  }
};

// Measurement conversions
export const feetToMeters = (feet) => feet * 0.3048;
export const metersToFeet = (meters) => meters / 0.3048;

export const convertLength = (length, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return length;

  if (fromUnit === 'ft' && toUnit === 'm') {
    return feetToMeters(length);
  }
  if (fromUnit === 'm' && toUnit === 'ft') {
    return metersToFeet(length);
  }

  return length;
};

// Calculate midpoint between two points
export const calculateMidpoint = (p1, p2) => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
};

// Calculate angle between two points (in radians)
export const calculateAngle = (p1, p2) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

// Rotate a point around another point
export const rotatePoint = (point, center, angle) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
};
