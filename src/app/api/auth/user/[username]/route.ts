import { NextResponse } from "next/server";
import { User } from "@/app/types/User";

const BASE_URL = process.env.BACKEND_URL || "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET(_: Request, { params }: { params: { username: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/user/${params.username}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch user");

    const user: User = await res.json();
    return NextResponse.json(user);
  } catch (err) {
    console.error("Failed to fetch user:", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
