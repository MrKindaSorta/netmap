export const connTypes = [
  { value: 'trunk', label: 'Trunk', color: '#3b82f6', dash: '' },
  { value: 'access', label: 'Access', color: '#10b981', dash: '' },
  { value: 'lacp', label: 'LACP/Port-Channel', color: '#8b5cf6', dash: '' },
  { value: 'wan', label: 'WAN', color: '#f97316', dash: '8,4' },
  { value: 'management', label: 'Management', color: '#06b6d4', dash: '4,2' },
  { value: 'wireless', label: 'Wireless', color: '#a855f7', dash: '2,4' },
  { value: 'fiber', label: 'Fiber', color: '#eab308', dash: '' },
  { value: 'unknown', label: 'Unknown', color: '#ef4444', dash: '6,3' },
];

export const cableTypes = [
  { value: 'cat5e', label: 'Cat5e' },
  { value: 'cat6', label: 'Cat6' },
  { value: 'cat6a', label: 'Cat6a' },
  { value: 'mmf', label: 'Multimode Fiber' },
  { value: 'smf', label: 'Singlemode Fiber' },
];

export const speeds = ['10M', '100M', '1G', '2.5G', '5G', '10G', '25G', '40G', '100G'];

export const getConnStyle = (t) => connTypes.find(c => c.value === t) || connTypes[0];
