"use client";

import { useEffect, useState } from "react";

export default function TestNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      console.log("✅ Notification permission updated:", result);
    }
  };

  const sendNotification = async () => {
    if ("serviceWorker" in navigator && permission === "granted") {
      const registration = await navigator.serviceWorker.ready;
      console.log("✅ Service worker ready", registration);

      registration.showNotification("🎶 New Post on Trasora!", {
        body: "Your friend just shared a track. Tap to check it out!",
        icon: "/icons/android-chrome-192x192.png",
        badge: "/icons/android-chrome-192x192.png",
      });
    }
  };

  return (
    <div className="p-4 space-y-2">
      <button
        onClick={requestPermission}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        Enable Notifications
      </button>

      {permission === "granted" && (
        <button
          onClick={sendNotification}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Send Test Notification
        </button>
      )}
    </div>
  );
}
