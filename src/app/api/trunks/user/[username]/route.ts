import { NextResponse } from "next/server";
import { Trunk } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  try {
    const res = await fetch(`${BASE_URL}/api/trunks/user/${username}`, {
      credentials: "include",
    });
    if (!res.ok) return NextResponse.json([], { status: 200 });

    const trunks: Trunk[] = await res.json();
    return NextResponse.json(trunks);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch user trunks" },
      { status: 500 }
    );
  }
}