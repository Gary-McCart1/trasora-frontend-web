import { NextRequest, NextResponse } from "next/server";
import { RootSongInput } from "@/app/components/RootsSearchBar";
import { Track } from "@/app/types/spotify";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q") || "";
  const username = req.headers.get("Username") || "";

  if (!query.trim() || !username) return NextResponse.json([], { status: 200 });

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
        artist: t.artists.map(a => a.name).join(", ") || "Unknown Artist",
        albumArtUrl: t.album.images[0]?.url || "/default-album-cover.png",
        trackId: t.id,
      }));

    return NextResponse.json(mappedTracks);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Spotify search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
