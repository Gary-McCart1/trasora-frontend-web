"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { trackEvent } from "../lib/analytics";
import { usePathname } from "next/navigation"; // We use this to track route changes

interface ApplePlayerContextType {
  currentUrl: string | null;
  isPlaying: boolean;
  isReady: boolean;                  // ✅ new
  initPlayer: () => void;            // ✅ new
  playPreview: (url: string, volume?: number) => Promise<void>;
  pausePreview: () => void;
  setVolume: (volume: number) => void;
}

const ApplePlayerContext = createContext<ApplePlayerContextType>({
  currentUrl: null,
  isPlaying: false,
  isReady: false,
  initPlayer: () => {},
  playPreview: async () => {},
  pausePreview: () => {},
  setVolume: () => {},
});

export const ApplePlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false); // ✅ track if player initialized
  const pathname = usePathname(); // Track pathname changes

  const [isMobile, setIsMobile] = useState(false);
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    // Detect mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    // ✅ Proper Capacitor detection
    if (
      typeof window !== "undefined" &&
      window.Capacitor &&
      typeof window.Capacitor.isNativePlatform === "function"
    ) {
      setIsApp(window.Capacitor.isNativePlatform());
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }
  }, []);

  useEffect(() => {
    // Pause the audio when the pathname changes
    pausePreview();
  }, [pathname]); // This will run when the route/pathname changes

  const initPlayer = () => {
    setIsReady(true);
  };

  const playPreview = async (url: string, volume: number = 0.5) => {
    if (!audioRef.current || !isReady) return;

    if (currentUrl !== url) {
      audioRef.current.src = url;
      setCurrentUrl(url);
    }

    audioRef.current.volume = volume;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      trackEvent("play_song", {
        song_title: url,
        platform: isApp ? "app" : "website",
        device: isMobile ? "mobile" : "desktop"
      });
    } catch (err) {
      console.warn("Autoplay blocked or failed:", err);
    }
  };

  const pausePreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const setVolume = (volume: number) => {
    if (audioRef.current) audioRef.current.volume = volume;
  };

  return (
    <ApplePlayerContext.Provider
      value={{ currentUrl, isPlaying, isReady, initPlayer, playPreview, pausePreview, setVolume }}
    >
      {children}
    </ApplePlayerContext.Provider>
  );
};

export const useApplePlayer = () => useContext(ApplePlayerContext);