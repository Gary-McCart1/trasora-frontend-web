"use client";

import { ReactNode, useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";

export default function ClientProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => {
          console.log("✅ Service worker registered:", reg);
        })
        .catch((err) => {
          console.error("❌ Service worker registration failed:", err);
        });
    }
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
