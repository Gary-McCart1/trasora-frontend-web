import { NextResponse } from "next/server";
import { User } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, { credentials: "include" });
    if (!res.ok) return NextResponse.json(null);

    const user: User = await res.json();
    return NextResponse.json(user);
  } catch (err) {
    console.error("Failed to fetch current user:", err);
    return NextResponse.json({ error: "Failed to fetch current user" }, { status: 500 });
  }
}
