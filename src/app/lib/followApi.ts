// src/lib/followApi.ts

export async function getFollowStatus(userId: number) {
    const res = await fetch(`/api/follow?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch follow status");
    return res.json();
  }
  
  export async function followUser(username: string) {
    const res = await fetch(`/api/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error("Failed to follow");
    return res.json();
  }
  
  export async function unfollowUser(username: string) {
    const res = await fetch(`/api/follow`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error("Failed to unfollow");
    return res.json();
  }
  