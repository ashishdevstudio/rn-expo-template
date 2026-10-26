import { ActivityIndicator, StyleSheet } from 'react-native';

import { Screen } from '@/components/common';
import { theme } from '@/theme';

export function StartupScreen() {
  return (
    <Screen contentContainerStyle={styles.container}>
      <ActivityIndicator
        accessibilityLabel="Loading"
        color={theme.colors.primary}
        size="large"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
