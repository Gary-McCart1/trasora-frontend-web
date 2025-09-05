import { PostDto } from "@/app/types/Post";


export type CreatePostData = {
  title: string;
  text: string;
  trackId: string;
  trackName: string;
  artistName: string;
  albumArtUrl?: string;
  branchCount?: number;
  trackVolume?: number;
};

interface PostFormData {
    title: string;
    text: string;
    trackId: string;
    trackName: string;
    artistName?: string;
    albumArtUrl?: string;
    trackVolume?: number;
    [key: string]: string | number | undefined; // allow optional extra fields
  }


// Author posts
export async function getUserPosts(username: string): Promise<PostDto[]> {
  const res = await fetch(`/api/posts/author/${username}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function getUserImagePosts(username: string): Promise<PostDto[]> {
  const res = await fetch(`/api/posts/${username}/images`);
  if (!res.ok) throw new Error("Failed to fetch image posts");
  return res.json();
}

export async function getUserVideoPosts(username: string): Promise<PostDto[]> {
  const res = await fetch(`/api/posts/${username}/videos`);
  if (!res.ok) throw new Error("Failed to fetch video posts");
  return res.json();
}

// Single post
export async function getPostById(postId: string): Promise<PostDto> {
  const res = await fetch(`/api/posts/${postId}`);
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

// Create / edit / delete
export async function createPost(data: CreatePostData, file?: File) {
    const formData = new FormData();
  
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
  
    if (file) formData.append("mediaFile", file);
  
    const res = await fetch(`/api/posts`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Failed to create post");
    return res.json() as Promise<PostDto>;
  }
  

// lib/postsApi.ts
export async function editPost(
    postId: string,
    data: PostFormData,
    file?: File | null
  ) {
    const formData = new FormData();
  
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
  
    if (file) {
      formData.append("media", file);
    }
  
    const res = await fetch(`/api/posts/${postId}`, { method: "PUT", body: formData });
    if (!res.ok) throw new Error("Failed to update post");
    return res.json();
  }
  

export async function deletePost(postId: string) {
  const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete post");
  return res.json();
}

// Interactions
export async function incrementPostBranchCount(postId: string) {
  const res = await fetch(`/api/posts/${postId}/branch`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to increment branch count");
  return res.json();
}

export async function likePost(postId: string) {
  const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to like post");
  return res.json();
}

export async function commentOnPost(postId: string, text: string) {
  const res = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to comment on post");
  return res.json();
}

export async function deleteComment(commentId: string) {
  const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete comment");
  return res.json();
}
