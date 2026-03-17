/**
 * FavoritesScreen - Premium saved items / watchlist
 * Features clean header and polished empty state
 */
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ItemList from '../components/ItemList';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../theme/constants';

export default function FavoritesScreen({ items }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { ids, has, toggle } = useWatchlist();
  const [refreshing, setRefreshing] = useState(false);

  const favItems = useMemo(
    () => items.filter((i) => ids.includes(i.id)),
    [items, ids]
  );

  const handleItemPress = (item) => navigation.navigate('ItemDetail', { item });
  
  const handleMessagePress = (item) => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to message the seller.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('SignIn') },
        ]
      );
      return;
    }
    if (user.email === item.ownerEmail) {
      Alert.alert('Unable to Message', "You can't message yourself.");
      return;
    }
    navigation.navigate('ChatRoom', {
      itemId: item.id,
      itemTitle: item.title,
      sellerEmail: item.ownerEmail,
      sellerName: item.owner,
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Saved Items</Text>
      <Text style={styles.subtitle}>
        {favItems.length === 0
          ? 'Items you save will appear here'
          : `${favItems.length} ${favItems.length === 1 ? 'item' : 'items'} saved`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ItemList
        items={favItems}
        onItemPress={handleItemPress}
        onMessagePress={handleMessagePress}
        hasFavorite={has}
        onFavoritePress={(item) => toggle(item.id)}
        ListHeaderComponent={ListHeader}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyTitle="No saved items"
        emptySubtitle="Tap the heart on any item to save it here for later"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
