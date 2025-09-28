// lib/push.ts
import { PushNotifications } from '@capacitor/push-notifications';
import { fetchWithAuth, getAccessToken } from './usersApi';

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Store a pending APN token in case user is not logged in yet
let pendingToken: string | null = null;

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

// Main registration function
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

    // Listener fires when token is ready
    PushNotifications.addListener('registration', async (token) => {
      console.log('Device token:', token.value);
      await sendTokenToBackend(token.value);
    });

    // Registration error listener
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // Push received listener
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification);
    });

    // Push action performed listener
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed:', notification);
    });

  } catch (err) {
    console.error('Push registration failed:', err);
  }
};

// Send APN token to backend
export const sendTokenToBackend = async (token: string) => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    console.log('Access token not ready, storing token to send later');
    pendingToken = token;
    return;
  }

  await retry(async () => {
    const res = await fetch(`${BASE_URL}/api/push/subscribe/apn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ deviceToken: token })
    });

    if (!res.ok) throw new Error(`Failed to save device token: ${res.statusText}`);
    console.log('✅ APN token saved successfully');

    // Clear pending token if it was stored
    if (pendingToken === token) pendingToken = null;
  }, 5, 500);
};

// Call this after login to send any pending token
export const sendPendingTokenIfNeeded = async () => {
  if (pendingToken) {
    console.log('Sending pending APN token now...');
    await sendTokenToBackend(pendingToken);
  }
};
