import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_URL || "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

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
  } catch (err) {
    console.error("Forgot password failed:", err);
    return NextResponse.json({ error: "Forgot password failed" }, { status: 500 });
  }
}
