/**
 * HomeScreen - Professional marketplace feed with hero, search, and prominent auth CTAs.
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ItemList from '../components/ItemList';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../theme/constants';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Furniture', 'Sports', 'Other'];
const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'price-low', label: 'Price ↑' },
  { id: 'price-high', label: 'Price ↓' },
];

export default function HomeScreen({ items, hasFavorite, onFavoritePress, onRefresh }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showSold, setShowSold] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const filtered = useMemo(() => {
    let list = items ?? [];
    if (!showSold) {
      list = list.filter((i) => (i.status ?? 'available') !== 'sold');
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          (i.title ?? '').toLowerCase().includes(q) ||
          (i.description ?? '').toLowerCase().includes(q)
      );
    }
    if (category !== 'All') {
      list = list.filter((i) => (i.category ?? 'Other') === category);
    }
    list = [...list];
    if (sortBy === 'newest') {
      list.sort((a, b) => {
        const ta = a.timestamp?.toMillis?.() ?? 0;
        const tb = b.timestamp?.toMillis?.() ?? 0;
        return tb - ta;
      });
    } else if (sortBy === 'price-low') {
      list.sort((a, b) => {
        const pa = parsePrice(a.price);
        const pb = parsePrice(b.price);
        return pa - pb;
      });
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => {
        const pa = parsePrice(a.price);
        const pb = parsePrice(b.price);
        return pb - pa;
      });
    }
    return list;
  }, [items, search, category, sortBy, showSold]);

  function parsePrice(p) {
    if (!p || p.toLowerCase() === 'free') return 0;
    const n = parseFloat(String(p).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh?.();
    setTimeout(() => setRefreshing(false), 800);
  };

  const hasSearchOrFilter = search.trim() || category !== 'All' || !showSold;
  const emptyTitle = search.trim() || category !== 'All'
    ? 'No results found'
    : 'No items yet';
  const emptySubtitle = search.trim() || category !== 'All'
    ? 'Try different search or filters'
    : 'Be the first to post something!';

  const ListHeader = () => (
    <>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Exeter Marketplace</Text>
        <Text style={styles.heroSubtitle}>
          Buy and sell with your community
        </Text>
        {!user && (
          <View style={styles.authCtaRow}>
            <TouchableOpacity
              style={styles.authCtaPrimary}
              onPress={() => navigation.navigate('SignIn')}
              activeOpacity={0.85}
            >
              <Text style={styles.authCtaPrimaryText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.authCtaSecondary}
              onPress={() => navigation.navigate('SignUp')}
              activeOpacity={0.85}
            >
              <Text style={styles.authCtaSecondaryText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.search}
          placeholder="Search items..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, category === cat && styles.filterChipActive]}
            onPress={() => setCategory(cat)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, category === cat && styles.filterChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[styles.sortChip, sortBy === opt.id && styles.filterChipActive]}
            onPress={() => setSortBy(opt.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, sortBy === opt.id && styles.filterChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.sortChip, showSold && styles.filterChipActive]}
          onPress={() => setShowSold(!showSold)}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterChipText, showSold && styles.filterChipTextActive]}>
            Sold
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <ItemList
        items={filtered}
        onItemPress={handleItemPress}
        onMessagePress={handleMessagePress}
        hasFavorite={hasFavorite}
        onFavoritePress={onFavoritePress}
        ListHeaderComponent={ListHeader}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyTitle={emptyTitle}
        emptySubtitle={emptySubtitle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xxl * 2 },
  hero: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    ...SHADOWS.md,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.surface,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  authCtaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  authCtaPrimary: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  authCtaPrimaryText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  authCtaSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  authCtaSecondaryText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  searchIcon: { fontSize: 18, marginRight: SPACING.sm },
  search: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: -SPACING.sm,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: -SPACING.sm,
  },
  sortChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  filterChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
