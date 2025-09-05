import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function POST(req: NextRequest, { params }: { params: { trunkId: string } }) {
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
