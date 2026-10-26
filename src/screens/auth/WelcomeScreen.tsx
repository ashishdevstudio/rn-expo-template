import { StyleSheet } from 'react-native';

import { AppButton, AppText, Screen } from '@/components/common';
import { useAuthStore } from '@/store';
import { theme } from '@/theme';

export function WelcomeScreen() {
  const setSession = useAuthStore((state) => state.setSession);

  const handleDemoSignIn = async () => {
    try {
      // This is a non-secret, template-only token. Replace it with a real login session.
      await setSession({
        accessToken: 'template-demo-token',
        user: { id: '1', name: 'Demo User', email: 'demo@example.com' },
      });
    } catch (error) {
      console.error('Failed to create the demo session.', error);
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <AppText variant="title">Welcome</AppText>
      <AppText style={styles.description}>
        Start building your next application from this reusable template.
      </AppText>
      <AppButton title="Continue" fullWidth onPress={handleDemoSignIn} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  description: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
