// lib/push.ts
// lib/push.ts
import {
    PushNotifications,
    PushNotificationSchema,
    ActionPerformed,
    RegistrationError,
    Token,
  } from '@capacitor/push-notifications';
  
import { getAccessToken } from './usersApi';

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// 🔹 Global state
let pendingToken: string | null = null;
let listenersAttached = false;

// Retry helper
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

// 🔹 Called at app startup (AuthProvider)
export const registerPush = async () => {
  try {
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.log("Push permissions not granted");
      return;
    }

    await PushNotifications.register();

    // ✅ Attach listeners only once
    if (!listenersAttached) {
      listenersAttached = true;

      PushNotifications.addListener('registration', async (token: Token) => {
        console.log('📱 Device token received:', token.value);
        // Store it until we know user is logged in
        pendingToken = token.value;
      });

      PushNotifications.addListener('registrationError', (error: RegistrationError) => {
        console.error('❌ Push registration error:', error);
      });
      
      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          console.log('📩 Push received:', notification);
        }
      );
      
      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification: ActionPerformed) => {
          console.log('👉 Push action performed:', notification);
        }
      );
      
    }

  } catch (err) {
    console.error('Push registration failed:', err);
  }
};

// 🔹 Send APN token to backend (only if logged in)
export const sendTokenToBackend = async (token: string) => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    console.log('⚠️ No access token, not sending device token yet');
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
    console.log('✅ Device token saved to backend');
  }, 5, 500);
};

// 🔹 Call this right after login
export const sendPendingTokenIfNeeded = async () => {
  if (pendingToken) {
    console.log('📤 Sending pending APN token now...');
    await sendTokenToBackend(pendingToken);
    pendingToken = null; // clear it once sent
  }
};
