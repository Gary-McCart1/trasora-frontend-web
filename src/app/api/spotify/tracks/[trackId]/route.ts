import { NextRequest, NextResponse } from "next/server";
import { Track } from "@/app/types/spotify";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const { trackId } = await params;
  const username = req.headers.get("Username") || "";
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/tracks/${trackId}`, {
      headers: { Username: username },
      credentials: "include",
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