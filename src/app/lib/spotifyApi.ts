import { Track } from "@/app/types/spotify";
import { RootSongInput } from "@/app/components/RootsSearchBar";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Fetch Spotify access token
export async function fetchSpotifyToken(): Promise<{ accessToken: string | null }> {
  const res = await fetch(`${BASE_URL}/api/spotify/token`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch Spotify token");
  return res.json();
}

// Search Spotify tracks (returns first 5 matches as RootSongInput[])
export async function searchSpotify(query: string, username: string): Promise<RootSongInput[]> {
  if (!query.trim() || !username) return [];

  const res = await fetch(`${BASE_URL}/api/spotify/search?q=${encodeURIComponent(query)}`, {
    headers: { Username: username },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Spotify search failed");
  return res.json();
}

// Send a trunk playlist to Spotify
export async function sendTrunkToSpotify(trunkId: string): Promise<{ playlistUrl: string }> {
  const res = await fetch(`${BASE_URL}/api/spotify/trunk-playlist/${trunkId}`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to send trunk to Spotify");
  return res.json();
}

// Fetch a single Spotify track by ID
export async function getSpotifyTrack(trackId: string, username: string): Promise<Track> {
  const res = await fetch(`${BASE_URL}/api/spotify/tracks/${trackId}`, {
    headers: { Username: username },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch track");
  return res.json();
}

// Fetch explore content from Spotify
export async function getSpotifyExplore(username: string) {
  const res = await fetch(`${BASE_URL}/api/spotify/explore`, {
    headers: { Username: username },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch explore content");
  return res.json();
}

// Fetch track recommendations from Spotify
export async function getSpotifyRecommendations(): Promise<Track[]> {
  const res = await fetch(`${BASE_URL}/api/spotify/recommendations/from-posts`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

// Play a Spotify track
export async function playSpotifyTrack(trackId: string, username: string) {
  const res = await fetch(`${BASE_URL}/api/spotify/play-track`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Username: username },
    credentials: "include",
    body: JSON.stringify({ trackId }),
  });
  if (!res.ok) throw new Error("Failed to play track");
  return res.json();
}

// Pause Spotify playback
export async function pauseSpotifyTrack(username: string) {
  const res = await fetch(`${BASE_URL}/api/spotify/pause-track`, {
    method: "POST",
    headers: { Username: username },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to pause track");
  return res.json();
}
