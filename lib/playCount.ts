import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'daily_play_counts';
const MAX_PLAYS   = 5;

const todayKey = (): string => new Date().toLocaleDateString('en-CA');

async function readMap(): Promise<Record<string, number>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function writeMap(map: Record<string, number>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function getPlayCount(): Promise<number> {
  const map = await readMap();
  return map[todayKey()] ?? 0;
}

export async function incrementPlayCount(): Promise<number> {
  const map  = await readMap();
  const key  = todayKey();
  const next = Math.min((map[key] ?? 0) + 1, MAX_PLAYS);
  map[key]   = next;
  await writeMap(map);
  return next;
}

export async function resetPlayCount(): Promise<void> {
  const map = await readMap();
  delete map[todayKey()];
  await writeMap(map);
}