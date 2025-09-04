import { NextRequest, NextResponse } from "next/server";
import { Branch } from "@/app/types/User";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trunkId = searchParams.get("trunkId");

  if (!trunkId) {
    return NextResponse.json({ error: "Missing trunkId" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE_URL}/api/branches/trunk/${trunkId}`, {
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json([], { status: res.status });
    }

    const branches: Branch[] = await res.json();
    return NextResponse.json(branches);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch branches";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");

  if (!branchId) {
    return NextResponse.json({ error: "Missing branchId" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE_URL}/api/branches/${branchId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text || "Failed to delete branch" }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete branch";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
