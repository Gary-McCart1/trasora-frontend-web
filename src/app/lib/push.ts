// lib/push.ts
import { PushNotifications } from '@capacitor/push-notifications';
import { fetchWithAuth, getAccessToken } from './usersApi';

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Utility to retry a function N times with delay
async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 500
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw new Error('Retry failed unexpectedly');
}

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

    const sendTokenToBackend = async (token: string) => {
      // Wait until access token exists before sending
      await retry(async () => {
        const accessToken = getAccessToken();
        if (!accessToken) throw new Error('Access token not ready');

        const res = await fetchWithAuth(`${BASE_URL}/api/push/subscribe/apn`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceToken: token }),
        });

        if (!res.ok) {
          throw new Error(`Failed to save device token: ${res.statusText}`);
        }

        console.log('✅ APN token saved successfully');
      }, 5, 500); // retry up to 5 times, 500ms apart
    };

    // Listener fires when token is ready
    PushNotifications.addListener('registration', async (token) => {
      console.log('Device token:', token.value);
      await sendTokenToBackend(token.value);
    });

    // Error listener
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // Push received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification);
    });

    // Action performed
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed:', notification);
    });

  } catch (err) {
    console.error('Push registration failed:', err);
  }
};
