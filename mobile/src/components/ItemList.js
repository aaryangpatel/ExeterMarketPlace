/**
 * ItemList - Premium marketplace feed layout
 * Features smooth scrolling, pull-to-refresh, and elegant empty states
 */
import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import ItemCard from './ItemCard';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, RADIUS } from '../theme/constants';

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
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>&#x1F4E6;</Text>
      </View>
      <Text style={styles.emptyTitle}>{emptyTitle}</Text>
      <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
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
            colors={[COLORS.primary]}
          />
        ) : undefined
      }
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={5}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  listEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 36,
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
  },
});
