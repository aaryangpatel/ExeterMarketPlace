/**
 * Watchlist service - AsyncStorage for favorited item IDs.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@exeter_watchlist';

export async function getWatchlist() {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

export async function addToWatchlist(itemId) {
  const list = await getWatchlist();
  if (list.includes(itemId)) return list;
  const next = [...list, itemId];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function removeFromWatchlist(itemId) {
  const list = await getWatchlist();
  const next = list.filter((id) => id !== itemId);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function toggleWatchlist(itemId) {
  const list = await getWatchlist();
  const has = list.includes(itemId);
  const next = has ? list.filter((id) => id !== itemId) : [...list, itemId];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
