import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const attachment = await prisma.taskAttachment.findUnique({ where: { id: parseInt(id) } });
  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const res = await fetch(attachment.url, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });

  if (!res.ok) return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `inline; filename="${attachment.name}"`,
    },
  });
}
