/**
 * GymMate 디자인 시스템
 * 앱 전체에서 사용하는 색상, 폰트, 간격 등을 정의합니다.
 */

export const Colors = {
  // Primary Colors
  primary: '#007AFF',          // iOS Blue
  primaryDark: '#0051D4',      // Darker blue for pressed states
  primaryLight: '#4DB2FF',     // Lighter blue for backgrounds
  
  // Secondary Colors
  secondary: '#34C759',        // Success Green
  secondaryLight: '#4ADB6A',   // Light green
  
  // Neutral Colors
  background: '#F2F2F7',       // Light gray background
  surface: '#FFFFFF',          // White surface
  surfaceSecondary: '#F8F9FA', // Light surface variant
  
  // Text Colors
  textPrimary: '#1C1C1E',      // Primary text (dark)
  textSecondary: '#8E8E93',    // Secondary text (gray)
  textTertiary: '#C7C7CC',     // Tertiary text (light gray)
  textInverse: '#FFFFFF',      // White text for dark backgrounds
  
  // Status Colors
  success: '#34C759',          // Green
  warning: '#FF9500',          // Orange
  error: '#FF3B30',            // Red
  info: '#007AFF',             // Blue
  
  // Border Colors
  border: '#E5E5EA',           // Light border
  borderSecondary: '#C7C7CC',  // Medium border
  
  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
} as const;

export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  
  // Font Weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// Common component sizes
export const ComponentSizes = {
  button: {
    height: {
      sm: 36,
      base: 44,
      lg: 52,
    },
    paddingHorizontal: {
      sm: Spacing.md,
      base: Spacing.base,
      lg: Spacing.lg,
    },
  },
  input: {
    height: 44,
    paddingHorizontal: Spacing.base,
  },
  checkbox: {
    size: 28,
  },
  avatar: {
    sm: 32,
    base: 48,
    lg: 64,
  },
} as const;

// Accessibility guidelines
export const Accessibility = {
  minTouchTarget: 44, // Minimum touch target size (iOS HIG)
  minContrastRatio: 4.5, // WCAG AA compliance
  focusRingWidth: 2,
  focusRingColor: Colors.primary,
} as const;

// Common style presets
export const StylePresets = {
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    ...Shadows.base,
  },
  button: {
    primary: {
      backgroundColor: Colors.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.base,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: ComponentSizes.button.height.base,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.base,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: ComponentSizes.button.height.base,
    },
  },
  text: {
    heading1: {
      fontSize: Typography.fontSize['3xl'],
      fontWeight: Typography.fontWeight.bold,
      color: Colors.textPrimary,
      lineHeight: Typography.fontSize['3xl'] * Typography.lineHeight.tight,
    },
    heading2: {
      fontSize: Typography.fontSize['2xl'],
      fontWeight: Typography.fontWeight.bold,
      color: Colors.textPrimary,
      lineHeight: Typography.fontSize['2xl'] * Typography.lineHeight.tight,
    },
    heading3: {
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.semibold,
      color: Colors.textPrimary,
      lineHeight: Typography.fontSize.xl * Typography.lineHeight.normal,
    },
    body: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: Colors.textPrimary,
      lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
    },
    bodySecondary: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: Colors.textSecondary,
      lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
    },
    caption: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      color: Colors.textSecondary,
      lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    },
    button: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.semibold,
      color: Colors.textInverse,
    },
  },
} as const;

export type Theme = {
  colors: typeof Colors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
  componentSizes: typeof ComponentSizes;
  accessibility: typeof Accessibility;
  stylePresets: typeof StylePresets;
};

export const theme: Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  componentSizes: ComponentSizes,
  accessibility: Accessibility,
  stylePresets: StylePresets,
};
