/**
 * Chat service - Firestore-based real-time messaging.
 * Conversations: conversations/{id} with subcollection messages.
 */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

const CONVERSATIONS = 'conversations';
const MESSAGES = 'messages';

/**
 * Get or create a conversation between buyer and seller for an item.
 * @returns {Promise<string>} conversation ID
 */
export async function getOrCreateConversation(buyerEmail, buyerName, sellerEmail, itemId, itemTitle) {
  const convRef = collection(firestore, CONVERSATIONS);
  const q = query(
    convRef,
    where('itemId', '==', itemId),
    where('buyerEmail', '==', buyerEmail)
  );
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;

  const newConv = await addDoc(convRef, {
    buyerEmail,
    buyerName: buyerName || 'Buyer',
    sellerEmail,
    itemId,
    itemTitle,
    lastMessage: null,
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return newConv.id;
}

/**
 * Subscribe to all conversations for a user (buyer or seller).
 */
export function subscribeToUserConversations(userEmail, callback) {
  const buyerQ = query(
    collection(firestore, CONVERSATIONS),
    where('buyerEmail', '==', userEmail)
  );
  const sellerQ = query(
    collection(firestore, CONVERSATIONS),
    where('sellerEmail', '==', userEmail)
  );

  let buyerConvs = [];
  let sellerConvs = [];

  const mergeAndNotify = () => {
    const seen = new Set();
    const merged = [];
    [...buyerConvs, ...sellerConvs].forEach((c) => {
      if (seen.has(c.id)) return;
      seen.add(c.id);
      merged.push(c);
    });
    merged.sort((a, b) => {
      const ta = a.lastMessageAt?.toMillis?.() ?? 0;
      const tb = b.lastMessageAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    callback(merged);
  };

  const unsubB = onSnapshot(buyerQ, (snap) => {
    buyerConvs = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
    mergeAndNotify();
  });
  const unsubS = onSnapshot(sellerQ, (snap) => {
    sellerConvs = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
    mergeAndNotify();
  });

  return () => {
    unsubB();
    unsubS();
  };
}

/**
 * Subscribe to messages in a conversation.
 */
export function subscribeToMessages(conversationId, callback) {
  const q = query(
    collection(firestore, CONVERSATIONS, conversationId, MESSAGES),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    callback(msgs);
  });
}

/**
 * Send a message.
 */
export async function sendMessage(conversationId, senderId, senderName, text) {
  const msgRef = collection(firestore, CONVERSATIONS, conversationId, MESSAGES);
  await addDoc(msgRef, {
    text,
    senderId,
    senderName,
    createdAt: serverTimestamp(),
  });
  const convRef = doc(firestore, CONVERSATIONS, conversationId);
  await updateDoc(convRef, {
    lastMessage: text,
    lastMessageSenderId: senderId,
    lastMessageAt: serverTimestamp(),
  });
}
