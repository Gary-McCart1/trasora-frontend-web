"use client";
import { useEffect } from "react";

export default function IOSViewportFix() {
  useEffect(() => {
    // Force Safari to recalc viewport on first load
    const updateHeight = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.innerHeight}px`
      );
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return null;
}