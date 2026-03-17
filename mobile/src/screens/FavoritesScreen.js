/**
 * FavoritesScreen - Watchlist / saved items.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ItemList from '../components/ItemList';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../theme/constants';

export default function FavoritesScreen({ items }) {
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleItemPress = (item) => navigation.navigate('ItemDetail', { item });
  const handleMessagePress = (item) => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to message the seller.');
      navigation.navigate('SignIn');
      return;
    }
    if (user.email === item.ownerEmail) {
      Alert.alert('Cannot message', "You can't message yourself.");
      return;
    }
    navigation.navigate('ChatRoom', {
      itemId: item.id,
      itemTitle: item.title,
      sellerEmail: item.ownerEmail,
      sellerName: item.owner,
    });
  };
  const { ids, has, toggle } = useWatchlist();
  const [refreshing, setRefreshing] = useState(false);
  const favItems = useMemo(
    () => items.filter((i) => ids.includes(i.id)),
    [items, ids]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Watchlist</Text>
      <ItemList
        items={favItems}
        onItemPress={handleItemPress}
        onMessagePress={handleMessagePress}
        hasFavorite={has}
        onFavoritePress={(item) => toggle(item.id)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyTitle="Watchlist empty"
        emptySubtitle="Tap the heart on items to save them here"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
});
