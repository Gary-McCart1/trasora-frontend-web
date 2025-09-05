import { NextResponse } from "next/server";
import { NotificationDto } from "@/app/types/NotificationDto";

const BASE_URL = process.env.BACKEND_URL || "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/api/notifications/unread`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch unread notifications");

    const data: NotificationDto[] = await res.json();
    return NextResponse.json(data.length);
  } catch (err) {
    console.error("Failed to fetch unread notifications:", err);
    return NextResponse.json({ error: "Failed to fetch unread notifications" }, { status: 500 });
  }
}
