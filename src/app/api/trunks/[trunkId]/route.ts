import { NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function DELETE(
  req: Request,
  { params }: { params: { trunkId: string } }
) {
  try {
    const res = await fetch(`${BASE_URL}/api/trunks/${params.trunkId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete trunk");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "DELETE request failed" },
      { status: 500 }
    );
  }
}
