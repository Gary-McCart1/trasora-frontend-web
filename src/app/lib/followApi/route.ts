const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function getFollowStatus(userId: number) {
    const res = await fetch(`${BASE_URL}/api/follow/${userId}/status`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch follow status");
    return res.json();
  }
  
  export async function followUser(username: string) {
    const res = await fetch(`${BASE_URL}/api/follow/${username}`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to follow");
    return res.json();
  }
  
  export async function unfollowUser(username: string) {
    const res = await fetch(`${BASE_URL}/api/follow/${username}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to unfollow");
    return res.json();
  }
  