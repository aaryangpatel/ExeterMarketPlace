/**
 * Exeter Marketplace - Professional Design System
 * A refined, modern design system for a premium student marketplace
 */

export const COLORS = {
  // Primary Brand - Exeter Red
  primary: '#A41034',
  primaryDark: '#8A0D2C',
  primaryLight: '#C8102E',
  primaryMuted: 'rgba(164, 16, 52, 0.08)',
  primaryFaded: 'rgba(164, 16, 52, 0.12)',

  // Backgrounds
  background: '#F5F5F7',
  backgroundSecondary: '#EEEEF0',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text Colors
  text: '#1D1D1F',
  textSecondary: '#6E6E73',
  textTertiary: '#8E8E93',
  textMuted: '#AEAEB2',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#D2D2D7',
  borderLight: '#E8E8ED',
  borderFocus: '#A41034',
  divider: '#E5E5EA',

  // Semantic Colors
  success: '#34C759',
  successLight: 'rgba(52, 199, 89, 0.12)',
  error: '#FF3B30',
  errorLight: 'rgba(255, 59, 48, 0.12)',
  warning: '#FF9500',
  warningLight: 'rgba(255, 149, 0, 0.12)',
  info: '#007AFF',
  infoLight: 'rgba(0, 122, 255, 0.12)',

  // Price & Status
  priceGreen: '#00A67E',
  priceFree: '#34C759',
  sold: '#8E8E93',
  soldBadge: '#1D1D1F',

  // Chat
  chatBubbleOwn: '#A41034',
  chatBubbleOther: '#F2F2F7',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.08)',
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FONT_SIZES = {
  xxs: 10,
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 34,
};

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
};

export const LINE_HEIGHTS = {
  tight: 1.1,
  normal: 1.3,
  relaxed: 1.5,
  loose: 1.7,
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 12,
  },
};

// Common component styles
export const BUTTON_HEIGHTS = {
  sm: 36,
  md: 44,
  lg: 52,
};

export const ICON_SIZES = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 32,
};

// Animation timing
export const TIMING = {
  fast: 150,
  normal: 250,
  slow: 400,
};
