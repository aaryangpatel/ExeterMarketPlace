/**
 * Track last-read timestamp per conversation for unread badge.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@exeter_lastRead';

export async function getLastReadMap() {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  return typeof parsed === 'object' ? parsed : {};
}

export async function setLastRead(conversationId, timestampMs) {
  const map = await getLastReadMap();
  map[conversationId] = timestampMs;
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
}

export function countUnread(conversations, userEmail, lastReadMap = {}) {
  return conversations.filter((c) => {
    const lastAt = c.lastMessageAt?.toMillis?.();
    if (!lastAt || !c.lastMessage) return false;
    if (c.lastMessageSenderId === userEmail) return false;
    const readAt = lastReadMap[c.id] ?? 0;
    return lastAt > readAt;
  }).length;
}
