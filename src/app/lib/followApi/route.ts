import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// GET /api/follow/:userId/status
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    const res = await fetch(`${BASE_URL}/api/follow/${userId}/status`, {
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch follow status" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/follow/:username
export async function POST(req: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params;

  try {
    const res = await fetch(`${BASE_URL}/api/follow/${username}`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to follow user" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/follow/:username
export async function DELETE(req: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params;

  try {
    const res = await fetch(`${BASE_URL}/api/follow/${username}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to unfollow user" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
