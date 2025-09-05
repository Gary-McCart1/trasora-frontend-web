import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_URL || "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

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
  } catch (err) {
    console.error("Reset password failed:", err);
    return NextResponse.json({ error: "Reset password failed" }, { status: 500 });
  }
}
