// src/app/api/branches/trunk/[trunkId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Branch } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET(req: NextRequest, { params }: { params: { trunkId: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/branches/trunk/${params.trunkId}`, {
      credentials: "include",
    });

    if (!res.ok) return NextResponse.json([], { status: res.status });

    const branches: Branch[] = await res.json();
    return NextResponse.json(branches);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch branches";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
