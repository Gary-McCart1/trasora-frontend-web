import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function PUT(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const profilePublic = searchParams.get("profilePublic") === "true";

    const res = await fetch(
      `${BASE_URL}/api/auth/${params.username}/profile-visibility?profilePublic=${profilePublic}`,
      { method: "PUT", credentials: "include" }
    );

    if (!res.ok) throw new Error("Failed to update profile visibility");
    return NextResponse.json(await res.json());
  } catch (err) {
    console.error("Failed to update profile visibility:", err);
    return NextResponse.json({ error: "Failed to update profile visibility" }, { status: 500 });
  }
}
