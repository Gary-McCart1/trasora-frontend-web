import { RootSongInput } from "@/app/components/RootsSearchBar";
import { RootSong } from "@/app/components/RootsStrip";

// Fetch all roots for a given user
export async function fetchRoots(username: string): Promise<RootSong[]> {
  const res = await fetch(`/api/roots/${username}`);
  if (!res.ok) throw new Error("Failed to fetch roots");
  return res.json();
}

// Add a root at a specific position
export async function addRoot(song: RootSongInput, position: number): Promise<RootSong> {
  const res = await fetch(`/api/roots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ song, position }),
  });

  if (!res.ok) throw new Error("Failed to add root");
  return res.json();
}

// Delete a root by ID
export async function deleteRoot(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/roots/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete root");
  return res.json();
}

// Optional: reorder roots
export async function reorderRoots(ids: number[]): Promise<{ success: boolean }> {
  const res = await fetch(`/api/roots/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
  });

  if (!res.ok) throw new Error("Failed to reorder roots");
  return res.json();
}
