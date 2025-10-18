import { SuggestedUser } from "../types/User";
import { getAuthHeaders } from "./usersApi";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Get follow status for a user
export async function getFollowStatus(userId: number) {
  const res = await fetch(`${BASE_URL}/api/follow/${userId}/status`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch follow status");
  return res.json();
}

// Follow a user
export async function followUser(username: string) {
  const res = await fetch(`${BASE_URL}/api/follow/${username}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to follow user");
  return res.json();
}

// Unfollow a user
export async function unfollowUser(username: string) {
  const res = await fetch(`${BASE_URL}/api/follow/${username}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to unfollow user");
  return res.json();
}

export async function getSuggestedFollows(username: string): Promise<SuggestedUser[]> {
  const res = await fetch(`${BASE_URL}/api/follow/suggested/${username}`, {
    headers: getAuthHeaders(),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("Failed suggested follows response:", text);
    throw new Error("Failed to fetch suggested follows");
  }

  try {
    const data: SuggestedUser[] = JSON.parse(text);
    return data;
  } catch (err) {
    console.error("Invalid JSON from suggested follows endpoint:", text);
    throw new Error("Invalid JSON from suggested follows endpoint");
  }
}

export async function getFollowers(username: string){
  const res = await fetch(`${BASE_URL}/api/follow/${username}/followers`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch your followers");
  return res.json();
}
export async function getFollowing(username: string){
  const res = await fetch(`${BASE_URL}/api/follow/${username}/following`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user's you follow");
  return res.json();
}
