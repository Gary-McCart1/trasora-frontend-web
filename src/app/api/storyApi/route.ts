// api/stories.ts
"use client"
import { StoryDto } from "../../types/Story";
import { Track } from "../../types/spotify";

const BASE_URL = "http://localhost:8080";

export const fetchActiveStories = async (): Promise<StoryDto[]> => {
  const res = await fetch(`${BASE_URL}/api/stories/active`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch stories");
  return res.json();
};

export const uploadStory = async (
    userId: number,
    username: string,
    profilePictureUrl: string,
    track: Track,
    file?: File,
    caption?: string
  ): Promise<StoryDto> => {
    const formData = new FormData();
  
    if (file) {
      formData.append("file", file);
    }
    console.log(profilePictureUrl)
  
    // Story JSON part
    const storyPayload = {
      authorId: userId,
      authorUsername: username,
      authorProfilePictureUrl: profilePictureUrl,
      type: "TRACK",
      caption: caption || "",
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      trackId: track.id,
      trackName: track.name,
      artistName: track.artists[0]?.name || "",
      albumArtUrl: track.album?.images[0]?.url || "",
    };
  
    formData.append("story", new Blob([JSON.stringify(storyPayload)], { type: "application/json" }));
  
    const res = await fetch(`${BASE_URL}/api/stories/create`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
  
    if (!res.ok) {
      throw new Error("Failed to upload story");
    }
  
    return res.json();
  };
  