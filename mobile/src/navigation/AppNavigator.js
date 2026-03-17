/**
 * AppNavigator - Premium navigation with refined styling
 * Features polished header, modern tab bar, and smooth transitions
 */
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useUnread } from '../context/UnreadContext';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import AddItemScreen from '../screens/AddItemScreen';
import EditItemsScreen from '../screens/EditItemsScreen';
import AuthScreen from '../screens/AuthScreen';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS, SHADOWS } from '../theme/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icons as text (can be replaced with proper icons)
const TAB_ICONS = {
  Home: { active: '\u2302', inactive: '\u2302' },
  Messages: { active: '\u2709', inactive: '\u2709' },
  Favorites: { active: '\u2665', inactive: '\u2661' },
  Profile: { active: '\u2699', inactive: '\u2699' },
};

function TabIcon({ name, focused }) {
  const icon = TAB_ICONS[name] || { active: '\u25CF', inactive: '\u25CB' };
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
      {focused ? icon.active : icon.inactive}
    </Text>
  );
}

function HeaderAuthButtons({ navigation }) {
  const { user, signOut } = useAuth();
  
  if (user) {
    return (
      <TouchableOpacity
        onPress={signOut}
        style={styles.headerBtn}
        activeOpacity={0.7}
      >
        <Text style={styles.headerBtnText}>Sign Out</Text>
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={styles.headerAuthRow}>
      <TouchableOpacity
        onPress={() => navigation.navigate('SignIn')}
        style={styles.headerBtn}
        activeOpacity={0.7}
      >
        <Text style={styles.headerBtnText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('SignUp')}
        style={styles.headerBtnPrimary}
        activeOpacity={0.8}
      >
        <Text style={styles.headerBtnPrimaryText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

function HomeTab({ items, hasFavorite, onFavoritePress }) {
  return (
    <HomeScreen
      items={items}
      hasFavorite={hasFavorite}
      onFavoritePress={onFavoritePress}
    />
  );
}

function FavoritesTab({ items }) {
  return <FavoritesScreen items={items} />;
}

function ProfileTab({ navigation, items }) {
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'User';
  
  return (
    <View style={styles.profileContainer}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.profileName}>
          {user ? `Hi, ${displayName}` : 'Welcome'}
        </Text>
        {user && (
          <Text style={styles.profileEmail}>{user.email}</Text>
        )}
      </View>

      {/* Profile Actions */}
      {user ? (
        <View style={styles.profileActions}>
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => navigation.navigate('EditItems', { items })}
            activeOpacity={0.8}
          >
            <View style={styles.profileCardIcon}>
              <Text style={styles.profileCardIconText}>&#x1F4E6;</Text>
            </View>
            <View style={styles.profileCardContent}>
              <Text style={styles.profileCardTitle}>My Listings</Text>
              <Text style={styles.profileCardSubtitle}>View and manage your items</Text>
            </View>
            <Text style={styles.profileCardArrow}>&#x203A;</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileCardPrimary}
            onPress={() => navigation.navigate('AddItem')}
            activeOpacity={0.8}
          >
            <Text style={styles.profileCardPrimaryIcon}>+</Text>
            <Text style={styles.profileCardPrimaryText}>Post an Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.profileGuest}>
          <Text style={styles.profileGuestText}>
            Sign in to post items, manage listings, and message sellers.
          </Text>
          <TouchableOpacity
            style={styles.profileSignInBtn}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.8}
          >
            <Text style={styles.profileSignInBtnText}>Sign In to Get Started</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function AppNavigator({ items, hasFavorite, onFavoritePress }) {
  const { unreadCount } = useUnread();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.textInverse,
        headerTitleStyle: {
          fontSize: FONT_SIZES.lg,
          fontWeight: FONT_WEIGHTS.bold,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        options={({ navigation }) => ({
          headerShown: true,
          title: 'Exeter Marketplace',
          headerRight: () => <HeaderAuthButtons navigation={navigation} />,
        })}
      >
        {() => (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused }) => (
                <TabIcon name={route.name} focused={focused} />
              ),
              tabBarActiveTintColor: COLORS.primary,
              tabBarInactiveTintColor: COLORS.textTertiary,
              tabBarStyle: styles.tabBar,
              tabBarLabelStyle: styles.tabBarLabel,
              tabBarItemStyle: styles.tabBarItem,
              headerShown: false,
            })}
          >
            <Tab.Screen
              name="Home"
              options={{ title: 'Home' }}
            >
              {() => (
                <HomeTab
                  items={items}
                  hasFavorite={hasFavorite}
                  onFavoritePress={onFavoritePress}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="Messages"
              component={ConversationsScreen}
              options={{
                title: 'Messages',
                headerShown: true,
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.textInverse,
                tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                tabBarBadgeStyle: styles.tabBadge,
              }}
            />
            <Tab.Screen
              name="Favorites"
              options={{ title: 'Saved' }}
            >
              {() => <FavoritesTab items={items} />}
            </Tab.Screen>
            <Tab.Screen
              name="Profile"
              options={{ title: 'Profile' }}
            >
              {(nav) => <ProfileTab navigation={nav.navigation} items={items} />}
            </Tab.Screen>
          </Tab.Navigator>
        )}
      </Stack.Screen>
      
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{ title: 'Item Details' }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({ title: route.params?.itemTitle ?? 'Chat' })}
      />
      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{ title: 'Post Item' }}
      />
      <Stack.Screen
        name="EditItems"
        component={EditItemsScreen}
        options={{ title: 'My Listings' }}
      />
      <Stack.Screen
        name="SignIn"
        component={AuthScreen}
        initialParams={{ type: 'signin' }}
        options={{ title: 'Sign In' }}
      />
      <Stack.Screen
        name="SignUp"
        component={AuthScreen}
        initialParams={{ type: 'signup' }}
        options={{ title: 'Create Account' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  // Header Styles
  headerBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    marginLeft: SPACING.xs,
  },
  headerBtnText: {
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: FONT_SIZES.sm,
  },
  headerBtnPrimary: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  headerBtnPrimaryText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: FONT_SIZES.sm,
  },
  headerAuthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Tab Bar Styles
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.xs,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.sm,
    height: Platform.OS === 'ios' ? 88 : 64,
    ...SHADOWS.sm,
  },
  tabBarLabel: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: SPACING.xxs,
  },
  tabBarItem: {
    paddingTop: SPACING.xs,
  },
  tabIcon: {
    fontSize: 22,
    color: COLORS.textTertiary,
  },
  tabIconActive: {
    color: COLORS.primary,
  },
  tabBadge: {
    backgroundColor: COLORS.primary,
    fontSize: FONT_SIZES.xxs,
    fontWeight: FONT_WEIGHTS.bold,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
  },

  // Profile Tab Styles
  profileContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  profileAvatarText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textInverse,
  },
  profileName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xxs,
  },
  profileEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  profileActions: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  profileCardIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  profileCardIconText: {
    fontSize: 20,
  },
  profileCardContent: {
    flex: 1,
  },
  profileCardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xxs,
  },
  profileCardSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  profileCardArrow: {
    fontSize: 24,
    color: COLORS.textTertiary,
    marginLeft: SPACING.sm,
  },
  profileCardPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
  },
  profileCardPrimaryIcon: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textInverse,
    marginRight: SPACING.sm,
  },
  profileCardPrimaryText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
  },
  profileGuest: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  profileGuestText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.md * 1.5,
    marginBottom: SPACING.xl,
  },
  profileSignInBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  profileSignInBtnText: {
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: FONT_SIZES.md,
  },
});
