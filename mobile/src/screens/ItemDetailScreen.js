/**
 * ItemDetailScreen - Premium item detail view
 * Features full-width image, clean layout, and prominent CTAs
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '../theme/constants';

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params ?? {};
  const { user } = useAuth();
  const { has, toggle } = useWatchlist();

  if (!item) return null;

  const isFav = has(item.id);
  const isSold = item.status === 'sold';
  const isFree = !item.price || item.price.toLowerCase() === 'free';

  const formatPrice = (price) => {
    if (!price || price.toLowerCase() === 'free') return 'Free';
    if (price.startsWith('$')) return price;
    return `$${price}`;
  };

  const handleMessage = () => {
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

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          {item.imageBase64 ? (
            <Image
              source={{ uri: item.imageBase64 }}
              style={styles.image}
              contentFit="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <View style={styles.placeholderIcon}>
                <Text style={styles.placeholderIconText}>IMG</Text>
              </View>
              <Text style={styles.placeholderText}>No image available</Text>
            </View>
          )}
          
          {/* Favorite Button */}
          <TouchableOpacity 
            style={styles.favoriteBtn}
            onPress={() => toggle(item.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.favoriteCircle, isFav && styles.favoriteCircleActive]}>
              <Text style={styles.favoriteIcon}>{isFav ? '\u2665' : '\u2661'}</Text>
            </View>
          </TouchableOpacity>

          {/* Sold Badge */}
          {isSold && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldBadgeText}>SOLD</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={[styles.price, isFree && styles.priceFree, isSold && styles.priceSold]}>
              {isSold ? 'Sold' : formatPrice(item.price)}
            </Text>
          </View>

          {/* Category Tag */}
          {item.category && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            
            {item.location && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>&#x1F4CD;</Text>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{item.location}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>&#x1F464;</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Seller</Text>
                <Text style={styles.detailValue}>{item.owner}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {!isSold && (
        <View style={styles.actionBar}>
          <View style={styles.actionBarContent}>
            <View style={styles.priceContainer}>
              <Text style={styles.actionBarLabel}>Price</Text>
              <Text style={[styles.actionBarPrice, isFree && styles.actionBarPriceFree]}>
                {formatPrice(item.price)}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.messageBtn}
              onPress={handleMessage}
              activeOpacity={0.9}
            >
              <Text style={styles.messageBtnText}>Message Seller</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.huge,
  },

  // Image
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 320,
    backgroundColor: COLORS.backgroundSecondary,
  },
  imagePlaceholder: {
    width: '100%',
    height: 320,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  placeholderIconText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textTertiary,
  },
  placeholderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textTertiary,
  },
  favoriteBtn: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
  },
  favoriteCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  favoriteCircleActive: {
    backgroundColor: COLORS.primaryMuted,
  },
  favoriteIcon: {
    fontSize: 22,
    color: COLORS.primary,
  },
  soldBadge: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    backgroundColor: COLORS.soldBadge,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  soldBadgeText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.heavy,
    letterSpacing: 0.5,
  },

  // Content
  content: {
    padding: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    lineHeight: FONT_SIZES.xxl * 1.2,
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.heavy,
    color: COLORS.priceGreen,
  },
  priceFree: {
    color: COLORS.priceFree,
  },
  priceSold: {
    color: COLORS.sold,
    textDecorationLine: 'line-through',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryMuted,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xl,
  },
  categoryTagText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },

  // Sections
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: FONT_SIZES.md * 1.6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  detailIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xxs,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },

  // Action Bar
  actionBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xxl : SPACING.lg,
    ...SHADOWS.lg,
  },
  actionBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  priceContainer: {
    flex: 1,
  },
  actionBarLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xxs,
  },
  actionBarPrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.priceGreen,
  },
  actionBarPriceFree: {
    color: COLORS.priceFree,
  },
  messageBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  messageBtnText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
