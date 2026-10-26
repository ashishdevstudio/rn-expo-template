import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppFonts } from '@/hooks/useAppFonts';
import { StartupScreen } from '@/screens/StartupScreen';
import { useAppStore, useAuthStore } from '@/store';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const { fontsLoaded } = useAppFonts();

  if (isInitializing || !hasHydrated || !fontsLoaded) {
    return <StartupScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
