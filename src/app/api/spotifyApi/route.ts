// app/api/spotifyApi.ts
import { Track } from "@/app/types/spotify";
import { RootSongInput } from "../../components/RootsSearchBar";
import { User } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

/** Fetch Spotify token for the current logged-in user (for Web Playback SDK) */
export async function fetchSpotifyToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/token`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to get token: ${res.status}`);
    const data = await res.json();
    console.log("Spotify token data:", data);
    return data.accessToken || null;
  } catch (err) {
    console.error("Error fetching Spotify token:", err);
    return null;
  }
}

export async function searchSpotifyTracks(
  query: string,
  username: string
): Promise<RootSongInput[]> {
  if (!query.trim()) return [];
  if (!username) return [];

  try {
    const res = await fetch(
      `${BASE_URL}/api/spotify/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Username: username,
        },
        credentials: "include",
      }
    );

    if (!res.ok) throw new Error(`Backend search error: ${res.status}`);

    const data = await res.json();

    const mappedTracks: RootSongInput[] = (data.tracks?.items || [])
      .slice(0, 5)
      .map((t: Track) => ({
        title: t.name,
        artist: t.artists.map((a) => a.name).join(", ") || "Unknown Artist",
        albumArtUrl: t.album.images[0]?.url || "/default-album-cover.png",
        trackId: t.id,
      }));

    return mappedTracks;
  } catch (err) {
    console.error("Spotify search error:", err);
    return [];
  }
}

// Keep all the other functions the same...
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

export interface UserSearchResult {
  username: string;
  profilePictureUrl?: string;
}

export interface SearchResults {
  tracks: SpotifyTrack[];
  artists: SpotifyTrack[];
  users: UserSearchResult[];
}

export async function searchAll(
  query: string,
  username: string
): Promise<SearchResults> {
  if (!query.trim() || !username) return { tracks: [], artists: [], users: [] };

  try {
    const [spotRes, userRes] = await Promise.all([
      fetch(`${BASE_URL}/api/spotify/search?q=${encodeURIComponent(query)}`, {
        headers: { Username: username },
        credentials: "include",
      }),
      fetch(`${BASE_URL}/api/auth/search-bar?q=${encodeURIComponent(query)}`, {
        credentials: "include",
      }),
    ]);

    if (!spotRes.ok) throw new Error(`Spotify API error: ${spotRes.status}`);
    if (!userRes.ok) throw new Error(`User API error: ${userRes.status}`);

    const spotifyData = await spotRes.json();
    const userData = await userRes.json();

    const mappedUsers = (userData.users?.slice(0, 5) || []).map(
      (u: User, index: number) => ({
        id: u.id ?? index,
        username: u.username,
        profilePictureUrl: u.profilePictureUrl ?? null,
      })
    );

    return {
      tracks: spotifyData.tracks?.items.slice(0, 5) || [],
      artists: spotifyData.artists?.items.slice(0, 5) || [],
      users: mappedUsers,
    };
  } catch (err) {
    console.error("Search API error:", err);
    return { tracks: [], artists: [], users: [] };
  }
}

export async function searchSpotifyTracksRaw(
  query: string,
  username: string
): Promise<Track[]> {
  if (!query.trim() || !username) return [];

  try {
    const res = await fetch(
      `${BASE_URL}/api/spotify/search?q=${encodeURIComponent(query)}`,
      {
        headers: { Username: username },
        credentials: "include",
      }
    );

    if (!res.ok) throw new Error(`Backend search error: ${res.status}`);
    const data = await res.json();

    return data.tracks?.items || [];
  } catch (err) {
    console.error("Spotify raw search error:", err);
    return [];
  }
}

// Send a trunk to Spotify as a playlist
export async function sendTrunkToSpotify(trunkId: number): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/spotify/trunk-playlist/${trunkId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create Spotify playlist");
  }

  const data = await res.json();
  return data.playlistUrl;
}

export async function getSpotifyTrackById(
  trackId: string,
  username: string
): Promise<Track | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/tracks/${trackId}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Username: username,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch track from backend");

    const data = await res.json();
    const DEFAULT_ALBUM_IMAGE = "/default-album-cover.png";

    return {
      id: data.id,
      name: data.name,
      artists: data.artists || [{ name: "Unknown Artist" }],
      album: { images: data.album?.images || [{ url: DEFAULT_ALBUM_IMAGE }] },
    };
  } catch (err) {
    console.error("Error fetching track:", err);
    return null;
  }
}

// Fetch featured tracks & new releases
export async function getExploreContent(username: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/explore`, {
      method: "GET",
      headers: { Username: username },
      credentials: "include",
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    return {
      featuredTracks: data.featuredTracks || [],
      newReleases: data.newReleases || [],
    };
  } catch (err) {
    console.error("Error fetching explore content:", err);
    return { featuredTracks: [], newReleases: [] };
  }
}

// Fetch recommendations based on posts
export async function getRecommendations() {
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/recommendations/from-posts`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    const data: Track[] = await res.json();
    return data.slice(0, 20);
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    return [];
  }
}

// Play a specific Spotify track via backend
export async function playTrack(trackId: string, username: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/play-track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Username: username,
      },
      credentials: "include",
      body: JSON.stringify({ trackId }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to play track:", text);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error playing track:", err);
    return false;
  }
}

// Pause currently playing Spotify track via backend
export async function pauseTrack(username: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/pause-track`, {
      method: "POST",
      headers: {
        Username: username,
      },
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to pause track:", text);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error pausing track:", err);
    return false;
  }
}



