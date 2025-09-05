import { NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/recommendations/from-posts`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return NextResponse.json(data.slice(0, 20));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch recommendations";
    return NextResponse.json({ tracks: [], error: message }, { status: 500 });
  }
}
