/**
 * ChatRoomScreen - iMessage-style chat interface
 * Clean, formal messaging with blue/gray bubbles
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useUnread } from '../context/UnreadContext';
import {
  getOrCreateConversation,
  subscribeToMessages,
  sendMessage,
} from '../services/chat';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../theme/constants';

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
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toMillis) return '';
    const date = new Date(timestamp.toMillis());
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.info} />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  const renderMessage = ({ item, index }) => {
    const isMe = item.senderId === user?.email;
    const prevItem = messages[index - 1];
    const nextItem = messages[index + 1];
    const showDate = !prevItem || 
      formatDate(item.createdAt) !== formatDate(prevItem?.createdAt);
    
    // Check if this is part of a group of messages from the same sender
    const isFirstInGroup = !prevItem || prevItem.senderId !== item.senderId || showDate;
    const isLastInGroup = !nextItem || nextItem.senderId !== item.senderId;

    return (
      <>
        {showDate && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
        <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
          <View style={[
            styles.bubble, 
            isMe ? styles.bubbleMe : styles.bubbleThem,
            isFirstInGroup && (isMe ? styles.bubbleMeFirst : styles.bubbleThemFirst),
            isLastInGroup && (isMe ? styles.bubbleMeLast : styles.bubbleThemLast),
          ]}>
            <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
              {item.text}
            </Text>
          </View>
          {isLastInGroup && (
            <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
              {formatTime(item.createdAt)}
            </Text>
          )}
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
      {/* Item Context Bar */}
      <View style={styles.contextBar}>
        <Text style={styles.contextText}>Regarding: {itemTitle}</Text>
      </View>

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
              <Ionicons name="chatbubbles-outline" size={32} color={COLORS.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No Messages Yet</Text>
            <Text style={styles.emptySubtitle}>
              Send a message to start the conversation
            </Text>
          </View>
        )}
      />

      {/* Input Bar - iMessage style */}
      <View style={styles.inputBar}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Message"
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
            <Ionicons name="arrow-up" size={20} color={COLORS.textInverse} />
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
  
  // Context Bar
  contextBar: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contextText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
  },
  messageRow: {
    marginBottom: SPACING.xxs,
    alignItems: 'flex-start',
  },
  messageRowMe: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  bubbleMe: {
    backgroundColor: COLORS.chatBubbleOwn,
    borderBottomRightRadius: RADIUS.xs,
  },
  bubbleThem: {
    backgroundColor: COLORS.chatBubbleOther,
    borderBottomLeftRadius: RADIUS.xs,
  },
  bubbleMeFirst: {
    borderTopRightRadius: RADIUS.xl,
  },
  bubbleThemFirst: {
    borderTopLeftRadius: RADIUS.xl,
  },
  bubbleMeLast: {
    borderBottomRightRadius: RADIUS.xs,
    marginBottom: SPACING.xs,
  },
  bubbleThemLast: {
    borderBottomLeftRadius: RADIUS.xs,
    marginBottom: SPACING.xs,
  },
  bubbleText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.chatTextOther,
    lineHeight: FONT_SIZES.md * 1.35,
  },
  bubbleTextMe: {
    color: COLORS.chatTextOwn,
  },
  messageTime: {
    fontSize: FONT_SIZES.xxs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xxs,
    marginLeft: SPACING.xs,
  },
  messageTimeMe: {
    marginRight: SPACING.xs,
    marginLeft: 0,
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
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
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

  // Input Bar - iMessage style
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 100,
  },
  input: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 80,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surfaceHighlight,
  },
});
