/**
 * UnreadContext - Unread message count for tab badge.
 */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToUserConversations } from '../services/chat';
import { getLastReadMap, setLastRead, countUnread } from '../services/unread';

const UnreadContext = createContext(null);

export function UnreadProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [lastReadMap, setLastReadMap] = useState({});

  useEffect(() => {
    getLastReadMap().then(setLastReadMap);
  }, []);

  useEffect(() => {
    if (!user?.email) {
      setConversations([]);
      setUnreadCount(0);
      return;
    }
    const unsub = subscribeToUserConversations(user.email, (convs) => {
      setConversations(convs);
      getLastReadMap().then((map) => {
        setLastReadMap(map);
        setUnreadCount(countUnread(convs, user.email, map));
      });
    });
    return unsub;
  }, [user?.email]);

  const convsRef = useRef([]);
  const mapRef = useRef({});
  convsRef.current = conversations;
  mapRef.current = lastReadMap;

  const markRead = (conversationId) => {
    const now = Date.now();
    const newMap = { ...mapRef.current, [conversationId]: now };
    setLastRead(conversationId, now).then(() => {
      setLastReadMap(newMap);
      setUnreadCount(countUnread(convsRef.current, user?.email ?? '', newMap));
    });
  };

  return (
    <UnreadContext.Provider value={{ unreadCount, markRead }}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread() {
  const ctx = useContext(UnreadContext);
  return ctx ?? { unreadCount: 0, markRead: () => {} };
}
