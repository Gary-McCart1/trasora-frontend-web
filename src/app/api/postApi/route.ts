import { PostDto } from "@/app/types/Post";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function getUserPosts(username: string): Promise<PostDto[]> {
  const res = await fetch(`${BASE_URL}/api/posts/author/${username}`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export async function getUserImagePosts(username: string): Promise<PostDto[]> {
  const res = await fetch(`${BASE_URL}/api/posts/${username}/images`, { credentials: "include" });
  if(!res.ok) return [];
  return res.json();
}

export async function getUserVideoPosts(username: string): Promise<PostDto[]> {
  const res = await fetch(`${BASE_URL}/api/posts/${username}/vidoes`, { credentials: "include" });
  if(!res.ok) return [];
  return res.json();
}


export async function createPost(postDto: PostDto, mediaFile?: File) {
  const formData = new FormData();

  // Add post data as JSON
  formData.append(
    "postDto",
    new Blob([JSON.stringify(postDto)], { type: "application/json" })
  );

  // Add image or video file
  if (mediaFile) {
    formData.append("mediaFile", mediaFile);
  }

  const response = await fetch(`${BASE_URL}/api/posts`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create post: ${errorText || response.statusText}`
    );
  }

  return response.json();
}

  
  export async function getPostById(postId: number): Promise<PostDto> {
    const res = await fetch(`${BASE_URL}/api/posts/${postId}`, {
      credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to fetch post");
    return res.json();
  }
  
  export async function updatePost(
    postId: number,
    data: {
      title: string;
      text: string;
      trackId: string;
      trackName: string;
      artistName: string;
      albumArtUrl: string;
      trackVolume: number
    },
    imageFile?: File
  ): Promise<void> {
    const formData = new FormData();
  
    // Append the entire post DTO as a JSON blob under 'postDto'
    formData.append(
      "postDto",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );
  
    if (imageFile) {
      formData.append("image", imageFile);
    }
  
    const res = await fetch(`${BASE_URL}/api/posts/${postId}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });
  
    if (!res.ok) {
      throw new Error("Failed to update post");
    }
  }

  export async function incrementPostBranchCount(postId: number) {
    const res = await fetch(`${BASE_URL}/api/posts/${postId}/branch`, {
      method: "POST",
      credentials: "include",
    });
  
    if (!res.ok) {
      throw new Error("Failed to increment branch count on post");
    }
  
    return res.json();
  }

  export async function likePost(postId: number) {
    const response = await fetch(`${BASE_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to like post');
    return;
  }
  
  export async function commentOnPost(postId: number, text: string) {
    const response = await fetch(`${BASE_URL}/api/posts/${postId}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(text), // Your backend expects raw string in body, not JSON object
    });
    if (!response.ok) throw new Error('Failed to post comment');
    return;
  }
  
  export async function deletePost(postId: number) {
    const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete post');
    return;
  }
  
  export async function editPost(postId: number, data: { text?: string }) {
    const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to edit post');
    return;
  }

  
  export async function deleteComment(commentId: number) {
      const response = await fetch(`${BASE_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete comment: ${errorText || response.statusText}`);
      }
    }