// src/app/api/trunks.ts
import { RootSongInput } from "@/app/components/RootsSearchBar";
import { Branch, Trunk, newTrunk } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Get all trunks for a user
export async function getTrunks(username: string): Promise<Trunk[]> {
  const res = await fetch(`${BASE_URL}/api/trunks/user/${username}`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  return res.json();
}

// Get all available trunks (used for branch modal)
export async function getAvailableTrunks(): Promise<Trunk[]> {
  const res = await fetch(`${BASE_URL}/api/trunks/available/trunks`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch trunks");
  return res.json();
}

// Create a new trunk
export async function createTrunk(newTrunk: newTrunk, username: string) {
  const res = await fetch(`${BASE_URL}/api/trunks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: newTrunk.name,
      description: newTrunk.description,
      publicFlag: newTrunk.isPublic,
      username,
    }),
  });
  if (!res.ok) throw new Error("Failed to create trunk");
  return res.json();
}

// Delete a trunk
export async function deleteTrunk(trunkId: number) {
  const res = await fetch(`${BASE_URL}/api/trunks/${trunkId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete trunk");
  return true;
}

// Add a track to a trunk (creates a branch)
export async function addTrackToTrunk(
  trunkId: number,
  song: RootSongInput,
  addedByUsername: string
): Promise<Branch> {
  const res = await fetch(`${BASE_URL}/api/branches/trunk/${trunkId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      trackId: song.trackId,
      position: 0,
      title: song.title,
      artist: song.artist,
      albumArtUrl: song.albumArtUrl,
      addedByUsername,
    }),
  });

  if (!res.ok) throw new Error("Failed to add track");
  return res.json();
}

// Update a trunk's title
export async function updateTrunkTitle(trunkId: number, title: string): Promise<Trunk> {
    const res = await fetch(`${BASE_URL}/api/trunks/${trunkId}/title`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title }),
    });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to update trunk title");
    }
  
    return res.json();
  }

  export async function updateTrunkVisibility(trunkId: number, publicFlag: boolean): Promise<Trunk> {
    const res = await fetch(`${BASE_URL}/api/trunks/${trunkId}/visibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ publicFlag }),
    });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to update trunk visibility");
    }
  
    return res.json();
  }
  
