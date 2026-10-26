import { StyleSheet } from 'react-native';

import { AppButton, AppText, Screen } from '@/components/common';
import { useAuthStore } from '@/store';
import { theme } from '@/theme';

export function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleSignOut = async () => {
    try {
      await clearSession();
    } catch (error) {
      console.error('Failed to clear the session.', error);
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <AppText variant="title">Home</AppText>
      <AppText style={styles.description}>
        {user?.name
          ? `Welcome, ${user.name}! The reusable Expo template is running.`
          : 'The reusable Expo template is running.'}
      </AppText>
      <AppButton
        title="Sign Out"
        variant="outline"
        fullWidth
        onPress={handleSignOut}
      />
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
