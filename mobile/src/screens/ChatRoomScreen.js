/**
 * ChatRoomScreen - Real-time chat for an item.
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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useUnread } from '../context/UnreadContext';
import {
  getOrCreateConversation,
  subscribeToMessages,
  sendMessage,
} from '../services/chat';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../theme/constants';

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

  const handleSend = () => {
    const text = input.trim();
    if (!text || !conversationId || !user) return;
    sendMessage(
      conversationId,
      user.email,
      user.displayName ?? user.email.split('@')[0],
      text
    );
    setInput('');
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => {
          const isMe = item.senderId === user?.email;
          return (
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.text}</Text>
              <Text style={[styles.bubbleMeta, isMe && styles.bubbleMetaMe]}>
                {item.senderName} • {item.createdAt?.toMillis?.()
                  ? new Date(item.createdAt.toMillis()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''}
              </Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim()}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  messages: { padding: SPACING.md, paddingBottom: SPACING.lg },
  bubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  bubbleTextMe: { color: COLORS.surface },
  bubbleMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  bubbleMetaMe: { color: 'rgba(255,255,255,0.8)' },
  inputRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
    marginRight: SPACING.sm,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: COLORS.surface, fontWeight: '600' },
});
