"use client";

import { useEffect, useState } from "react";
import { subscribeUserToPush } from "../lib/pushService"; // adjust the path to where your pushService.ts is

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

      if (result === "granted") {
        // Automatically subscribe when user grants permission
        try {
          const subscription = await subscribeUserToPush();
          console.log("✅ Subscribed to push:", subscription);
        } catch (err) {
          console.error("❌ Failed to subscribe to push:", err);
        }
      }
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
        <>
          <button
            onClick={sendNotification}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Send Test Notification
          </button>

          <button
            onClick={subscribeUserToPush}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Subscribe to Push
          </button>
        </>
      )}
    </div>
  );
}
