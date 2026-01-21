export const darkTheme = {
  bg: '#1e1e2e',
  surface: '#2a2a3e',
  border: '#3a3a4e',
  text: '#e0e0e0',
  textMuted: '#888',
  grid: '#2a2a3e',
  gridL: '#3a3a4e',
  hover: '#3a3a4e',
  buttonActive: '#2563eb20',
  buttonActiveText: '#60a5fa'
};

export const lightTheme = {
  bg: '#f8fafc',
  surface: '#fff',
  border: '#e2e8f0',
  text: '#1e293b',
  textMuted: '#64748b',
  grid: '#e2e8f0',
  gridL: '#cbd5e1',
  hover: '#f1f5f9',
  buttonActive: '#dbeafe',
  buttonActiveText: '#2563eb'
};

export const getTheme = (darkMode) => darkMode ? darkTheme : lightTheme;
