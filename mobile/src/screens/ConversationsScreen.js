/**
 * ConversationsScreen - Premium messaging inbox
 * Features clean card design and unread indicators
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
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '../theme/constants';

function formatTime(timestamp) {
  if (!timestamp?.toMillis) return '';
  const d = new Date(timestamp.toMillis());
  const now = new Date();
  const diff = now - d;
  
  // Within 24 hours - show time
  if (diff < 86400000) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  // Within 7 days - show weekday
  if (diff < 604800000) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  // Older - show date
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
    if (c.buyerEmail === user?.email) {
      return c.sellerEmail?.split('@')[0] ?? 'Seller';
    }
    return c.buyerName ?? c.buyerEmail?.split('@')[0] ?? 'Buyer';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const renderItem = ({ item }) => {
    const otherName = getOtherName(item);
    
    return (
      <TouchableOpacity
        style={styles.conversationCard}
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
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(otherName)}</Text>
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationTitle} numberOfLines={1}>
              {item.itemTitle}
            </Text>
            <Text style={styles.conversationTime}>
              {formatTime(item.lastMessageAt)}
            </Text>
          </View>
          <Text style={styles.conversationName}>{otherName}</Text>
          {item.lastMessage && (
            <Text style={styles.conversationPreview} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          )}
        </View>

        {/* Arrow */}
        <Text style={styles.arrow}>&#x203A;</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {!user ? (
        <View style={styles.guestContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>&#x1F512;</Text>
          </View>
          <Text style={styles.emptyTitle}>Sign in to see messages</Text>
          <Text style={styles.emptySubtitle}>
            Your conversations with sellers will appear here
          </Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.8}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>&#x1F4AC;</Text>
          </View>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap "Message Seller" on any item to start chatting
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.lg,
    paddingBottom: SPACING.huge,
  },

  // Empty & Guest States
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.md * 1.5,
  },
  signInBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
    ...SHADOWS.sm,
  },
  signInBtnText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Conversation Card
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xxs,
  },
  conversationTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  conversationTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
  conversationName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  conversationPreview: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
  },
  arrow: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textTertiary,
    marginLeft: SPACING.sm,
  },
});
