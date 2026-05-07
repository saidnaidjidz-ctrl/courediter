import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export const COLORS = {
  // Backgrounds
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#252540',
  card: '#1E1E35',

  // Brand gradient
  primary: '#7C3AED',
  primaryLight: '#A855F7',
  primaryDark: '#5B21B6',
  accent: '#C084FC',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Status
  success: '#10B981',
  successBg: '#064E3B',
  error: '#EF4444',
  errorBg: '#450A0A',
  warning: '#F59E0B',

  // Borders
  border: '#2D2D52',
  borderLight: '#3D3D70',

  // Overlay
  overlay: 'rgba(0,0,0,0.7)',
};

export const FONTS = {
  regular: 'System',
  sizes: {
    xs: isTablet ? 13 : 11,
    sm: isTablet ? 15 : 13,
    md: isTablet ? 17 : 15,
    lg: isTablet ? 20 : 18,
    xl: isTablet ? 26 : 22,
    xxl: isTablet ? 34 : 28,
    xxxl: isTablet ? 42 : 36,
  },
};

export const SPACING = {
  xs: isTablet ? 6 : 4,
  sm: isTablet ? 12 : 8,
  md: isTablet ? 20 : 16,
  lg: isTablet ? 28 : 24,
  xl: isTablet ? 40 : 32,
  xxl: isTablet ? 56 : 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOWS = {
  purple: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const IS_TABLET = isTablet;
