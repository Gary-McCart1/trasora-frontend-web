import { StoryDto } from "@/app/types/Story";
import { getAuthHeaders } from "./usersApi";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Fetch active stories
export async function fetchActiveStories(): Promise<StoryDto[]> {
  const res = await fetch(`${BASE_URL}/api/stories/active`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch active stories");
  return res.json();
}

// Upload a new story
export async function uploadStory(story: StoryDto, file?: File): Promise<StoryDto> {
  const formData = new FormData();
  if (file) formData.append("file", file);
  formData.append("story", new Blob([JSON.stringify(story)], { type: "application/json" }));

  const res = await fetch(`${BASE_URL}/api/stories/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to upload story");
  }

  return res.json();
}

// Delete a story
export async function deleteStory(storyId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/stories/${storyId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to delete story ${storyId}`);
    }
  }
  