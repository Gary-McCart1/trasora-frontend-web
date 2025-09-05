import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// GET a post by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const res = await fetch(`${BASE_URL}/api/posts/${params.postId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch post");

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT update a post
export async function PUT(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${BASE_URL}/api/posts/${params.postId}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to update post");

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const res = await fetch(`${BASE_URL}/api/posts/${params.postId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete post");

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete post" },
      { status: 500 }
    );
  }
}
