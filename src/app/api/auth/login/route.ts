import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function POST(req: NextRequest) {
  try {
    const { login, password } = await req.json();

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

    // fetch the user after login
    const userRes = await fetch(`${BASE_URL}/api/auth/me`, { credentials: "include" });
    if (!userRes.ok) throw new Error("Failed to fetch user data");

    const user: User = await userRes.json();
    return NextResponse.json(user);
  } catch (err) {
    console.error("Login failed:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
