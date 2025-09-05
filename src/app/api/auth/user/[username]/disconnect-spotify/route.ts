import { NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_URL || "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function PUT(_: Request, { params }: { params: { username: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/user/${params.username}/disconnect-spotify`, {
      method: "PUT",
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data?.message || "Failed to disconnect Spotify");
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    console.error("Failed to disconnect Spotify:", err);
    return NextResponse.json({ error: "Failed to disconnect Spotify" }, { status: 500 });
  }
}
