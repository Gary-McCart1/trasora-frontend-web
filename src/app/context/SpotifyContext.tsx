"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { PlaybackState, SpotifyPlayer } from "../types/spotify-playback";
import { fetchSpotifyToken } from "../api/spotifyApi/route";

interface PlayTrackOptions {
  position_ms?: number;
  volume?: number; // 0.0 to 1.0
}

interface SpotifyPlayerContextType {
  player: SpotifyPlayer | null;
  deviceId: string | null;
  isReady: boolean;
  currentTrackId: string | null;
  isPlaying: boolean;
  initPlayer: () => Promise<void>;
  playTrack: (trackId: string, options?: PlayTrackOptions) => Promise<void>;
  pauseTrack: () => void;
  setVolume: (volume: number) => Promise<void>;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType>({
  player: null,
  deviceId: null,
  isReady: false,
  currentTrackId: null,
  isPlaying: false,
  initPlayer: async () => {},
  playTrack: async () => {},
  pauseTrack: () => {},
  setVolume: async () => {},
});

export const SpotifyPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const getFreshToken = async () => {
    try {
      return await fetchSpotifyToken();
    } catch (err) {
      console.error("Failed to fetch Spotify token", err);
      return null;
    }
  };

  const initPlayer = async () => {
    if (player) return;

    if (!window.Spotify) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Spotify SDK failed to load"));
        document.body.appendChild(script);
      });
    }

    if (!window.Spotify) return console.error("Spotify SDK not loaded");

    const token = await getFreshToken();
    if (!token) return;

    const newPlayer = new window.Spotify.Player({
      name: "Trasora Web Player",
      getOAuthToken: (cb) => cb(token),
      volume: 0.5,
    });

    newPlayer.addListener("ready", (state) => {
      if ("device_id" in state) {
        setDeviceId(state.device_id ?? null);
        setPlayerReady(true);
        console.log("Spotify Player ready with device ID:", state.device_id);
      }
    });

    newPlayer.addListener("not_ready", () => setPlayerReady(false));

    newPlayer.addListener(
      "player_state_changed",
      (state: PlaybackState | { device_id?: string } | null) => {
        if (state && "paused" in state) {
          setIsPlaying(!state.paused);
          setCurrentTrackId(state.track_window?.current_track?.id || null);
        }
      }
    );

    await newPlayer.connect();
    setPlayer(newPlayer);
  };

  const playTrack = async (trackId: string, options?: PlayTrackOptions) => {
    if (!player || !deviceId) return;

    const token = await getFreshToken();
    if (!token) return;

    // Start playback
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [`spotify:track:${trackId}`],
        position_ms: options?.position_ms || 0,
      }),
    });

    // Set volume if provided
    if (options?.volume !== undefined) {
      await setVolume(options.volume);
    }

    setCurrentTrackId(trackId);
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    if (!player) return;
    player.pause();
    setIsPlaying(false);
    setCurrentTrackId(null);
  };

  const setVolume = async (volume: number) => {
    if (!player) return;
    try {
      await player.setVolume(volume);
    } catch (err) {
      console.warn("Failed to set Spotify volume:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (player) {
        player.pause();
        player.disconnect();
      }
    };
  }, [player]);

  return (
    <SpotifyPlayerContext.Provider
      value={{
        player,
        deviceId,
        isReady: playerReady,
        currentTrackId,
        isPlaying,
        initPlayer,
        playTrack,
        pauseTrack,
        setVolume,
      }}
    >
      {children}
    </SpotifyPlayerContext.Provider>
  );
};

export const useSpotifyPlayer = () => useContext(SpotifyPlayerContext);
