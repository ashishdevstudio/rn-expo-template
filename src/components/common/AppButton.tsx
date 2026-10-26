import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { theme } from '@/theme';

import { AppText } from './AppText';

export type AppButtonVariant = 'primary' | 'secondary' | 'outline';

export interface AppButtonProps
  extends Omit<PressableProps, 'children' | 'disabled' | 'onPress'> {
  title: string;
  onPress: NonNullable<PressableProps['onPress']>;
  variant?: AppButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  style,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const textStyle = textStyles[variant];

  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityState={{
        ...accessibilityState,
        busy: loading,
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      onPress={onPress}
      style={(state) => [
        styles.base,
        containerStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        state.pressed && !isDisabled && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textStyle.color} size="small" />
      ) : (
        <AppText variant="label" style={textStyle}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    height: theme.spacing.xxl,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.primary,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  lightText: {
    color: theme.colors.white,
  },
  outlineText: {
    color: theme.colors.primary,
  },
});

const containerStyles: Record<AppButtonVariant, ViewStyle> = {
  primary: styles.primary,
  secondary: styles.secondary,
  outline: styles.outline,
};

const textStyles: Record<AppButtonVariant, TextStyle> = {
  primary: styles.lightText,
  secondary: styles.lightText,
  outline: styles.outlineText,
};
