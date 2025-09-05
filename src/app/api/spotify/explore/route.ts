import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET(req: NextRequest) {
  const username = req.headers.get("Username") || "";
  try {
    const res = await fetch(`${BASE_URL}/api/spotify/explore`, {
      headers: { Username: username },
      credentials: "include",
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    return NextResponse.json({
      featuredTracks: data.featuredTracks || [],
      newReleases: data.newReleases || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch explore content";
    return NextResponse.json({ featuredTracks: [], newReleases: [], error: message }, { status: 500 });
  }
}
