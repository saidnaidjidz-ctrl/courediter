// ============================================================
// API Configuration
// ============================================================

// 🌐 Cloud URL - Render Production
export const API_BASE_URL = 'https://courediter.onrender.com';

// 🔧 Local testing (commented out)
// export const API_BASE_URL = 'http://10.14.51.105:8000';

export const ENDPOINTS = {
  generate: `${API_BASE_URL}/api/generate`,
  download: (filename: string) => `${API_BASE_URL}/api/download/${filename}`,
  health: `${API_BASE_URL}/api/health`,
};
