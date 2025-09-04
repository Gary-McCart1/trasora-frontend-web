export {};
export interface PlaybackState {
  paused: boolean;
  track_window?: {
    current_track?: {
      id: string;
      name?: string;
      artists?: { name: string }[];
      album?: { name: string; images: { url: string }[] };
    };
  };
  position?: number;
  duration?: number;
}

export interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  getCurrentState(): Promise<PlaybackState | null>;
  addListener(
    event: "player_state_changed" | "ready" | "not_ready",
    callback: (state: PlaybackState | { device_id?: string }) => void
  ): boolean;
  removeListener(
    event: "player_state_changed" | "ready" | "not_ready",
    callback?: (state: PlaybackState | { device_id?: string }) => void
  ): boolean;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(position_ms: number): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
  setVolume(volume: number): Promise<void>;
}

export interface Spotify {
  Player: new (options: {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }) => SpotifyPlayer;
}

declare global {
  interface Window {
    Spotify?: Spotify;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}
