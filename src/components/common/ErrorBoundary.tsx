import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { Screen } from './Screen';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; resetError: () => void }) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    console.error('Unhandled application error:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.resetError,
        });
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Screen contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <AppText variant="heading" style={styles.title}>
              Something went wrong
            </AppText>
            <AppText style={styles.message}>
              {this.state.error.message || 'An unexpected error occurred.'}
            </AppText>
            <AppButton
              title="Try Again"
              onPress={this.resetError}
              style={styles.button}
              fullWidth
            />
          </View>
        </Screen>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.md,
  },
});

