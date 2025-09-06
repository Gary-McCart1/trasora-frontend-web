import { RootSongInput } from "@/app/components/RootsSearchBar";
import { RootSong } from "@/app/components/RootsStrip";
import { getAuthHeaders } from "./usersApi";
import { title } from "process";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Fetch all roots for a given user
export async function fetchRoots(username: string): Promise<RootSong[]> {
  const res = await fetch(`${BASE_URL}/api/roots/${username}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch roots");
  return res.json();
}

// Add a root at a specific position
export async function addRoot(song: RootSongInput, position: number): Promise<RootSong> {
    const payload = {
      trackTitle: song.title,
      artistName: song.artist,
      albumArtUrl: song.albumArtUrl,
      trackId: song.trackId,
      position: position,
    };
  
    const res = await fetch(`${BASE_URL}/api/roots`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      let errorMessage = "Failed to add root";
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
  
    return res.json();
  }
// Delete a root by ID
export async function deleteRoot(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/roots/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete root");
    // The API returns 204 No Content, so we don't need to parse JSON
    return { success: true };
  }

export async function reorderRoots(ids: number[]): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/roots/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(ids),
    });
  
    if (!res.ok) throw new Error("Failed to reorder roots");
    // The backend returns a 204 No Content status, so we don't need to parse JSON.
    return;
  }