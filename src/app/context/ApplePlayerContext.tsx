"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }
  }, []);

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
