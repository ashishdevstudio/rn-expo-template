import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { theme } from '@/theme';

import { AppText } from './AppText';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export function AppInput({
  label,
  error,
  helperText,
  accessibilityLabel,
  placeholderTextColor = theme.colors.textSecondary,
  style,
  ...props
}: AppInputProps) {
  return (
    <View>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <TextInput
        {...props}
        accessibilityLabel={accessibilityLabel ?? label}
        placeholderTextColor={placeholderTextColor}
        style={[styles.input, error ? styles.inputError : null, style]}
      />

      {error ? (
        <AppText variant="caption" style={[styles.message, styles.error]}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" style={[styles.message, styles.helper]}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.md,
    minHeight: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  message: {
    marginTop: theme.spacing.xs,
  },
  error: {
    color: theme.colors.error,
  },
  helper: {
    color: theme.colors.textSecondary,
  },
});
