import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import { useStyles } from '../styles/useStyles';
import { theme } from '../styles/theme';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  testID?: string;
  children?: React.ReactNode;
}

/**
 * 접근성을 고려한 버튼 컴포넌트
 * - 최소 터치 영역 44x44 보장
 * - 적절한 접근성 레이블 및 힌트
 * - 색상 대비 4.5:1 이상 유지
 * - VoiceOver 지원
 */
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'base',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
  children,
}) => {
  const styles = useStyles();

  // 버튼 스타일 선택
  const getButtonStyle = () => {
    const baseStyle = variant === 'primary' 
      ? styles.buttonPrimary 
      : variant === 'danger'
      ? styles.buttonDanger
      : styles.buttonSecondary;

    const sizeStyle = {
      minHeight: theme.componentSizes.button.height[size],
      paddingHorizontal: theme.componentSizes.button.paddingHorizontal[size],
    };

    return [baseStyle, sizeStyle];
  };

  // 텍스트 스타일 선택
  const getTextStyle = () => {
    const baseTextStyle = styles.textButton;
    
    // Secondary 버튼은 텍스트 색상이 다름
    const colorStyle = variant === 'secondary' 
      ? { color: theme.colors.primary }
      : {};

    // 비활성화 상태
    const disabledStyle = disabled 
      ? { color: theme.colors.textSecondary }
      : {};

    return [baseTextStyle, colorStyle, disabledStyle];
  };

  // 접근성 상태 설정
  const accessibilityState = {
    disabled: disabled || loading,
    busy: loading,
  };

  return (
    <TouchableOpacity
      style={[
        ...getButtonStyle(),
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'secondary' ? theme.colors.primary : theme.colors.textInverse} 
        />
      ) : (
        <>
          {children || (
            <Text style={[...getTextStyle(), textStyle]}>
              {title}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * 접근성을 고려한 체크박스 컴포넌트
 */
interface AccessibleCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
  testID?: string;
}

export const AccessibleCheckbox: React.FC<AccessibleCheckboxProps> = ({
  checked,
  onToggle,
  label,
  disabled = false,
  style,
  accessibilityHint,
  testID,
}) => {
  const styles = useStyles();

  const accessibilityState = {
    checked,
    disabled,
  };

  return (
    <TouchableOpacity
      style={[
        styles.checkbox,
        checked && styles.checkboxChecked,
        disabled && { opacity: 0.5 },
        style,
      ]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint || `${checked ? '선택됨' : '선택되지 않음'}. 탭하여 ${checked ? '해제' : '선택'}하기`}
      accessibilityState={accessibilityState}
      testID={testID}
    >
      {checked && (
        <Text style={styles.checkboxText}>✓</Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * 접근성을 고려한 헤더 텍스트 컴포넌트
 */
interface AccessibleHeaderProps {
  children: React.ReactNode;
  level: 1 | 2 | 3;
  style?: TextStyle;
  accessibilityLabel?: string;
  testID?: string;
}

export const AccessibleHeader: React.FC<AccessibleHeaderProps> = ({
  children,
  level,
  style,
  accessibilityLabel,
  testID,
}) => {
  const styles = useStyles();

  const getHeaderStyle = () => {
    switch (level) {
      case 1:
        return styles.textHeading1;
      case 2:
        return styles.textHeading2;
      case 3:
        return styles.textHeading3;
      default:
        return styles.textHeading2;
    }
  };

  return (
    <Text
      style={[getHeaderStyle(), style]}
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel}
      accessibilityLevel={level}
      testID={testID}
    >
      {children}
    </Text>
  );
};

/**
 * 접근성을 고려한 진행률 바 컴포넌트
 */
interface AccessibleProgressBarProps {
  progress: number; // 0-1 사이 값
  label: string;
  style?: ViewStyle;
  accessibilityHint?: string;
  testID?: string;
}

export const AccessibleProgressBar: React.FC<AccessibleProgressBarProps> = ({
  progress,
  label,
  style,
  accessibilityHint,
  testID,
}) => {
  const styles = useStyles();
  const percentage = Math.round(progress * 100);

  return (
    <View
      style={[styles.progressBar, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint || `진행률 ${percentage}%`}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: percentage,
        text: `${percentage}%`,
      }}
      testID={testID}
    >
      <View
        style={[
          styles.progressBarFill,
          { width: `${percentage}%` },
        ]}
      />
    </View>
  );
};
