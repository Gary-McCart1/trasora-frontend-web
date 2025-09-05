import { User } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Helper function to get the JWT token from local storage
const getAuthHeaders = () => {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// -------------------- AUTHENTICATION --------------------

// Get current authenticated user
export async function getCurrentUser(): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) {
      // If unauthorized, clear the token and throw error
      localStorage.removeItem("token");
    }
    throw new Error("Failed to fetch current user");
  }
  return res.json();
}

// Login
export async function loginUser(login: string, password: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
  if (!res.ok) throw new Error("Login failed");

  // Get token from response and save to localStorage
  const data = await res.json();
  const token = data.token;
  localStorage.setItem("token", token);

  return data.user;
}

// Logout
export async function logoutUser(): Promise<void> {
  localStorage.removeItem("token");
  await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
}

// Signup
export async function signupUser(data: { email: string; username: string; password: string }): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

// -------------------- USERS --------------------

// Get user by username
export async function getUser(username: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/user/${username}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/api/auth/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// Delete user
export async function deleteUser(username: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/user/${username}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

// Update profile visibility
export async function updateProfileVisibility(username: string, isPublic: boolean): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/user/${username}/profile-visibility?profilePublic=${isPublic}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to update profile visibility");
  return res.json();
}

// Update user profile
export async function updateUserProfile(username: string, updates: Partial<User> & { profilePic?: File }): Promise<User> {
  const formData = new FormData();
  if (updates.bio) formData.append("bio", updates.bio);
  if (updates.accentColor) formData.append("accentColor", updates.accentColor);
  if (updates.profilePic) formData.append("profilePic", updates.profilePic);

  const res = await fetch(`${BASE_URL}/api/auth/user`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

// -------------------- SEARCH --------------------

// Search users
export async function searchUsers(query: string): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/api/auth/search-bar?q=${encodeURIComponent(query)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to search users");
  const data = await res.json();
  return data.users;
}

// -------------------- PASSWORD --------------------

// Forgot password
export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to request password reset");
}

// Reset password
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) throw new Error("Failed to reset password");
}

// -------------------- EMAIL --------------------

// Verify email
export async function verifyEmail(token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/verify-email?token=${token}`);
  if (!res.ok) throw new Error("Failed to verify email");
}

// Resend verification email
export async function resendVerificationEmail(email: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to resend verification email");
}

// -------------------- SPOTIFY --------------------

// Disconnect Spotify
export async function disconnectSpotify(username: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/user/${username}/disconnect-spotify`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to disconnect Spotify");
}

// Update referredBy
export async function updateReferredBy(username: string, referredBy: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/user/${username}/referred-by?referredByUsername=${encodeURIComponent(referredBy)}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to update referredBy");
  return res.json();
}

// -------------------- PROFILE PICTURE --------------------

// Fetch profile picture
export async function fetchProfilePicture(userId: number): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/users/${userId}/profile-picture`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch profile picture");
  return res.text();
}