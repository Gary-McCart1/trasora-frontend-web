// app/api/stories/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import { StoryDto } from "@/app/types/Story";

const BASE_URL = "https://trasora-backend-e03193d24a86.herokuapp.com";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/api/stories/active`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch stories");

    const stories: StoryDto[] = await res.json();
    return NextResponse.json(stories);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const storyJson = formData.get("story") as string;

    const storyPayload = JSON.parse(storyJson);

    const backendForm = new FormData();

    if (file) {
      backendForm.append("file", file);
    }

    backendForm.append("story", new Blob([JSON.stringify(storyPayload)], { type: "application/json" }));

    const res = await fetch(`${BASE_URL}/api/stories/create`, {
      method: "POST",
      credentials: "include",
      body: backendForm,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to upload story");
    }

    const story: StoryDto = await res.json();
    return NextResponse.json(story);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload story";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
