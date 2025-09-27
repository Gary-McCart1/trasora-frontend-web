import { fetchWithAuth, getAuthHeaders, getAccessToken } from "./usersApi";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function subscribeUserToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications not supported in this browser.");
    return null;
  }

  // Check for access token first
  const token = getAccessToken();
  if (!token) {
    console.error("No access token found. User must be logged in.");
    return null;
  }

  const registration = await navigator.serviceWorker.ready;

  const vapidPublicKey =
    "BFwjh6p-2zzc7Vm1uufKZoh-slWVttLRfnyQgsogY_X_oRkmQpWd4BmpDXowzPo5w1kJeCdCao949SNch0JcyGQ";
  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });

  const payload = {
    endpoint: subscription.endpoint,
    expirationTime: null,
    keysP256dh: subscription.toJSON().keys?.p256dh,
    keysAuth: subscription.toJSON().keys?.auth,
  };

  console.log("Push payload:", payload);
  console.log("Auth headers:", getAuthHeaders());

  try {
    const res = await fetchWithAuth(`${BASE_URL}/api/push/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => null);
      console.error("Push subscription failed:", errText || res.status);
      throw new Error(`❌ Failed to subscribe to push: ${errText || res.status}`);
    }

    console.log("Push subscription successful!");
    return subscription;
  } catch (err) {
    console.error("Error sending push subscription:", err);
    throw err;
  }
}

export async function unsubscribeUserFromPush() {
  const token = getAccessToken();
  if (!token) {
    console.error("No access token found. Cannot unsubscribe.");
    return null;
  }

  try {
    const res = await fetchWithAuth(`${BASE_URL}/api/push/unsubscribe`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => null);
      console.error("Unsubscribe failed:", errText || res.status);
      throw new Error(`❌ Failed to unsubscribe from push: ${errText || res.status}`);
    }

    console.log("Push unsubscription successful!");
    return true;
  } catch (err) {
    console.error("Error unsubscribing from push:", err);
    throw err;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}
