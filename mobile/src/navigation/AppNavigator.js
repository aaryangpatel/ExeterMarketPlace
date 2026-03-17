/**
 * AppNavigator - Professional marketplace navigation.
 */
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
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
import { COLORS, FONT_SIZES, SPACING } from '../theme/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HeaderAuthButtons({ navigation }) {
  const { user, signOut } = useAuth();
  if (user) {
    return (
      <TouchableOpacity
        onPress={signOut}
        style={styles.headerBtn}
        activeOpacity={0.8}
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
        activeOpacity={0.8}
      >
        <Text style={styles.headerBtnText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('SignUp')}
        style={[styles.headerBtn, styles.headerBtnPrimary]}
        activeOpacity={0.8}
      >
        <Text style={[styles.headerBtnText, styles.headerBtnPrimaryText]}>Sign Up</Text>
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
  return (
    <View style={styles.profileContainer}>
      <Text style={styles.profileTitle}>
        {user ? `Hi, ${user.displayName ?? user.email?.split('@')[0] ?? 'User'}` : 'Profile'}
      </Text>
      {user ? (
        <>
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => navigation.navigate('EditItems', { items })}
            activeOpacity={0.85}
          >
            <Text style={styles.profileCardText}>My Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileCardPrimary}
            onPress={() => navigation.navigate('AddItem')}
            activeOpacity={0.85}
          >
            <Text style={styles.profileCardPrimaryText}>Post an Item</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.profileGuest}>
          <Text style={styles.profileGuestText}>
            Sign in to post items and manage your listings.
          </Text>
          <TouchableOpacity
            style={styles.profileSignInBtn}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.85}
          >
            <Text style={styles.profileSignInBtnText}>Sign In</Text>
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
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.surface,
        headerTitleStyle: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        options={({ navigation }) => ({
          headerShown: true,
          title: 'Exeter Marketplace',
          headerLargeTitle: false,
          headerRight: () => <HeaderAuthButtons navigation={navigation} />,
        })}
      >
        {() => (
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: COLORS.primary,
              tabBarInactiveTintColor: COLORS.textSecondary,
              tabBarStyle: {
                backgroundColor: COLORS.surface,
                borderTopColor: COLORS.border,
                borderTopWidth: 1,
              },
              tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
            }}
          >
            <Tab.Screen
              name="Home"
              options={{ title: 'Home', headerShown: false }}
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
                headerTintColor: COLORS.surface,
                tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
              }}
            />
            <Tab.Screen
              name="Favorites"
              options={{ title: 'Watchlist', headerShown: false }}
            >
              {() => <FavoritesTab items={items} />}
            </Tab.Screen>
            <Tab.Screen
              name="Profile"
              options={{ title: 'More', headerShown: false }}
            >
              {(nav) => <ProfileTab navigation={nav.navigation} items={items} />}
            </Tab.Screen>
          </Tab.Navigator>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{ title: 'Item' }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({ title: route.params?.itemTitle ?? 'Chat' })}
      />
      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{ title: 'Post an Item' }}
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

const styles = {
  headerBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  headerBtnText: { color: COLORS.surface, fontWeight: '600', fontSize: 15 },
  headerBtnPrimary: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginLeft: SPACING.sm,
  },
  headerBtnPrimaryText: { color: COLORS.primary, fontWeight: '700' },
  headerAuthRow: { flexDirection: 'row', alignItems: 'center' },
  profileContainer: {
    flex: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  profileTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileCardText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  profileCardPrimary: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileCardPrimaryText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.surface },
  profileGuest: { marginTop: SPACING.md },
  profileGuestText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  profileSignInBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  profileSignInBtnText: { color: COLORS.surface, fontWeight: '700' },
};
