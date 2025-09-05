import { NextRequest, NextResponse } from "next/server";
import { RootSongInput } from "@/app/components/RootsSearchBar";
import { RootSong } from "@/app/components/RootsStrip";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function POST(req: NextRequest) {
  try {
    const body: { song: RootSongInput; position: number } = await req.json();

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: body.song.title,
        artist: body.song.artist,
        albumArtUrl: body.song.albumArtUrl,
        trackId: body.song.trackId,
        position: body.position,
      }),
    });

    if (!res.ok) throw new Error("Failed to add root");

    const data: RootSong = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add root";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
