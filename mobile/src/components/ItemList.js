/**
 * ItemList - Marketplace feed with card-based layout.
 */
import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import ItemCard from './ItemCard';
import { COLORS, SPACING, FONT_SIZES } from '../theme/constants';

export default function ItemList({
  items,
  onItemPress,
  onMessagePress,
  hasFavorite,
  onFavoritePress,
  ListHeaderComponent,
  onRefresh,
  refreshing = false,
  emptyTitle = 'No items yet',
  emptySubtitle = 'Be the first to post something!',
}) {
  const list = items ?? [];
  const ListEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{emptyTitle}</Text>
      <Text style={styles.emptySubtext}>{emptySubtitle}</Text>
    </View>
  );

  return (
    <FlatList
      data={list}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ItemCard
          item={item}
          onPress={onItemPress}
          onMessagePress={onMessagePress}
          isFavorite={hasFavorite?.(item.id)}
          onFavoritePress={onFavoritePress}
        />
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmpty}
      contentContainerStyle={[styles.list, list.length === 0 && styles.listEmpty]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  listEmpty: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
