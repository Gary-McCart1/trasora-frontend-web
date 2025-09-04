import { NextRequest, NextResponse } from "next/server";
import { PostDto } from "@/app/types/Post";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// GET /api/posts/author/:username
export async function GET_USER_POSTS(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/posts/author/${params.username}`, {
      credentials: "include",
    });

    if (!res.ok) return NextResponse.json([], { status: res.status });

    const data: PostDto[] = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/posts/:username/images
export async function GET_USER_IMAGE_POSTS(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/posts/${params.username}/images`, {
      credentials: "include",
    });
    if (!res.ok) return NextResponse.json([], { status: res.status });

    const data: PostDto[] = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch image posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/posts/:username/videos
export async function GET_USER_VIDEO_POSTS(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/posts/${params.username}/videos`, {
      credentials: "include",
    });
    if (!res.ok) return NextResponse.json([], { status: res.status });

    const data: PostDto[] = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch video posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/posts
export async function CREATE_POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText || "Failed to create post" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/posts/:postId
export async function GET_POST_BY_ID(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/posts/${params.postId}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch post");

    const data: PostDto = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/posts/:postId
export async function UPDATE_POST(req: NextRequest, { params }: { params: { postId: string } }) {
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
    const message = err instanceof Error ? err.message : "Failed to update post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/posts/:postId/branch
export async function INCREMENT_POST_BRANCH(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/posts/${params.postId}/branch`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to increment branch count");

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to increment branch count";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/posts/:postId/like
export async function LIKE_POST(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/posts/${params.postId}/like`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to like post");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to like post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/posts/:postId/comments
export async function COMMENT_ON_POST(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const text = await req.text();

    const res = await fetch(`${BASE_URL}/api/posts/${params.postId}/comments`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: text,
    });

    if (!res.ok) throw new Error("Failed to comment on post");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to comment on post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/posts/:postId
export async function DELETE_POST(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/posts/${params.postId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete post");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/comments/:commentId
export async function DELETE_COMMENT(req: NextRequest, { params }: { params: { commentId: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/comments/${params.commentId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to delete comment");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
