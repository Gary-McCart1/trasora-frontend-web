export async function subscribeUserToPush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  
    const registration = await navigator.serviceWorker.ready;
  
    const vapidPublicKey = "BFwjh6p-2zzc7Vm1uufKZoh-slWVttLRfnyQgsogY_X_oRkmQpWd4BmpDXowzPo5w1kJeCdCao949SNch0JcyGQ"; // we'll generate later
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
  
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  
    // Send subscription to backend
    await fetch("https://trasora-backend-e03193d24a86.herokuapp.com/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
  
    return subscription;
  }
  
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
  }
  