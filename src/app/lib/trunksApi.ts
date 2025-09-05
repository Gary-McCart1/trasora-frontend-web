// src/lib/trunksApi.ts
import { Branch, Trunk, newTrunk } from "@/app/types/User";
import { RootSongInput } from "@/app/components/RootsSearchBar";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// ✅ Get trunks for a specific user
export async function getTrunks(username: string): Promise<Trunk[]> {
  const res = await fetch(`${BASE_URL}/api/trunks/user/${username}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user trunks");
  return res.json();
}

// ✅ Get all available (public) trunks
export async function getAvailableTrunks(): Promise<Trunk[]> {
  const res = await fetch(`${BASE_URL}/api/trunks`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch available trunks");
  return res.json();
}

// ✅ Create a new trunk
export async function createTrunk(trunkData: newTrunk, username: string): Promise<Trunk> {
  const res = await fetch(`${BASE_URL}/api/trunks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ newTrunk: trunkData, username }),
  });
  if (!res.ok) throw new Error("Failed to create trunk");
  return res.json();
}

// ✅ Delete a trunk
export async function deleteTrunk(trunkId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/trunks/${trunkId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete trunk");
}

// ✅ Add a track to a trunk
export async function addTrackToTrunk(
  trunkId: number,
  song: RootSongInput,
  addedByUsername: string
): Promise<Branch> {
  const res = await fetch(`${BASE_URL}/api/trunks/${trunkId}/branches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ song, addedByUsername }),
  });
  if (!res.ok) throw new Error("Failed to add track to trunk");
  return res.json();
}

// ✅ Update trunk title
export async function updateTrunkTitle(trunkId: number, title: string): Promise<Trunk> {
  const res = await fetch(`${BASE_URL}/api/trunks/${trunkId}/title`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to update trunk title");
  return res.json();
}

// ✅ Update trunk visibility
export async function updateTrunkVisibility(trunkId: number, publicFlag: boolean): Promise<Trunk> {
  const res = await fetch(`${BASE_URL}/api/trunks/${trunkId}/visibility`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ publicFlag }),
  });
  if (!res.ok) throw new Error("Failed to update trunk visibility");
  return res.json();
}
