/**
 * Exeter Marketplace - Mobile App Entry
 */
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { onSnapshot, collection } from 'firebase/firestore';
import { firestore } from './src/config/firebase';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { WatchlistProvider, useWatchlist } from './src/context/WatchlistContext';
import { UnreadProvider } from './src/context/UnreadContext';
import AppNavigator from './src/navigation/AppNavigator';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from './src/services/notifications';
import { savePushToken } from './src/services/pushToken';

const navigationRef = createNavigationContainerRef();

function RootNavigator() {
  const [items, setItems] = useState([]);
  const { has, toggle } = useWatchlist();
  const { loading } = useAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'items'), (snapshot) => {
      const itemsData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setItems(itemsData);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <AppNavigator
      items={items}
      hasFavorite={has}
      onFavoritePress={(item) => toggle(item.id)}
    />
  );
}

function AppContent() {
  const { user } = useAuth();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!user?.uid) return;
    registerForPushNotificationsAsync().then((token) => {
      if (token) savePushToken(user.uid, token).catch(() => {});
    });
  }, [user?.uid]);

  useEffect(() => {
    notificationListener.current = addNotificationReceivedListener(() => {});

    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content?.data ?? {};
      if (navigationRef.isReady() && data.conversationId) {
        navigationRef.navigate('ChatRoom', {
          conversationId: data.conversationId,
          itemId: data.itemId,
          itemTitle: data.itemTitle ?? 'Chat',
          sellerEmail: data.sellerEmail,
        });
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <UnreadProvider>
          <AppContent />
        </UnreadProvider>
      </WatchlistProvider>
    </AuthProvider>
  );
}
