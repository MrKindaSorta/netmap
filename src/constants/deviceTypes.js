export const deviceTypes = [
  { value: 'router', label: 'Router', icon: 'M4 8h16M4 8v8a2 2 0 002 2h12a2 2 0 002-2V8M4 8l2-4h12l2 4' },
  { value: 'firewall', label: 'Firewall', icon: 'M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z' },
  { value: 'core', label: 'Core Switch', icon: 'M4 4h16v16H4zM4 9h16M4 14h16M9 4v16M14 4v16' },
  { value: 'switch', label: 'Switch', icon: 'M4 6h16v12H4zM8 12h.01M12 12h.01M16 12h.01' },
  { value: 'unmanaged', label: 'Unmanaged', icon: 'M4 6h16v12H4zM8 12h.01M12 12h.01M16 12h.01' },
  { value: 'ap', label: 'Access Point', icon: 'M8.1 9.9a6 6 0 018 0M5 7a10 10 0 0114 0M12 14a2 2 0 100 4' },
  { value: 'server', label: 'Server', icon: 'M6 4h12v5H6zM6 11h12v5H6zM10 6.5h.01M10 13.5h.01' },
  { value: 'workstation', label: 'Workstation', icon: 'M5 4h14v10H5zM8 18h8M12 14v4' },
  { value: 'printer', label: 'Printer', icon: 'M6 9V4a1 1 0 011-1h10a1 1 0 011 1v5M4 9h16v8a1 1 0 01-1 1h-2v-4H7v4H5a1 1 0 01-1-1V9z' },
  { value: 'camera', label: 'Camera', icon: 'M12 12m-8 0a8 8 0 1016 0 8 8 0 10-16 0M12 12m-3 0a3 3 0 106 0' },
  { value: 'phone', label: 'VoIP Phone', icon: 'M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM12 17h.01' },
  { value: 'voip-controller', label: 'VoIP Controller', icon: 'M4 3h16v18H4zM4 9h16M4 15h16M12 6v0M12 12v0' },
  { value: 'cloud', label: 'Cloud', icon: 'M18 10a4 4 0 00-8 0 4 4 0 00-4 4 3 3 0 003 3h9a4 4 0 001-7z' },
  { value: 'wan', label: 'WAN Uplink', icon: 'M12 2L2 7v6c0 5 3 10 8 12 5-2 8-7 8-12V7l-10-5M12 12l-6 3 6-9v6' },
  { value: 'unknown', label: 'Unknown', icon: 'M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0M12 8v4M12 16h.01' },
];

export const getDevColor = (d) => {
  if (d.isRoot) return '#22c55e';
  const colors = {
    router: '#f97316',
    firewall: '#ef4444',
    core: '#3b82f6',
    switch: '#8b5cf6',
    unmanaged: '#eab308',
    ap: '#10b981',
    server: '#06b6d4',
    workstation: '#64748b',
    printer: '#a855f7',
    camera: '#ec4899',
    phone: '#14b8a6',
    'voip-controller': '#0891b2',
    cloud: '#6366f1',
    wan: '#16a34a',
    unknown: '#6b7280'
  };
  return colors[d.type] || '#6b7280';
};
