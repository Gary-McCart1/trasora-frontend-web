import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_URL || "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const referredByUsername = searchParams.get("referredByUsername") || "";

    const res = await fetch(
      `${BASE_URL}/api/auth/user/${username}/referred-by?referredByUsername=${encodeURIComponent(
        referredByUsername
      )}`,
      { method: "PUT", credentials: "include" }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || "Failed to update referredBy");
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    console.error("Failed to update referredBy:", err);
    return NextResponse.json({ error: "Failed to update referredBy" }, { status: 500 });
  }
}