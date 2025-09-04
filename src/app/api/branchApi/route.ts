import { Branch } from "@/app/types/User";

const BASE_URL = "http://localhost:8080";

export async function getBranches(trunkId: number): Promise<Branch[]> {
  const res = await fetch(`${BASE_URL}/api/branches/trunk/${trunkId}`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export async function deleteBranch(branchId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/branches/${branchId}`, {
      method: "DELETE",
      credentials: "include",
    });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to delete branch");
    }
  }