/**
 * ItemList - Premium dark marketplace feed
 * Clean, formal design without emojis
 */
import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ItemCard from './ItemCard';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../theme/constants';

export default function ItemList({
  items,
  onItemPress,
  onMessagePress,
  hasFavorite,
  onFavoritePress,
  ListHeaderComponent,
  onRefresh,
  refreshing = false,
  emptyTitle = 'No Items Yet',
  emptySubtitle = 'Be the first to post something',
}) {
  const list = items ?? [];

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cube-outline" size={32} color={COLORS.textTertiary} />
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
            tintColor={COLORS.text}
            colors={[COLORS.text]}
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
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
    maxWidth: 280,
  },
});
