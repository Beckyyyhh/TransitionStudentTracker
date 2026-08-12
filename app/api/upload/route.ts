import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "Missing taskId" }, { status: 400 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF and Word documents are allowed" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 });
  }

  let blob;
  try {
    blob = await put(`task-attachments/${taskId}/${file.name}`, file, { access: "private" });
  } catch (err) {
    console.error("Blob upload error:", err);
    return NextResponse.json({ error: `Storage error: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
  }

  let attachment;
  try {
    attachment = await prisma.taskAttachment.create({
      data: {
        taskId: parseInt(taskId),
        name: file.name,
        url: blob.url,
        size: file.size,
        mimeType: file.type,
      },
    });
  } catch (err) {
    console.error("DB insert error:", err);
    return NextResponse.json({ error: `Database error: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
  }

  return NextResponse.json(attachment);
}
