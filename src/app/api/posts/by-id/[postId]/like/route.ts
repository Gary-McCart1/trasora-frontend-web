import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  try {
    const res = await fetch(`${BASE_URL}/api/posts/${postId}/like`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to like post");

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to like post" },
      { status: 500 }
    );
  }
}