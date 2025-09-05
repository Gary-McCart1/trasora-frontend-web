import { PostDto } from "@/app/types/Post";
import { getAuthHeaders } from "./usersApi";

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

interface PostFormData extends CreatePostData {
  [key: string]: string | number | undefined; // allow optional extra fields
}

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Author posts
export async function getUserPosts(username: string): Promise<PostDto[]> {
  const res = await fetch(`${BASE_URL}/api/posts/author/${username}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function getUserImagePosts(username: string): Promise<PostDto[]> {
  const res = await fetch(`${BASE_URL}/api/posts/${username}/images`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch image posts");
  return res.json();
}

export async function getUserVideoPosts(username: string): Promise<PostDto[]> {
  const res = await fetch(`${BASE_URL}/api/posts/${username}/videos`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch video posts");
  return res.json();
}

// Single post
export async function getPostById(postId: string): Promise<PostDto> {
  const res = await fetch(`${BASE_URL}/api/posts/${postId}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

// Create post
export async function createPost(data: CreatePostData, file?: File) {
    const formData = new FormData();
  
    // Ensure required fields are present
    const postDto = {
      title: data.title || "Untitled",
      text: data.text || "",
      trackId: data.trackId || "",
      trackName: data.trackName || "Unknown Track",
      artistName: data.artistName || "Unknown Artist",
      albumArtUrl: data.albumArtUrl || undefined,
      branchCount: data.branchCount ?? 0,
      trackVolume: data.trackVolume ?? 1,
    };
  
    formData.append(
      "postDto",
      new Blob([JSON.stringify(postDto)], { type: "application/json" })
    );
  
    if (file) formData.append("mediaFile", file);
  
    const res = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      body: formData,
      headers: getAuthHeaders(),
    });
  
    if (!res.ok) {
      const text = await res.text();
      console.error("Server response:", text);
      throw new Error("Failed to create post");
    }
  
    return res.json() as Promise<PostDto>;
  }
  
  // Edit post
  export async function editPost(postId: string, data: PostFormData, file?: File | null) {
    const formData = new FormData();
  
    const postDto = {
      title: data.title || "Untitled",
      text: data.text || "",
      trackId: data.trackId || "",
      trackName: data.trackName || "Unknown Track",
      artistName: data.artistName || "Unknown Artist",
      albumArtUrl: data.albumArtUrl || undefined,
      branchCount: data.branchCount ?? 0,
      trackVolume: data.trackVolume ?? 1,
    };
  
    formData.append(
      "postDto",
      new Blob([JSON.stringify(postDto)], { type: "application/json" })
    );
  
    if (file) formData.append("mediaFile", file);
  
    const res = await fetch(`${BASE_URL}/api/posts/${postId}`, {
      method: "PUT",
      body: formData,
      headers: getAuthHeaders(),
    });
  
    if (!res.ok) {
      const text = await res.text();
      console.error("Server response:", text);
      throw new Error("Failed to update post");
    }
  
    return res.json() as Promise<PostDto>;
  }
  

// Delete post
export async function deletePost(postId: string) {
    const res = await fetch(`${BASE_URL}/api/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  
    if (!res.ok) throw new Error("Failed to delete post");
  
    // 204 No Content → return undefined
    if (res.status === 204) return;
    return res.json();
  }
  

// Interactions
export async function incrementPostBranchCount(postId: string) {
  const res = await fetch(`${BASE_URL}/api/posts/${postId}/branch`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to increment branch count");
  return res.json();
}

export async function likePost(postId: string) {
  const res = await fetch(`${BASE_URL}/api/posts/${postId}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to like post");
  return res.json();
}

export async function commentOnPost(postId: string, text: string) {
  const res = await fetch(`${BASE_URL}/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(text),
  });
  if (!res.ok) throw new Error("Failed to comment on post");
  return res.json();
}

export async function deleteComment(commentId: string) {
  const res = await fetch(`${BASE_URL}/api/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete comment");
  return res.json();
}