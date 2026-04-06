"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function GoogleAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-239125B4RC", {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}