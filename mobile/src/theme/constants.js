/**
 * Exeter Marketplace - Premium Dark Design System
 * A sophisticated, formal design system with dark theme
 */

export const COLORS = {
  // Primary Brand - Exeter Red
  primary: '#A41034',
  primaryDark: '#8A0D2C',
  primaryLight: '#C8102E',
  primaryMuted: 'rgba(164, 16, 52, 0.15)',
  primaryFaded: 'rgba(164, 16, 52, 0.08)',

  // Dark Theme Backgrounds
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  backgroundTertiary: '#2C2C2E',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  surfaceHighlight: '#3A3A3C',

  // Text Colors
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  textMuted: '#48484A',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#3A3A3C',
  borderLight: '#2C2C2E',
  borderFocus: '#A41034',
  divider: '#2C2C2E',

  // Semantic Colors
  success: '#30D158',
  successLight: 'rgba(48, 209, 88, 0.15)',
  error: '#FF453A',
  errorLight: 'rgba(255, 69, 58, 0.15)',
  warning: '#FF9F0A',
  warningLight: 'rgba(255, 159, 10, 0.15)',
  info: '#0A84FF',
  infoLight: 'rgba(10, 132, 255, 0.15)',

  // Price & Status
  priceGreen: '#30D158',
  priceFree: '#30D158',
  sold: '#636366',
  soldBadge: '#48484A',

  // Chat - iMessage style
  chatBubbleOwn: '#0A84FF',
  chatBubbleOther: '#3A3A3C',
  chatTextOwn: '#FFFFFF',
  chatTextOther: '#FFFFFF',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
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
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
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
