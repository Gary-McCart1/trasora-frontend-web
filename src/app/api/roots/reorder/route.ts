import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function PATCH(req: NextRequest) {
  try {
    const ids: number[] = await req.json();

    const res = await fetch(`${BASE_URL}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(ids),
    });

    if (!res.ok) throw new Error("Failed to reorder roots");

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reorder roots";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}