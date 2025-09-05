import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function POST(req: NextRequest) {
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
