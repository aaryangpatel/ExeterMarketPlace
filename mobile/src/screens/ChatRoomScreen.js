/**
 * ChatRoomScreen - Premium real-time chat interface
 * Features modern bubble design and smooth interactions
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useUnread } from '../context/UnreadContext';
import {
  getOrCreateConversation,
  subscribeToMessages,
  sendMessage,
} from '../services/chat';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '../theme/constants';

export default function ChatRoomScreen({ route, navigation }) {
  const { user } = useAuth();
  const { markRead } = useUnread();
  const {
    conversationId: existingId,
    itemId,
    itemTitle,
    sellerEmail,
    buyerEmail,
    buyerName,
  } = route.params ?? {};

  const [conversationId, setConversationId] = useState(existingId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(!existingId);
  const [sending, setSending] = useState(false);
  const flatRef = useRef(null);

  useEffect(() => {
    if (!user?.email) return;

    const init = async () => {
      if (existingId) {
        setConversationId(existingId);
        setLoading(false);
        return;
      }
      const cid = await getOrCreateConversation(
        user.email,
        user.displayName ?? user.email.split('@')[0],
        sellerEmail,
        itemId,
        itemTitle
      );
      setConversationId(cid);
      setLoading(false);
    };
    init();
  }, [existingId, itemId, itemTitle, sellerEmail, user?.email, user?.displayName]);

  useEffect(() => {
    if (!conversationId) return;
    markRead(conversationId);
    const unsub = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
    });
    return unsub;
  }, [conversationId, markRead]);

  useEffect(() => {
    if (messages.length > 0 && flatRef.current) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !conversationId || !user || sending) return;
    
    setSending(true);
    setInput('');
    
    try {
      await sendMessage(
        conversationId,
        user.email,
        user.displayName ?? user.email.split('@')[0],
        text
      );
    } catch (err) {
      setInput(text);
    }
    setSending(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.toMillis) return '';
    const date = new Date(timestamp.toMillis());
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toMillis) return '';
    const date = new Date(timestamp.toMillis());
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  const renderMessage = ({ item, index }) => {
    const isMe = item.senderId === user?.email;
    const prevItem = messages[index - 1];
    const showDate = !prevItem || 
      formatDate(item.createdAt) !== formatDate(prevItem?.createdAt);

    return (
      <>
        {showDate && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
        <View style={[styles.messageContainer, isMe && styles.messageContainerMe]}>
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.messageMeta, isMe && styles.messageMetaMe]}>
            {isMe ? '' : `${item.senderName} \u00B7 `}{formatTime(item.createdAt)}
          </Text>
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>&#x1F4AC;</Text>
            </View>
            <Text style={styles.emptyTitle}>Start the conversation</Text>
            <Text style={styles.emptySubtitle}>
              Send a message to discuss "{itemTitle}"
            </Text>
          </View>
        )}
      />

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textTertiary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            editable={!sending}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!input.trim() || sending) && styles.sendBtnDisabled,
          ]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
          activeOpacity={0.8}
        >
          {sending ? (
            <ActivityIndicator size="small" color={COLORS.textInverse} />
          ) : (
            <Text style={styles.sendBtnText}>&#x2191;</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },

  // Messages
  messageList: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dateHeaderText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textTertiary,
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  messageContainer: {
    marginBottom: SPACING.sm,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageContainerMe: {
    alignSelf: 'flex-end',
  },
  bubble: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: RADIUS.xs,
  },
  bubbleThem: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: RADIUS.xs,
    ...SHADOWS.xs,
  },
  bubbleText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: FONT_SIZES.md * 1.4,
  },
  bubbleTextMe: {
    color: COLORS.textInverse,
  },
  messageMeta: {
    fontSize: FONT_SIZES.xxs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  messageMetaMe: {
    textAlign: 'right',
    marginRight: SPACING.xs,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xxl,
  },

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    maxHeight: 120,
  },
  input: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.border,
    ...SHADOWS.none,
  },
  sendBtnText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textInverse,
  },
});
