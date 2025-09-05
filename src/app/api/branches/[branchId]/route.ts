// src/app/api/branches/[branchId]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function DELETE(req: NextRequest, { params }: { params: { branchId: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/api/branches/${params.branchId}`, {
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
