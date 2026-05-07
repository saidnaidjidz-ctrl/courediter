// ============================================================
// API Configuration
// ============================================================

// 🌐 Cloud URL - Railway Production
// export const API_BASE_URL = 'https://courediter-production.up.railway.app';

// 🔧 Local testing
export const API_BASE_URL = 'http://10.14.51.105:8000';

export const ENDPOINTS = {
  generate: `${API_BASE_URL}/api/generate`,
  download: (filename: string) => `${API_BASE_URL}/api/download/${filename}`,
  health: `${API_BASE_URL}/api/health`,
};
