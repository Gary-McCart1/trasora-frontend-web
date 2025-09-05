// src/lib/storiesApi.ts
import { StoryDto } from "@/app/types/Story";

// Fetch active stories
export async function fetchActiveStories(): Promise<StoryDto[]> {
  const res = await fetch("/api/stories/active");
  if (!res.ok) throw new Error("Failed to fetch active stories");
  return res.json();
}

// Upload a new story
export async function uploadStory(story: StoryDto, file?: File): Promise<StoryDto> {
  const formData = new FormData();
  if (file) formData.append("file", file);
  formData.append("story", new Blob([JSON.stringify(story)], { type: "application/json" }));

  const res = await fetch("/api/stories/active", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to upload story");
  }

  return res.json();
}
