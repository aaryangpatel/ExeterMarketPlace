/**
 * HomeScreen - Premium marketplace feed
 * Features polished hero, elegant search, and refined filter chips
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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ItemList from '../components/ItemList';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '../theme/constants';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Furniture', 'Sports', 'Other'];
const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'price-low', label: 'Price: Low' },
  { id: 'price-high', label: 'Price: High' },
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
      Alert.alert('Sign In Required', 'Please sign in to message the seller.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('SignIn') },
      ]);
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
      list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
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

  const emptyTitle = search.trim() || category !== 'All' ? 'No results found' : 'No items yet';
  const emptySubtitle = search.trim() || category !== 'All'
    ? 'Try adjusting your search or filters'
    : 'Be the first to post something!';

  const ListHeader = () => (
    <>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Exeter{'\n'}Marketplace</Text>
          <Text style={styles.heroSubtitle}>Buy and sell with your community</Text>
          
          {!user && (
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.heroPrimaryBtn}
                onPress={() => navigation.navigate('SignIn')}
                activeOpacity={0.9}
              >
                <Text style={styles.heroPrimaryBtnText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroSecondaryBtn}
                onPress={() => navigation.navigate('SignUp')}
                activeOpacity={0.9}
              >
                <Text style={styles.heroSecondaryBtnText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>&#x1F50D;</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={COLORS.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>&#x2715;</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
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
        </ScrollView>
      </View>

      {/* Sort & Options */}
      <View style={styles.sortSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScroll}
        >
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.sortChip, sortBy === opt.id && styles.sortChipActive]}
              onPress={() => setSortBy(opt.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.sortChipText, sortBy === opt.id && styles.sortChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.sortChip, showSold && styles.sortChipActive]}
            onPress={() => setShowSold(!showSold)}
            activeOpacity={0.8}
          >
            <Text style={[styles.sortChipText, showSold && styles.sortChipTextActive]}>
              Show Sold
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Hero Section
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    marginBottom: -SPACING.xl,
  },
  heroContent: {
    maxWidth: 320,
  },
  heroTitle: {
    fontSize: FONT_SIZES.huge,
    fontWeight: FONT_WEIGHTS.heavy,
    color: COLORS.textInverse,
    lineHeight: FONT_SIZES.huge * 1.1,
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: FONT_SIZES.md * 1.4,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  heroPrimaryBtn: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  heroPrimaryBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary,
  },
  heroSecondaryBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  heroSecondaryBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textInverse,
  },

  // Search
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.xs,
    ...SHADOWS.md,
  },
  searchIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  clearButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  clearButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
  },

  // Filter Section
  filterSection: {
    marginBottom: SPACING.md,
  },
  filterLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  filterScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Sort Section
  sortSection: {
    marginBottom: SPACING.lg,
  },
  sortScroll: {
    paddingHorizontal: SPACING.lg,
  },
  sortChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: SPACING.sm,
  },
  sortChipActive: {
    backgroundColor: COLORS.primaryMuted,
  },
  sortChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  sortChipTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Results Header
  resultsHeader: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  resultsCount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textTertiary,
  },
});
