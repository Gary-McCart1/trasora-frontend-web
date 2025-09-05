const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Get follow status for a user
export async function getFollowStatus(userId: number) {
  const res = await fetch(`${BASE_URL}/api/follow?userId=${userId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch follow status");
  return res.json();
}

// Follow a user
export async function followUser(username: string) {
  const res = await fetch(`${BASE_URL}/api/follow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error("Failed to follow user");
  return res.json();
}

// Unfollow a user
export async function unfollowUser(username: string) {
  const res = await fetch(`${BASE_URL}/api/follow`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error("Failed to unfollow user");
  return res.json();
}
