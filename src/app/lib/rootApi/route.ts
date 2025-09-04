import { NextRequest, NextResponse } from "next/server";
import { RootSongInput } from "../../components/RootsSearchBar";
import { RootSong } from "../../components/RootsStrip";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// GET /api/roots/:username
export async function GET_ROOTS(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/${params.username}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch roots");

    const data: RootSong[] = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch roots";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/roots
export async function ADD_ROOT(req: NextRequest) {
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

// DELETE /api/roots/:id
export async function DELETE_ROOT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/${params.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to delete root");

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete root";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/roots/reorder
export async function REORDER_ROOTS(req: NextRequest) {
  try {
    const ids: number[] = await req.json();

    const res = await fetch(`${BASE_URL}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(ids),
    });

    if (!res.ok) throw new Error("Failed to reorder roots");

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reorder roots";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
