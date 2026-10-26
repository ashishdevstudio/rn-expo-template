import { useFonts, type FontSource } from 'expo-font';

// Register project-specific font files here when a project adds them.
const appFonts = {} satisfies Record<string, FontSource>;

export function useAppFonts() {
  const [fontsLoaded, fontError] = useFonts(appFonts);

  return {
    fontsLoaded,
    fontError: fontError ?? undefined,
  };
}
