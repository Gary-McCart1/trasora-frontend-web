import { PostDto } from "@/app/types/Post";
import { fetchWithAuth, getAuthHeaders } from "./usersApi";

export type CreatePostData = {
  title: string;
  text: string;
  trackId: string;
  trackName: string;
  artistName: string;
  albumArtUrl?: string;
  branchCount?: number;
  trackVolume?: number;
  applePreviewUrl?: string;
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
      applePreviewUrl: data.applePreviewUrl || "",
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
  return;
}

export async function likePost(postId: string) {
  const res = await fetch(`${BASE_URL}/api/posts/${postId}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to like post");
  return ;
}
export async function commentOnPost(postId: string, text: string) {
    const res = await fetch(`${BASE_URL}/api/comments?postId=${postId}`, {
      method: "POST",
      headers: { "Content-Type": "text/plain", ...getAuthHeaders() },
      body: text,
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to comment:", errorText);
      throw new Error("Failed to comment on post");
    }
  
    // Return the full comment DTO from backend
    return res.json();
  }
  
  

  export async function deleteComment(commentId: string) {
    const res = await fetch(`${BASE_URL}/api/comments/${commentId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete comment");
  
    // DELETE now returns no content, so just return true for success
    return true;
  }
  

export async function getFeed(): Promise<PostDto[]> {
  const res = await fetch(`${BASE_URL}/api/posts/feed`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
}

export async function flagPost(postId: number, reporterId: number, reason: string) {
  const res = await fetchWithAuth(
    `${BASE_URL}/api/flags/post/${postId}?reporterId=${reporterId}&reason=${encodeURIComponent(reason)}`,
    { method: "POST" }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to flag post:", text);
    throw new Error("Failed to flag post");
  }

  return res.json();
}

export async function flagComment(commentId: number, reporterId: number, reason: string) {
  const res = await fetchWithAuth(
    `${BASE_URL}/api/flags/comment/${commentId}?reporterId=${reporterId}&reason=${encodeURIComponent(reason)}`,
    { method: "POST" }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to flag comment:", text);
    throw new Error("Failed to flag comment");
  }

  return res.json();
}

