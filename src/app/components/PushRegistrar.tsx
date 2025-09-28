"use client";

import { useEffect } from "react";
import { registerPush } from "../lib/push"; // adjust path if needed
import { useAuth } from "../context/AuthContext";

export default function PushRegistrar() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.username) return;

    const pushKey = `hasRegisteredPush_${user.username}`;
    const hasRegisteredPush = localStorage.getItem(pushKey);

    if (!hasRegisteredPush) {
      registerPush()
        .then(() => {
          console.log("Push registration successful");
          localStorage.setItem(pushKey, "true");
        })
        .catch(err => console.error("Push registration failed:", err));
    }
  }, [user]);

  return null;
}
