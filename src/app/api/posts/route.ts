// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// POST /api/posts -> create a new post
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const res = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: errorText || "Failed to create post" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// (Optional) GET /api/posts -> fetch all posts
export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/api/posts`, { credentials: "include" });
    if (!res.ok) return NextResponse.json([], { status: res.status });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
