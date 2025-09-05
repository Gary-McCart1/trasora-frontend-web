// src/lib/usersApi.ts
import { User } from "@/app/types/User";


const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// Get current authenticated user
export async function getCurrentUser(): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/me`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch current user");
  return res.json();
}

// Get user by username
export async function getUser(username: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/user/${username}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

// Login
export async function loginUser(login: string, password: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
    credentials: "include"
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

// Logout
export async function logoutUser(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Logout failed");
}

// Delete user
export async function deleteUser(username: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/users/${username}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

// Update profile visibility
export async function updateProfileVisibility(username: string, isPublic: boolean): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/users/${username}/visibility`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isPublic }),
  });
  if (!res.ok) throw new Error("Failed to update profile visibility");
  return res.json();
}


// Update user profile
export async function updateUserProfile(username: string, updates: Partial<User>): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/users/${username}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/api/auth/users`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// Search users
export async function searchUsers(query: string): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/api/auth/users/search?q=${encodeURIComponent(query)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to search users");
  return res.json();
}

// Signup
export async function signupUser(data: { email: string; username: string; password: string }): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include"
  });
  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

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


// Fetch profile picture
export async function fetchProfilePicture(userId: number): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/users/${userId}/profile-picture`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch profile picture");
  return res.text();
}

// Verify email
export async function verifyEmail(token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
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

// Disconnect Spotify
export async function disconnectSpotify(username: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/user/${username}/disconnect-spotify`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to disconnect Spotify");
}

// Update referredBy
export async function updateReferredBy(username: string, referredBy: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/users/${username}/referred-by`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ referredBy }),
  });
  if (!res.ok) throw new Error("Failed to update referredBy");
  return res.json();
}
