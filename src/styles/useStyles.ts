import { StyleSheet } from 'react-native';
import { theme } from './theme';

/**
 * 공통 스타일 훅
 * 테마 기반의 스타일을 제공합니다.
 */
export const useStyles = () => {
  return StyleSheet.create({
    // Container styles
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    containerPadded: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.base,
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    
    // Layout styles
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    column: {
      flexDirection: 'column',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    // Card styles
    card: {
      ...theme.stylePresets.card,
    },
    cardPadded: {
      ...theme.stylePresets.card,
      padding: theme.spacing.lg,
    },
    
    // Button styles
    buttonPrimary: {
      ...theme.stylePresets.button.primary,
    },
    buttonSecondary: {
      ...theme.stylePresets.button.secondary,
    },
    buttonDanger: {
      ...theme.stylePresets.button.primary,
      backgroundColor: theme.colors.error,
    },
    buttonDisabled: {
      ...theme.stylePresets.button.primary,
      backgroundColor: theme.colors.textTertiary,
    },
    
    // Text styles
    textHeading1: theme.stylePresets.text.heading1,
    textHeading2: theme.stylePresets.text.heading2,
    textHeading3: theme.stylePresets.text.heading3,
    textBody: theme.stylePresets.text.body,
    textBodySecondary: theme.stylePresets.text.bodySecondary,
    textCaption: theme.stylePresets.text.caption,
    textButton: theme.stylePresets.text.button,
    textCenter: {
      textAlign: 'center',
    },
    
    // Input styles
    input: {
      height: theme.componentSizes.input.height,
      paddingHorizontal: theme.componentSizes.input.paddingHorizontal,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
    inputFocused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    
    // Loading styles
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
    },
    
    // List styles
    listItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    listItemLast: {
      borderBottomWidth: 0,
    },
    
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      margin: theme.spacing.base,
      minWidth: '80%',
      maxWidth: '90%',
      ...theme.shadows.lg,
    },
    
    // Separator styles
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.sm,
    },
    separatorThick: {
      height: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    
    // Status styles
    statusSuccess: {
      backgroundColor: theme.colors.success,
      color: theme.colors.textInverse,
    },
    statusWarning: {
      backgroundColor: theme.colors.warning,
      color: theme.colors.textInverse,
    },
    statusError: {
      backgroundColor: theme.colors.error,
      color: theme.colors.textInverse,
    },
    statusInfo: {
      backgroundColor: theme.colors.info,
      color: theme.colors.textInverse,
    },
    
    // Badge styles
    badge: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      minWidth: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textInverse,
    },
    
    // Checkbox styles
    checkbox: {
      width: theme.componentSizes.checkbox.size,
      height: theme.componentSizes.checkbox.size,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 2,
      borderColor: theme.colors.borderSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    checkboxText: {
      color: theme.colors.textInverse,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
    },
    
    // Progress bar styles
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.success,
      borderRadius: theme.borderRadius.sm,
    },
    
    // Debug styles (only for development)
    debugButton: {
      backgroundColor: theme.colors.warning,
      borderRadius: theme.borderRadius.base,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
      marginVertical: theme.spacing.xs,
      alignItems: 'center',
    },
    debugButtonText: {
      color: theme.colors.textInverse,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    debugContainer: {
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing.base,
      gap: theme.spacing.sm,
    },
  });
};

/**
 * 간격 유틸리티 함수
 */
export const spacing = {
  marginTop: (size: keyof typeof theme.spacing) => ({ marginTop: theme.spacing[size] }),
  marginBottom: (size: keyof typeof theme.spacing) => ({ marginBottom: theme.spacing[size] }),
  marginLeft: (size: keyof typeof theme.spacing) => ({ marginLeft: theme.spacing[size] }),
  marginRight: (size: keyof typeof theme.spacing) => ({ marginRight: theme.spacing[size] }),
  marginHorizontal: (size: keyof typeof theme.spacing) => ({ marginHorizontal: theme.spacing[size] }),
  marginVertical: (size: keyof typeof theme.spacing) => ({ marginVertical: theme.spacing[size] }),
  
  paddingTop: (size: keyof typeof theme.spacing) => ({ paddingTop: theme.spacing[size] }),
  paddingBottom: (size: keyof typeof theme.spacing) => ({ paddingBottom: theme.spacing[size] }),
  paddingLeft: (size: keyof typeof theme.spacing) => ({ paddingLeft: theme.spacing[size] }),
  paddingRight: (size: keyof typeof theme.spacing) => ({ paddingRight: theme.spacing[size] }),
  paddingHorizontal: (size: keyof typeof theme.spacing) => ({ paddingHorizontal: theme.spacing[size] }),
  paddingVertical: (size: keyof typeof theme.spacing) => ({ paddingVertical: theme.spacing[size] }),
};

/**
 * 반응형 텍스트 크기 계산
 */
export const getResponsiveFontSize = (baseSize: number, scale: number = 1) => {
  return Math.round(baseSize * scale);
};

/**
 * 접근성을 위한 최소 터치 영역 확보
 */
export const ensureMinTouchTarget = (size: number) => {
  return Math.max(size, theme.accessibility.minTouchTarget);
};
