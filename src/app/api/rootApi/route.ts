// src/api/rootsApi.ts
import { RootSongInput } from "../../components/RootsSearchBar";
import { RootSong } from "../../components/RootsStrip";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export const fetchRoots = async (username: string): Promise<RootSong[]> => {
  const res = await fetch(`${BASE_URL}/${username}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch roots");
  return res.json();
};

export const addRoot = async (song: RootSongInput, position: number): Promise<RootSong> => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: song.title,
      artist: song.artist,
      albumArtUrl: song.albumArtUrl,
      trackId: song.trackId,
      position,
    }),
  });
  if (!res.ok) throw new Error("Failed to add root");
  return res.json();
};

export const deleteRoot = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete root");
};

export const reorderRoots = async (ids: number[]): Promise<void> => {
  const res = await fetch(`${BASE_URL}/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error("Failed to reorder roots");
};
