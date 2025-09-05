import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_URL || "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function POST(req: NextRequest) {
  try {
    const { form } = await req.json();

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
  } catch (err) {
    console.error("Signup failed:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
