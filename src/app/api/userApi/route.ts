// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/types/User";
import { NotificationDto } from "@/app/types/NotificationDto";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

// GET requests
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const username = searchParams.get("username");

  try {
    if (action === "currentUser") {
      const res = await fetch(`${BASE_URL}/api/auth/me`, { credentials: "include" });
      if (!res.ok) return NextResponse.json(null);
      const user: User = await res.json();
      return NextResponse.json(user);
    }

    if (action === "getUser" && username) {
      const res = await fetch(`${BASE_URL}/api/auth/user/${username}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user");
      const user: User = await res.json();
      return NextResponse.json(user);
    }

    if (action === "unreadNotifications") {
      const res = await fetch(`${BASE_URL}/api/notifications/unread`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch unread notifications");
      const data: NotificationDto[] = await res.json();
      return NextResponse.json(data.length);
    }

    return NextResponse.json({ error: "Invalid GET action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "GET request failed";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST requests
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    // Login
    if (type === "login") {
      const { login, password } = body;
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
      const userRes = await fetch(`${BASE_URL}/api/auth/me`, { credentials: "include" });
      if (!userRes.ok) throw new Error("Failed to fetch user data");
      const user: User = await userRes.json();
      return NextResponse.json(user);
    }

    // Signup
    if (type === "signup") {
      const form = body.form;
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Signup failed");
      }
      return NextResponse.json({ success: true });
    }

    // Forgot password
    if (type === "forgotPassword") {
      const { email } = body;
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to send reset link");
      }
      return NextResponse.json({ success: true });
    }

    // Reset password
    if (type === "resetPassword") {
      const { token, newPassword } = body;
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to reset password");
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid POST type" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "POST request failed";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT requests
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const username = searchParams.get("username");

    if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

    // Update profile visibility
    if (action === "updateProfileVisibility" && username) {
      const profilePublic = searchParams.get("profilePublic") === "true";
      const res = await fetch(`${BASE_URL}/api/auth/${username}/profile-visibility?profilePublic=${profilePublic}`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile visibility");
      return NextResponse.json(await res.json());
    }

    // Disconnect Spotify
    if (action === "disconnectSpotify" && username) {
      const res = await fetch(`${BASE_URL}/api/auth/user/${username}/disconnect-spotify`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Failed to disconnect Spotify");
      }
      return NextResponse.json(await res.json());
    }

    // Update referredBy
    if (action === "updateReferredBy" && username) {
      const referredByUsername = searchParams.get("referredByUsername") || "";
      const res = await fetch(`${BASE_URL}/api/auth/user/${username}/referred-by?referredByUsername=${encodeURIComponent(referredByUsername)}`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to update referredBy");
      }
      return NextResponse.json(await res.json());
    }

    return NextResponse.json({ error: "Invalid PUT action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PUT request failed";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE requests
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

    const res = await fetch(`${BASE_URL}/api/auth/user/${username}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete user");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "DELETE request failed";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
