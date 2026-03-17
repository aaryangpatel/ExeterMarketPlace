/**
 * ConversationsScreen - List of chat threads.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserConversations } from '../services/chat';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../theme/constants';

function formatTime(timestamp) {
  if (!timestamp?.toMillis) return '';
  const d = new Date(timestamp.toMillis());
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString();
}

export default function ConversationsScreen({ navigation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    const unsub = subscribeToUserConversations(user.email, setConversations);
    return unsub;
  }, [user?.email]);

  const getOtherName = (c) => {
    if (c.buyerEmail === user?.email) return c.sellerEmail?.split('@')[0] ?? 'Seller';
    return c.buyerName ?? c.buyerEmail?.split('@')[0] ?? 'Buyer';
  };

  return (
    <View style={styles.container}>
      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Tap "Message Seller" on an item to start chatting</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setTimeout(() => setRefreshing(false), 600);
              }}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                navigation.navigate('ChatRoom', {
                  conversationId: item.id,
                  itemId: item.itemId,
                  itemTitle: item.itemTitle,
                  sellerEmail: item.sellerEmail,
                  buyerEmail: item.buyerEmail,
                  buyerName: item.buyerName,
                })
              }
            >
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{item.itemTitle}</Text>
                <Text style={styles.rowSub}>{getOtherName(item)}</Text>
                {item.lastMessage && (
                  <Text style={styles.rowPreview} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                )}
              </View>
              <Text style={styles.rowTime}>{formatTime(item.lastMessageAt)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  row: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  rowContent: { flex: 1 },
  rowTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  rowSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  rowPreview: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  rowTime: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
});
