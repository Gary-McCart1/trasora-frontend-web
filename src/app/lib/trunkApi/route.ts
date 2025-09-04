// src/app/api/trunks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { RootSongInput } from "@/app/components/RootsSearchBar";
import { Branch, Trunk, newTrunk } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const username = searchParams.get("username");

  try {
    if (action === "userTrunks" && username) {
      const res = await fetch(`${BASE_URL}/api/trunks/user/${username}`, {
        credentials: "include",
      });
      if (!res.ok) return NextResponse.json([], { status: 200 });
      const trunks: Trunk[] = await res.json();
      return NextResponse.json(trunks);
    }

    if (action === "availableTrunks") {
      const res = await fetch(`${BASE_URL}/api/trunks/available/trunks`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch trunks");
      const trunks: Trunk[] = await res.json();
      return NextResponse.json(trunks);
    }

    return NextResponse.json({ error: "Invalid action or missing params" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch trunks";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    // Create new trunk
    if (type === "createTrunk") {
      const { newTrunk: trunkData, username } = body as { newTrunk: newTrunk; username: string };
      const res = await fetch(`${BASE_URL}/api/trunks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: trunkData.name,
          description: trunkData.description,
          publicFlag: trunkData.isPublic,
          username,
        }),
      });
      if (!res.ok) throw new Error("Failed to create trunk");
      const createdTrunk: Trunk = await res.json();
      return NextResponse.json(createdTrunk);
    }

    // Add track to trunk
    if (type === "addTrack") {
      const { trunkId, song, addedByUsername } = body as {
        trunkId: number;
        song: RootSongInput;
        addedByUsername: string;
      };
      const res = await fetch(`${BASE_URL}/api/branches/trunk/${trunkId}`, {
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
    }

    return NextResponse.json({ error: "Invalid POST type" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "POST request failed";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { trunkId, type } = body as { trunkId: number; type: string };

    if (type === "updateTitle") {
      const { title } = body;
      const res = await fetch(`${BASE_URL}/api/trunks/${trunkId}/title`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updatedTrunk: Trunk = await res.json();
      return NextResponse.json(updatedTrunk);
    }

    if (type === "updateVisibility") {
      const { publicFlag } = body;
      const res = await fetch(`${BASE_URL}/api/trunks/${trunkId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ publicFlag }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updatedTrunk: Trunk = await res.json();
      return NextResponse.json(updatedTrunk);
    }

    return NextResponse.json({ error: "Invalid PATCH type" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PATCH request failed";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trunkId = searchParams.get("trunkId");

    if (!trunkId) return NextResponse.json({ error: "Missing trunkId" }, { status: 400 });

    const res = await fetch(`${BASE_URL}/api/trunks/${trunkId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete trunk");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "DELETE request failed";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
