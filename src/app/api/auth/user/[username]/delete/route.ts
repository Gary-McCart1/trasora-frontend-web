// src/app/api/auth/user/[username]/delete/route.ts
import { NextResponse } from "next/server";

const BASE_URL =
  process.env.BACKEND_URL || "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function DELETE(req: Request, { params }: { params: { username: string } }) {
  const username = params.username;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/user/${username}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to delete user");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete user:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
