import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { theme } from '@/theme';

export type AppTextVariant = 'body' | 'caption' | 'label' | 'heading' | 'title';

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
}

export function AppText({ variant = 'body', style, ...props }: AppTextProps) {
  return <Text {...props} style={[styles.base, variantStyles[variant], style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.textPrimary,
  },
  body: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.regular,
    lineHeight: theme.typography.lineHeight.md,
  },
  caption: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.regular,
    lineHeight: theme.typography.lineHeight.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    lineHeight: theme.typography.lineHeight.sm,
  },
  heading: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    lineHeight: theme.typography.lineHeight.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.typography.lineHeight.xxl,
  },
});

const variantStyles: Record<AppTextVariant, TextStyle> = {
  body: styles.body,
  caption: styles.caption,
  label: styles.label,
  heading: styles.heading,
  title: styles.title,
};
