import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    const res = await fetch(`${BASE_URL}/api/posts/${username}/images`, {
      credentials: "include",
    });
    if (!res.ok) return NextResponse.json([], { status: res.status });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch image posts" },
      { status: 500 }
    );
  }
}