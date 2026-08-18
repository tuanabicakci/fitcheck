import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  closet: 'fitcheck:closet',
  outfits: 'fitcheck:outfits',
  seeded: 'fitcheck:seeded',
} as const;

export async function loadJSON<T>(key: keyof typeof KEYS): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS[key]);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function saveJSON<T>(key: keyof typeof KEYS, value: T): Promise<void> {
  await AsyncStorage.setItem(KEYS[key], JSON.stringify(value));
}

export { KEYS };
