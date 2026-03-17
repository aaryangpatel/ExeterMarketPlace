/**
 * ItemCard - Premium dark marketplace card
 * Clean, formal design without emojis
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '../theme/constants';

export default function ItemCard({ item, onPress, onMessagePress, isFavorite, onFavoritePress }) {
  const isSold = item.status === 'sold';
  const isFree = !item.price || item.price.toLowerCase() === 'free';

  const formatPrice = (price) => {
    if (!price || price.toLowerCase() === 'free') return 'Free';
    if (price.startsWith('$')) return price;
    return `$${price}`;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress?.(item)}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        {(item.imagesBase64?.[0] ?? item.imageBase64) ? (
          <Image
            source={{ uri: item.imagesBase64?.[0] ?? item.imageBase64 }}
            style={styles.image}
            contentFit="cover"
            recyclingKey={item.id}
            transition={200}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={COLORS.textTertiary} />
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        
        {/* Sold Badge */}
        {isSold && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldBadgeText}>SOLD</Text>
          </View>
        )}

        {/* Favorite Button */}
        {onFavoritePress && (
          <TouchableOpacity
            onPress={() => onFavoritePress(item)}
            style={styles.favoriteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <View style={[styles.favoriteCircle, isFavorite && styles.favoriteCircleActive]}>
              <Ionicons 
                name={isFavorite ? 'heart' : 'heart-outline'} 
                size={18} 
                color={isFavorite ? COLORS.primary : COLORS.text} 
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Price */}
        <Text style={[styles.price, isFree && styles.priceFree, isSold && styles.priceSold]}>
          {isSold ? 'Sold' : formatPrice(item.price)}
        </Text>

        {/* Location */}
        {item.location ? (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textTertiary} />
            <Text style={styles.location} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        ) : null}

        {/* Message Button */}
        {onMessagePress && !isSold && (
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => onMessagePress(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.messageButtonText}>Contact Seller</Text>
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: COLORS.backgroundTertiary,
  },
  image: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    gap: SPACING.sm,
  },
  placeholderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  soldBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.soldBadge,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.xs,
  },
  soldBadgeText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  favoriteCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  favoriteCircleActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    lineHeight: FONT_SIZES.lg * 1.3,
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.priceGreen,
    marginBottom: SPACING.sm,
  },
  priceFree: {
    color: COLORS.priceFree,
  },
  priceSold: {
    color: COLORS.sold,
    textDecorationLine: 'line-through',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  location: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  messageButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  messageButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
