import { NextRequest, NextResponse } from "next/server";
import { Trunk } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { trunkId: string } }
) {
  try {
    const { title } = await req.json();

    const res = await fetch(`${BASE_URL}/api/trunks/${params.trunkId}/title`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error(await res.text());
    const updated: Trunk = await res.json();
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PATCH request failed" },
      { status: 500 }
    );
  }
}
