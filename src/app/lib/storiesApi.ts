// src/lib/storiesApi.ts
import { StoryDto } from "@/app/types/Story";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Fetch active stories
export async function fetchActiveStories(): Promise<StoryDto[]> {
  const res = await fetch(`${BASE_URL}/api/stories/active`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch active stories");
  return res.json();
}

// Upload a new story
export async function uploadStory(story: StoryDto, file?: File): Promise<StoryDto> {
  const formData = new FormData();
  if (file) formData.append("file", file);
  formData.append("story", new Blob([JSON.stringify(story)], { type: "application/json" }));

  const res = await fetch(`${BASE_URL}/api/stories/active`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to upload story");
  }

  return res.json();
}
