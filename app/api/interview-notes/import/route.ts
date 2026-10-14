import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    if (rows.length === 0) return NextResponse.json({ error: "No rows found in spreadsheet" }, { status: 400 });

    // Map columns — flexible case-insensitive matching
    function col(row: Record<string, unknown>, ...names: string[]): string {
      for (const name of names) {
        for (const key of Object.keys(row)) {
          if (key.trim().toLowerCase() === name.toLowerCase()) {
            return String(row[key] ?? "").trim();
          }
        }
      }
      return "";
    }

    const students = rows.map((row) => ({
      firstName: col(row, "First Name", "FirstName", "first_name", "firstname"),
      lastName: col(row, "Surname", "Last Name", "LastName", "last_name", "lastname"),
      studentId: col(row, "Student ID", "StudentID", "student_id", "id"),
      email: col(row, "Email", "email_address"),
    })).filter((s) => s.firstName || s.lastName);

    if (students.length === 0) {
      return NextResponse.json({ error: "No valid student rows found. Check column names: First Name, Surname, Student ID, Email" }, { status: 400 });
    }

    await prisma.interviewStudent.createMany({ data: students });

    return NextResponse.json({ count: students.length });
  } catch (err) {
    console.error("Import error", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
