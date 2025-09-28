// lib/push.ts
import { PushNotifications } from '@capacitor/push-notifications';
import { fetchWithAuth } from './usersApi'; // your fetchWithAuth wrapper

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export const registerPush = async () => {
  try {
    // Request permission
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.log("Push permissions not granted");
      return;
    }

    // Register with APNs/FCM
    await PushNotifications.register();

    // Listen for device token
    PushNotifications.addListener('registration', async (token) => {
      console.log('Device token:', token.value);

      try {
        const res = await fetchWithAuth(`${BASE_URL}/api/push/subscribe/apn`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceToken: token.value })
        });

        if (!res.ok) {
          console.error('Failed to save device token:', res.statusText);
        } else {
          console.log('APN token saved successfully');
        }
      } catch (err) {
        console.error('Error sending device token to backend:', err);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed:', notification);
    });
  } catch (err) {
    console.error('Push registration failed:', err);
  }
};
