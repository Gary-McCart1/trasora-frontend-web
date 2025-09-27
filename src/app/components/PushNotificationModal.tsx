"use client";

import { useEffect, useState } from "react";
import { subscribeUserToPush } from "../lib/pushService";
import { getUserPushSubscription } from "../lib/usersApi";
import { useAuth } from "../context/AuthContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PushNotificationModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(true);

  // Check if notifications are supported and fetch existing subscription
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      setLoading(false);
      return;
    }

    if (!user) return;

    (async () => {
      try {
        // Fetch existing subscription from backend
        const subscription = await getUserPushSubscription(user.username);
        if (subscription?.endpoint) {
          setSubscribed(true);
          // Optionally close modal if already subscribed
          onClose();
        }
      } catch (err) {
        console.error("Failed to fetch push subscription:", err);
      } finally {
        setPermission(Notification.permission);
        setLoading(false);
      }
    })();
  }, [user, onClose]);

  const handleSubscribe = async () => {
    if (!("Notification" in window)) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        const subscription = await subscribeUserToPush(); // sends subscription to backend
        console.log("Subscribed to push:", subscription);
        setSubscribed(true);
        onClose(); // close modal after subscribing
      }
    } catch (err) {
      console.error("Failed to subscribe to push:", err);
    }
  };

  // Only show modal if open, supported, not subscribed, permission not denied
  if (!isOpen || loading || !supported || subscribed || permission === "denied") return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full space-y-4">
        <h2 className="text-lg font-bold">Enable Notifications</h2>
        <p className="text-sm">
          Stay up to date! Enable notifications to get alerts when your friends post new tracks.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-black rounded"
          >
            Later
          </button>
          <button
            onClick={handleSubscribe}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
