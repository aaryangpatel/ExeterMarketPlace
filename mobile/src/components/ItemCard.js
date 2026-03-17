/**
 * ItemCard - Professional marketplace card design.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../theme/constants';

export default function ItemCard({ item, onPress, onMessagePress, isFavorite, onFavoritePress }) {
  const isSold = item.status === 'sold';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(item)}
      activeOpacity={0.9}
    >
      {item.imageBase64 ? (
        <Image
          source={{ uri: item.imageBase64 }}
          style={styles.image}
          contentFit="cover"
          recyclingKey={item.id}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}
      {isSold && (
        <View style={styles.soldBadge}>
          <Text style={styles.soldBadgeText}>SOLD</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {onFavoritePress && (
            <TouchableOpacity
              onPress={() => onFavoritePress(item)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.favBtn}
            >
              <Text style={styles.favIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.price}>{item.price || 'Free'}</Text>
        {item.location ? (
          <Text style={styles.location} numberOfLines={1}>
            {item.location}
          </Text>
        ) : null}
        {onMessagePress && !isSold && (
          <TouchableOpacity
            style={styles.messageBtn}
            onPress={() => onMessagePress(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.messageBtnText}>Message Seller</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.borderLight,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.text,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  soldBadgeText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  content: {
    padding: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  favBtn: { padding: SPACING.xs },
  favIcon: { fontSize: 22 },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  location: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  messageBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  messageBtnText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
});
