import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/db";

const PATHWAY_LABELS: Record<string, string> = {
  university: "University",
  tafe: "TAFE/VET",
  apprenticeship: "Apprenticeship",
  sbat: "SBAT",
  gapYear: "Gap Year",
  employment: "Employment",
  other: "Other",
};

function derivePathwayInterest(data: Record<string, unknown>): string {
  const awareness = (data.pathwayAwareness ?? {}) as Record<string, string>;
  return Object.entries(awareness)
    .filter(([, v]) => v === "Interested" || v === "Researched")
    .map(([k]) => PATHWAY_LABELS[k] ?? k)
    .join(", ") || "—";
}

function deriveFollowUp(data: Record<string, unknown>): string {
  const outcomes = (data.outcomes ?? {}) as Record<string, unknown>;
  return outcomes.followUpRequired ? "Yes" : "No";
}

export async function GET() {
  const students = await prisma.interviewStudent.findMany({
    orderBy: { lastName: "asc" },
    include: {
      notes: { orderBy: { createdAt: "desc" }, take: 1 },
      checklist: { select: { data: true } },
    },
  });

  const rows = students.map((s) => {
    const data = (s.checklist?.data ?? {}) as Record<string, unknown>;
    const outcomes = (data.outcomes ?? {}) as Record<string, unknown>;
    return {
      "First Name": s.firstName,
      "Surname": s.lastName,
      "Student ID": s.studentId,
      "Email": s.email,
      "Latest Note": s.notes[0]?.content ?? "",
      "Pathway Interest": derivePathwayInterest(data),
      "Follow-up": deriveFollowUp(data),
      "Follow-up Date": String(outcomes.followUpDate ?? ""),
      "Priority": String(outcomes.priority ?? ""),
      "Status": String(outcomes.status ?? ""),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Yr10 Interview Notes");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="yr10-interview-notes-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
