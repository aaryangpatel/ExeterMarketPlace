/**
 * ItemDetailScreen - Full item view with Message Seller and Watchlist.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../theme/constants';

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params ?? {};
  const { user } = useAuth();
  const { has, toggle } = useWatchlist();

  if (!item) return null;

  const isFav = has(item.id);
  const isSold = item.status === 'sold';

  const handleMessage = () => {
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {item.imageBase64 ? (
        <Image
          source={{ uri: item.imageBase64 }}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{item.title}</Text>
          <TouchableOpacity onPress={() => toggle(item.id)}>
            <Text style={styles.favIcon}>{isFav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.price}>{item.price || 'Free'}</Text>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.meta}>{item.location}</Text>
        <Text style={styles.label}>Seller</Text>
        <Text style={styles.meta}>{item.owner}</Text>
        {isSold && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldBadgeText}>SOLD</Text>
          </View>
        )}
        {!isSold && (
          <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
            <Text style={styles.messageBtnText}>Message Seller</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xl * 2 },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: COLORS.border,
  },
  imagePlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  body: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  favIcon: { fontSize: 28 },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
  },
  meta: { fontSize: FONT_SIZES.md, color: COLORS.text },
  messageBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
    ...SHADOWS.sm,
  },
  messageBtnText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  soldBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.text,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.lg,
  },
  soldBadgeText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
