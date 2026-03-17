/**
 * ConversationsScreen - Premium dark messaging inbox
 * Clean, formal list design
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserConversations } from '../services/chat';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../theme/constants';

function formatTime(timestamp) {
  if (!timestamp?.toMillis) return '';
  const d = new Date(timestamp.toMillis());
  const now = new Date();
  const diff = now - d;
  
  // Within 24 hours - show time
  if (diff < 86400000) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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
            <Text style={styles.conversationName} numberOfLines={1}>
              {otherName}
            </Text>
            <Text style={styles.conversationTime}>
              {formatTime(item.lastMessageAt)}
            </Text>
          </View>
          <Text style={styles.conversationTitle} numberOfLines={1}>
            {item.itemTitle}
          </Text>
          {item.lastMessage && (
            <Text style={styles.conversationPreview} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          )}
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {!user ? (
        <View style={styles.guestContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="lock-closed-outline" size={32} color={COLORS.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptySubtitle}>
            Sign in to view your messages and conversations with sellers
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
            <Ionicons name="chatbubbles-outline" size={32} color={COLORS.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No Conversations</Text>
          <Text style={styles.emptySubtitle}>
            Contact a seller to start a conversation
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.text}
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
    paddingVertical: SPACING.sm,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 76,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
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
    maxWidth: 280,
  },
  signInBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xl,
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
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  conversationContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xxs,
  },
  conversationName: {
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
  conversationTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxs,
  },
  conversationPreview: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
  },
});
