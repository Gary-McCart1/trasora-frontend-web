import { fetchWithAuth, getAuthHeaders, getAccessToken } from "./usersApi";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function subscribeUserToPush() {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("Push notifications are not supported in this browser.");
        return null;
      }
  
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = "BFwjh6p-..."; // truncated
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
  
      const res = await fetchWithAuth(`${BASE_URL}/api/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const errText = await res.text().catch(() => null);
        throw new Error(errText || `Error code: ${res.status}`);
      }
  
      return subscription;
    } catch (err: unknown) {
        let errorMessage = "An unknown error occurred";
      
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "string") {
          errorMessage = err;
        }
      
        console.error("Push subscription error:", err);
        alert(`Failed to subscribe to push notifications: ${errorMessage}`);
        return null;
      }
      
  }
  
  export async function unsubscribeUserFromPush() {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/push/unsubscribe`, {
        method: "DELETE",
      });
  
      if (!res.ok) {
        const errText = await res.text().catch(() => null);
        throw new Error(errText || `Error code: ${res.status}`);
      }
  
      return true;
    } catch (err: unknown) {
        let errorMessage = "An unknown error occurred";
        
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "string") {
          errorMessage = err;
        }
      
        console.error("Push unsubscription error:", err);
        alert(`Failed to unsubscribe from push notifications: ${errorMessage}`);
        return false;
      }
      
  }
  

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}
