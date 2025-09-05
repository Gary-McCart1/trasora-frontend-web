import { NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/token`, { credentials: "include" });
    if (!res.ok) throw new Error(`Failed to get token: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ accessToken: data.accessToken || null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch Spotify token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
