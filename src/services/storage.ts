import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async set<T>(key: string, value: T): Promise<void> {
    const serializedValue = JSON.stringify(value);

    if (serializedValue === undefined) {
      throw new TypeError('Storage values must be JSON-serializable.');
    }

    await AsyncStorage.setItem(key, serializedValue);
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);

      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`Failed to read or parse storage key "${key}":`, error);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};
