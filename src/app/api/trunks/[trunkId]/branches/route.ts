import { NextRequest, NextResponse } from "next/server";
import { RootSongInput } from "@/app/components/RootsSearchBar";
import { Branch } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function POST(
  req: NextRequest,
  { params }: { params: { trunkId: string } }
) {
  try {
    const { song, addedByUsername } = (await req.json()) as {
      song: RootSongInput;
      addedByUsername: string;
    };

    const res = await fetch(`${BASE_URL}/api/branches/trunk/${params.trunkId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        trackId: song.trackId,
        position: 0,
        title: song.title,
        artist: song.artist,
        albumArtUrl: song.albumArtUrl,
        addedByUsername,
      }),
    });

    if (!res.ok) throw new Error("Failed to add track");
    const branch: Branch = await res.json();
    return NextResponse.json(branch);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add track" },
      { status: 500 }
    );
  }
}
