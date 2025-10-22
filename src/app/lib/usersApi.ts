import { User } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// -------------------- TOKEN HELPERS --------------------
export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// -------------------- REFRESH LOGIC --------------------
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      // Refresh token invalid or expired
      clearTokens();
      return null;
    }

    const data = await res.json();

    const newAccessToken = data.accessToken;
    const newRefreshToken = data.refreshToken ?? refreshToken; // fallback if server doesn’t rotate

    if (!newAccessToken) {
      clearTokens();
      return null;
    }

    setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch (err) {
    console.error("Error refreshing token:", err);
    clearTokens();
    return null;
  }
}



// -------------------- FETCH WRAPPER --------------------
export async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  let token = getAccessToken();

  if (token) {
    const expiry = getTokenExpiry(token);
    const now = Date.now();

    if (expiry <= now) {
      // Token is already expired → try refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        token = newToken;
      } else {
        clearTokens();
        throw new Error("Session expired. Please log in again.");
      }
    } else if (expiry - now < 5 * 60 * 1000) {
      // Token expiring soon → proactively refresh
      const newToken = await refreshAccessToken();
      if (newToken) token = newToken;
    }
  }

  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // First attempt
  let res = await fetch(input, { ...init, headers });

  // If unauthorized → try refresh once
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(input, { ...init, headers });
    } else {
      clearTokens();
      throw new Error("Session expired. Please log in again.");
    }
  }

  return res;
}




// -------------------- AUTH --------------------

// Get current user
export async function getCurrentUser(): Promise<User> {
  const res = await fetchWithAuth(`${BASE_URL}/api/auth/me`);
  if (!res.ok) throw new Error("Failed to fetch current user");
  return res.json();
}

// Login
// Login
export async function loginUser(login: string, password: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });

  if (!res.ok) {
    // 🎯 ADDED LOGIC HERE 🎯
    const errText = await res.text().catch(() => null);
    
    // Check for the specific Banned or Unverified error messages (403 Forbidden)
    if (res.status === 403 && errText) {
        // We throw the specific message so the component can catch it
        throw new Error(errText); 
    }
    
    // Default error for 401 Unauthorized or other failures
    throw new Error(errText || `Login failed with status ${res.status}`);
  }

  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

// Logout
export async function logoutUser(): Promise<void> {
  clearTokens();
  await fetchWithAuth(`${BASE_URL}/api/auth/logout`, { method: "POST" });
}

// Signup
export async function signupUser(data: {
  fullName: string;
  email: string;
  username: string;
  password: string;
}): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Signup failed");
}

// -------------------- USERS --------------------
export async function getUser(username: string): Promise<User> {
  const res = await fetchWithAuth(`${BASE_URL}/api/auth/user/${username}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function getAllUsers(): Promise<User[]> {
  const res = await fetchWithAuth(`${BASE_URL}/api/auth/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function deleteUser(username: string): Promise<void> {
  const res = await fetchWithAuth(`${BASE_URL}/api/auth/user/${username}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete user: ${errorText}`);
  }
}

export async function updateProfileVisibility(
  username: string,
  isPublic: boolean
): Promise<User> {
  const res = await fetchWithAuth(
    `${BASE_URL}/api/auth/${username}/profile-visibility?profilePublic=${isPublic}`,
    { method: "PUT" }
  );
  if (!res.ok) throw new Error("Failed to update profile visibility");
  return res.json();
}

export async function updateUserProfile(
  updates: Partial<User> & {
    profilePic?: File;
    referredBy?: string;
    profilePublic?: boolean;
  }
): Promise<User> {
  const formData = new FormData();
  if (updates.bio) formData.append("bio", updates.bio);
  if (updates.accentColor) formData.append("accentColor", updates.accentColor);
  if (updates.profilePic) formData.append("profilePic", updates.profilePic);
  if (updates.referredBy) formData.append("referredBy", updates.referredBy);
  if (updates.profilePublic !== undefined) {
    formData.append("profilePublic", String(updates.profilePublic));
  }

  const res = await fetchWithAuth(`${BASE_URL}/api/auth/user`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || "Failed to update profile");
  }

  return res.json();
}

// -------------------- SEARCH --------------------
export async function searchUsers(query: string): Promise<User[]> {
  const res = await fetchWithAuth(
    `${BASE_URL}/api/auth/search-bar?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Failed to search users");
  const data = await res.json();
  return data.users;
}

// -------------------- PASSWORD --------------------
export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Failed to send password reset request");
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) throw new Error("Failed to reset password");
}

// -------------------- EMAIL --------------------
interface VerifyEmailResponse {
  status?: "success" | "error";
  message?: string;
}

export async function verifyEmail(token: string): Promise<void> {
  if (!token) throw new Error("Missing verification token");

  const res = await fetch(
    `${BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`
  );

  const data = (await res.json()) as VerifyEmailResponse;

  if (!res.ok || data.status === "error") {
    throw new Error(data.message || "Verification failed");
  }
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to resend verification email");
}

// -------------------- SPOTIFY --------------------
export async function disconnectSpotify(username: string): Promise<void> {
  const res = await fetchWithAuth(
    `${BASE_URL}/api/auth/user/${username}/disconnect-spotify`,
    { method: "PUT" }
  );
  if (!res.ok) throw new Error("Failed to disconnect Spotify");
}

// Update referredBy
export async function updateReferredBy(
  username: string,
  referredBy: string
): Promise<User> {
  const res = await fetchWithAuth(
    `${BASE_URL}/api/auth/user/${username}/referred-by?referredByUsername=${encodeURIComponent(
      referredBy
    )}`,
    { method: "PUT" }
  );
  if (!res.ok) throw new Error("Failed to update referredBy");
  return res.json();
}

export interface ReferralDto {
  username: string;
  referralCount: number;
}

export async function getReferralLeaderboard(): Promise<ReferralDto[]> {
  const res = await fetchWithAuth(`${BASE_URL}/api/auth/referral-leaderboard`);
  if (!res.ok) throw new Error("Failed to fetch referral leaderboard");
  return res.json();
}


export interface PushSubscriptionDto {
  endpoint: string;
  keysP256dh: string;
  keysAuth: string;
}

export async function getUserPushSubscription(
  username: string
): Promise<{ subscribed: boolean; endpoint?: string }> {
  try {
    const res = await fetchWithAuth(`${BASE_URL}/api/push/subscription/${username}`);
    if (!res.ok) {
      if (res.status === 404) return { subscribed: false };
      throw new Error(`Failed to fetch push subscription: ${res.status}`);
    }
    const data = await res.json();
    return { subscribed: !!data?.endpoint, endpoint: data?.endpoint };
  } catch (err: unknown) {
    let errorMessage = "Unknown error";
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === "string") {
      errorMessage = err;
    }
    console.error("Error fetching push subscription:", errorMessage);
    return { subscribed: false };
  }
}

function getTokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000; // exp is in seconds → convert to ms
  } catch {
    return 0;
  }
}

// -------------------- BLOCK --------------------
export async function blockUser(username: string): Promise<void> {
  const res = await fetchWithAuth(`${BASE_URL}/api/block/${username}`, {
    method: "POST",
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to block user: ${errorText}`);
  }
}

export async function unblockUser(username: string): Promise<void> {
  const res = await fetchWithAuth(`${BASE_URL}/api/block/${username}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to unblock user: ${errorText}`);
  }
}

export async function getBlockStatus(username: string): Promise<boolean> {
  const res = await fetchWithAuth(`${BASE_URL}/api/block/${username}/status`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to get block status: ${errorText}`);
  }
  const data = await res.json();
  return data.blocked;
}
