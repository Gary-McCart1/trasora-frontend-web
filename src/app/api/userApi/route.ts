import { NotificationDto } from "@/app/types/NotificationDto";
import { User } from "@/app/types/User";

const BASE_URL = "http://localhost:8080";

export async function getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        credentials: "include",
      });
  
      if (!res.ok) return null;
      return res.json();
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      return null;
    }
  }

export async function getUser(username: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/user/${username}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function loginUser(login: string, password: string): Promise<User> {
  // Login request
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ login, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Login failed");
  }

  // Fetch logged-in user data
  const userRes = await fetch(`${BASE_URL}/api/auth/me`, { credentials: "include" });
  if (!userRes.ok) throw new Error("Failed to fetch user data");

  return userRes.json();
}

export async function logoutUser() {
  return fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function deleteUser(username: string) {
  return fetch(`${BASE_URL}/api/auth/user/${username}`, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function updateProfileVisibility(
  username: string,
  profilePublic: boolean
) {
  const res = await fetch(
    `${BASE_URL}/api/auth/${username}/profile-visibility?profilePublic=${profilePublic}`,
    { method: "PUT", credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to update profile visibility");
  return res.json();
}

export const getUnreadNotificationsCount = async (): Promise<number> => {
  try {
    const res = await fetch(`${BASE_URL}/api/notifications/unread`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch unread notifications");
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export async function updateUserProfile(formData: FormData): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/user`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function getAllUsers(): Promise<{ length: number }[]> {
  const res = await fetch(`${BASE_URL}/api/auth/users`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function searchUsers(query: string): Promise<User[]> {
    if (!query.trim()) return [];
  
    const res = await fetch(`${BASE_URL}/api/auth/search-bar?q=${encodeURIComponent(query)}`, {
      credentials: "include",
    });
  
    if (!res.ok) throw new Error("User search failed");
    const data = await res.json();
  
    // Map to User type with string id
    return (data.users || []).slice(0, 5).map((u: User, idx: number) => ({
      id: String(u.id ?? idx),
      username: u.username,
      profilePictureUrl: u.profilePictureUrl ?? null,
    }));
  }

  export async function signupUser(form: {
    fullName: string;
    email: string;
    username: string;
    password: string;
  }): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    });
  
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Signup failed");
    }
  }

  export async function forgotPassword(email: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to send reset link");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      throw err;
    }
  }

  export async function resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
  
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      throw err;
    }
  }
  
  
  export async function fetchUnreadNotifications(): Promise<NotificationDto[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications/unread`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
  
      const data: NotificationDto[] = await res.json();
  
      const dataWithPics = await Promise.all(
        data.map(async (n) => ({
          ...n,
          senderProfilePictureUrl: await fetchProfilePicture(n.senderUsername),
        }))
      );
  
      dataWithPics.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  
      // Mark all as read except follow requests
      await fetch(`${BASE_URL}/api/notifications/read-all-except-follow`, {
        method: "POST",
        credentials: "include",
      });
  
      return dataWithPics;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      return [];
    }
  }
  
  export async function handleFollowNotification(
    followId: number,
    action: "accept" | "reject"
  ) {
    try {
      const res = await fetch(`${BASE_URL}/api/follow/${followId}/${action}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to ${action} follow request`);
      }
    } catch (err) {
      console.error(`Error on follow ${action}:`, err);
      throw err;
    }
  }
  
  // Helper to fetch profile pictures for notifications
  async function fetchProfilePicture(username: string): Promise<string> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/user/${username}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      return data.profilePictureUrl || "";
    } catch (err) {
      console.error(err);
      return "";
    }
  }

  // Verify email with token
export async function verifyEmail(token: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-email?token=${token}`);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Verification failed.");
      }
    } catch (err) {
      console.error("Verify email error:", err);
      throw err;
    }
  }
  
  // Resend verification email
  export async function resendVerificationEmail(email: string): Promise<void> {
    if (!email) throw new Error("Email is required.");
  
    try {
      const res = await fetch(`${BASE_URL}/api/auth/resend-verification?email=${encodeURIComponent(email)}`, {
        method: "POST",
      });
  
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to resend verification email.");
      }
    } catch (err) {
      console.error("Resend verification error:", err);
      throw err;
    }
  }
  
  export async function disconnectSpotify(username: string) {
    const res = await fetch(`${BASE_URL}/api/auth/user/${username}/disconnect-spotify`, {
      method: "PUT",
      credentials: "include",
    });
  
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data?.message || "Failed to disconnect Spotify");
    }
  
    return res.json();
  }

  export async function updateReferredBy(username: string, referredByUsername: string): Promise<User> {
    const res = await fetch(
      `${BASE_URL}/api/auth/user/${username}/referred-by?referredByUsername=${encodeURIComponent(referredByUsername)}`,
      {
        method: "PUT",
        credentials: "include",
      }
    );
  
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || "Failed to update referredBy");
    }
  
    return res.json();
  }
  
  