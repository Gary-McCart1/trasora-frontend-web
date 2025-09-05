import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/${params.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to delete root");

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete root";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
