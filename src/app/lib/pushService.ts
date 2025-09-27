import { fetchWithAuth } from "./usersApi"; // adjust path based on your file structure

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function subscribeUserToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;

  const registration = await navigator.serviceWorker.ready;

  const vapidPublicKey =
    "BFwjh6p-2zzc7Vm1uufKZoh-slWVttLRfnyQgsogY_X_oRkmQpWd4BmpDXowzPo5w1kJeCdCao949SNch0JcyGQ";
  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });

  // Transform subscription object to match PushSubscriptionRequest DTO
  const payload = {
    endpoint: subscription.endpoint,
    expirationTime: null, // can be null
    keysP256dh: subscription.toJSON().keys?.p256dh,
    keysAuth: subscription.toJSON().keys?.auth,
  };

  // Send subscription to backend with auth
  const res = await fetchWithAuth(`${BASE_URL}/api/push/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => null);
    throw new Error(`❌ Failed to subscribe to push: ${errText || res.status}`);
  }

  return subscription;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}
