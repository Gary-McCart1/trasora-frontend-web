import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Follow a user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    const res = await fetch(`${BASE_URL}/api/follow/${username}`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to follow" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to follow user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Unfollow a user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    const res = await fetch(`${BASE_URL}/api/follow/${username}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to unfollow" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to unfollow user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}