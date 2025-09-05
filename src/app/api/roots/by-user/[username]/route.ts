import { NextRequest, NextResponse } from "next/server";
import { RootSong } from "@/app/components/RootsStrip";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  try {
    const res = await fetch(`${BASE_URL}/${username}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch roots");

    const data: RootSong[] = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch roots";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}