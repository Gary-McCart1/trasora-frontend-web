import { NextRequest, NextResponse } from "next/server";
import { Trunk, newTrunk } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

// GET available trunks
export async function GET() {
  try {
    const trunks = await apiFetch<Trunk[]>(`${BASE_URL}/api/trunks/available/trunks`);
    return NextResponse.json(trunks);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch trunks" },
      { status: 500 }
    );
  }
}

// POST create trunk
export async function POST(req: NextRequest) {
  try {
    const { newTrunk, username } = (await req.json()) as {
      newTrunk: newTrunk;
      username: string;
    };

    const created = await apiFetch<Trunk>(`${BASE_URL}/api/trunks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTrunk.name,
        description: newTrunk.description,
        publicFlag: newTrunk.isPublic,
        username,
      }),
    });

    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create trunk" },
      { status: 500 }
    );
  }
}
