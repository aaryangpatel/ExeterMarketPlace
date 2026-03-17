/**
 * Expo Push Notifications boilerplate.
 * Registers for push tokens and handles incoming notifications.
 * Use the push token to send notifications when users receive offers.
 *
 * Note: Push notifications require a development build on Android (SDK 53+).
 * Local notifications work in Expo Go.
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldAnimate: true,
  }),
});

/**
 * Register for push notifications and return the Expo push token.
 * Store this token in Firestore (users/{uid}/pushToken) for server-side sending.
 *
 * @returns {Promise<string|null>} Expo push token or null if unavailable
 */
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    if (finalStatus !== 'granted') return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('offers', {
      name: 'New Offers',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#c8102e',
    });
  }

  // Add your EAS projectId to app.json: extra.eas.projectId
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    Constants.manifest?.extra?.eas?.projectId;
  if (!projectId) {
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenData?.data ?? null;
  return token;
}

/**
 * Add listener for notifications received while app is in foreground.
 *
 * @param {(notification: Notifications.Notification) => void} callback
 * @returns {() => void} Remove function
 */
export function addNotificationReceivedListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for user tapping a notification.
 *
 * @param {(response: Notifications.NotificationResponse) => void} callback
 * @returns {() => void} Remove function
 */
export function addNotificationResponseListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
