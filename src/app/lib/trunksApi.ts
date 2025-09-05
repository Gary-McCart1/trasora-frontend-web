// src/lib/trunksApi.ts
import { Branch, Trunk, newTrunk } from "@/app/types/User";
import { RootSongInput } from "@/app/components/RootsSearchBar";

// ✅ Get trunks for a specific user
export async function getTrunks(username: string): Promise<Trunk[]> {
  const res = await fetch(`/api/trunks/user/${username}`);
  if (!res.ok) throw new Error("Failed to fetch user trunks");
  return res.json();
}

// ✅ Get all available (public) trunks
export async function getAvailableTrunks(): Promise<Trunk[]> {
  const res = await fetch("/api/trunks");
  if (!res.ok) throw new Error("Failed to fetch available trunks");
  return res.json();
}

// ✅ Create a new trunk
export async function createTrunk(trunkData: newTrunk, username: string): Promise<Trunk> {
  const res = await fetch("/api/trunks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newTrunk: trunkData, username }),
  });
  if (!res.ok) throw new Error("Failed to create trunk");
  return res.json();
}

// ✅ Delete a trunk
export async function deleteTrunk(trunkId: number): Promise<void> {
  const res = await fetch(`/api/trunks/${trunkId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete trunk");
}

// ✅ Add a track to a trunk
export async function addTrackToTrunk(
  trunkId: number,
  song: RootSongInput,
  addedByUsername: string
): Promise<Branch> {
  const res = await fetch(`/api/trunks/${trunkId}/branches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ song, addedByUsername }),
  });
  if (!res.ok) throw new Error("Failed to add track to trunk");
  return res.json();
}

// ✅ Update trunk title
export async function updateTrunkTitle(trunkId: number, title: string): Promise<Trunk> {
  const res = await fetch(`/api/trunks/${trunkId}/title`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to update trunk title");
  return res.json();
}

// ✅ Update trunk visibility
export async function updateTrunkVisibility(trunkId: number, publicFlag: boolean): Promise<Trunk> {
  const res = await fetch(`/api/trunks/${trunkId}/visibility`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicFlag }),
  });
  if (!res.ok) throw new Error("Failed to update trunk visibility");
  return res.json();
}
