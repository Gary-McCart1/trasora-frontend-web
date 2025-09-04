// src/app/api/follow/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// GET follow status (?userId=123)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const res = await fetch(`${BASE_URL}/api/follow/${userId}/status`, {
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch follow status" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST follow a user (expects { username } in body)
export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const res = await fetch(`${BASE_URL}/api/follow/${username}`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to follow" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE unfollow a user (expects { username } in body)
export async function DELETE(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const res = await fetch(`${BASE_URL}/api/follow/${username}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to unfollow" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
