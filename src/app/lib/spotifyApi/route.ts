import { NextRequest, NextResponse } from "next/server";
import { Track } from "@/app/types/spotify";
import { RootSongInput } from "../../components/RootsSearchBar";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// GET /api/spotify/token
export async function FETCH_SPOTIFY_TOKEN() {
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/token`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to get token: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ accessToken: data.accessToken || null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch Spotify token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/spotify/search?q=QUERY
export async function SEARCH_SPOTIFY(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q") || "";
  const username = req.headers.get("Username") || ""; // <-- get headers from req

  if (!query.trim() || !username) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const res = await fetch(`${BASE_URL}/api/spotify/search?q=${encodeURIComponent(query)}`, {
      headers: { Username: username },
      credentials: "include",
    });
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

    return NextResponse.json(mappedTracks);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Spotify search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


// POST /api/spotify/trunk-playlist/:trunkId
export async function SEND_TRUNK_TO_SPOTIFY(req: NextRequest, { params }: { params: { trunkId: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/trunk-playlist/${params.trunkId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to create Spotify playlist");
    }

    const data = await res.json();
    return NextResponse.json({ playlistUrl: data.playlistUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send trunk to Spotify";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/spotify/tracks/:trackId
export async function GET_SPOTIFY_TRACK(req: NextRequest, { params }: { params: { trackId: string } }) {
  const username = req.headers.get("Username") || "";
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/tracks/${params.trackId}`, {
      credentials: "include",
      headers: { Username: username },
    });
    if (!res.ok) throw new Error("Failed to fetch track from backend");
    const data = await res.json();
    const DEFAULT_ALBUM_IMAGE = "/default-album-cover.png";

    const track: Track = {
      id: data.id,
      name: data.name,
      artists: data.artists || [{ name: "Unknown Artist" }],
      album: { images: data.album?.images || [{ url: DEFAULT_ALBUM_IMAGE }] },
    };

    return NextResponse.json(track);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch track";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/spotify/explore
export async function GET_SPOTIFY_EXPLORE(req: NextRequest) {
  const username = req.headers.get("Username") || "";
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/explore`, {
      headers: { Username: username },
      credentials: "include",
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    return NextResponse.json({
      featuredTracks: data.featuredTracks || [],
      newReleases: data.newReleases || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch explore content";
    return NextResponse.json({ featuredTracks: [], newReleases: [], error: message }, { status: 500 });
  }
}

// GET /api/spotify/recommendations
export async function GET_SPOTIFY_RECOMMENDATIONS() {
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/recommendations/from-posts`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    const data: Track[] = await res.json();
    return NextResponse.json(data.slice(0, 20));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch recommendations";
    return NextResponse.json({ tracks: [], error: message }, { status: 500 });
  }
}

// POST /api/spotify/play-track
export async function PLAY_SPOTIFY_TRACK(req: NextRequest) {
  try {
    const { trackId } = await req.json();
    const username = req.headers.get("Username") || "";

    const res = await fetch(`${BASE_URL}/api/spotify/play-track`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Username: username },
      credentials: "include",
      body: JSON.stringify({ trackId }),
    });

    if (!res.ok) throw new Error(await res.text());
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to play track";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/spotify/pause-track
export async function PAUSE_SPOTIFY_TRACK(req: NextRequest) {
  try {
    const username = req.headers.get("Username") || "";
    const res = await fetch(`${BASE_URL}/api/spotify/pause-track`, {
      method: "POST",
      headers: { Username: username },
      credentials: "include",
    });

    if (!res.ok) throw new Error(await res.text());
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to pause track";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
