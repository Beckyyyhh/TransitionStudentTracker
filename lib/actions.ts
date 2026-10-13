"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

// ── Students ─────────────────────────────────────────────────────────────────

export async function createStudent(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const year = parseInt(formData.get("year") as string);
  const referrer = formData.get("referrer") as string;
  const notes = (formData.get("notes") as string) || "";

  await prisma.student.create({
    data: { firstName, lastName, year, referrer, notes },
  });
  revalidatePath("/students");
}

export async function updateStudent(id: number, formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const year = parseInt(formData.get("year") as string);
  const referrer = formData.get("referrer") as string;
  const notes = (formData.get("notes") as string) || "";

  await prisma.student.update({
    where: { id },
    data: { firstName, lastName, year, referrer, notes },
  });
  revalidatePath(`/students/${id}`);
  revalidatePath("/students");
}

export async function createWETaskForExistingStudent(studentId: number, data: {
  title: string;
  date: string;
  weCompany: string;
  weContactName: string;
  weContactPhone: string;
  weContactEmail: string;
  weStartDate: string;
  weEndDate: string;
}) {
  await prisma.task.create({
    data: {
      studentId,
      title: data.title || "Work Experience",
      category: "Work Experience",
      status: "NOT_STARTED",
      date: data.date || new Date().toISOString().split("T")[0],
      weCompany: data.weCompany || "",
      weContactName: data.weContactName || "",
      weContactPhone: data.weContactPhone || "",
      weContactEmail: data.weContactEmail || "",
      weStartDate: data.weStartDate || "",
      weEndDate: data.weEndDate || "",
    },
  });
  // Clear any custom sort so this student appears at the top
  await prisma.$executeRaw`UPDATE "Task" SET "weSortOrder" = NULL WHERE "studentId" = ${studentId} AND category = 'Work Experience'`;
  revalidatePath("/work-experience");
  revalidatePath(`/students/${studentId}`);
}

export async function createWEStudent(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const year = parseInt(formData.get("year") as string);
  const referrer = (formData.get("referrer") as string) || "Self-referred";

  const student = await prisma.student.create({
    data: { firstName, lastName, year, referrer, weOnly: true },
  });

  // Create initial WE task
  await prisma.task.create({
    data: {
      studentId: student.id,
      title: (formData.get("title") as string) || "Work Experience",
      category: "Work Experience",
      status: "NOT_STARTED",
      date: (formData.get("date") as string) || new Date().toISOString().split("T")[0],
      weCompany: (formData.get("weCompany") as string) || "",
      weContactName: (formData.get("weContactName") as string) || "",
      weContactPhone: (formData.get("weContactPhone") as string) || "",
      weContactEmail: (formData.get("weContactEmail") as string) || "",
      weStartDate: (formData.get("weStartDate") as string) || "",
      weEndDate: (formData.get("weEndDate") as string) || "",
    },
  });

  revalidatePath("/work-experience");
  return student.id;
}

export async function toggleAtRisk(id: number, atRisk: boolean) {
  await prisma.student.update({ where: { id }, data: { atRisk } });
  revalidatePath(`/students/${id}`);
  revalidatePath("/students");
}

export async function toggleStudentInactive(id: number, inactive: boolean) {
  await prisma.student.update({ where: { id }, data: { inactive } });
  revalidatePath(`/students/${id}`);
  revalidatePath("/students");
}

export async function setYearGroupInactive(year: number) {
  await prisma.student.updateMany({ where: { year, weOnly: false }, data: { inactive: true } });
  revalidatePath("/students");
}

export async function deleteStudent(id: number) {
  await prisma.student.delete({ where: { id } });
  revalidatePath("/students");
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function createTask(formData: FormData) {
  const studentId = parseInt(formData.get("studentId") as string);
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const status = (formData.get("status") as string) || "NOT_STARTED";
  const date = formData.get("date") as string;
  const notes = (formData.get("notes") as string) || "";

  await prisma.task.create({
    data: { studentId, title, category, status, date, notes },
  });
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/tasks");
  revalidatePath("/history");
  revalidatePath("/dashboard");
}

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled / Postponed",
};

function fmtVal(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  // yyyy-mm-dd → dd-mm-yyyy
  if (typeof v === "string") {
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  }
  return String(v);
}

function buildChangeSummary(before: Record<string, unknown>, after: Record<string, unknown>): string {
  const FIELD_LABELS: Record<string, string> = {
    title: "Title",
    status: "Status",
    date: "Date",
    notes: "Notes",
    weCompany: "Company",
    weContactName: "Contact Name",
    weContactPhone: "Contact Phone",
    weContactEmail: "Contact Email",
    weStartDate: "Start Date",
    weEndDate: "End Date",
    weSPR: "SPR filled out",
    weMyWorkExperience: "MyWorkExperience Module",
    weMedicalDocs: "Medical Docs",
    weWorkplaceVisited: "Workplace Visited",
    weSafetyGuideParent: "Safety Guide (Parent)",
    weSafetyGuideEmployer: "Safety Guide (Employer)",
  };

  const lines: string[] = [];
  for (const key of Object.keys(after)) {
    if (!(key in before)) continue;
    const oldVal = before[key];
    const newVal = after[key];
    if (oldVal === newVal) continue;
    const label = FIELD_LABELS[key] ?? key;
    if (key === "status") {
      lines.push(`${label}: ${STATUS_LABELS[String(oldVal)] ?? oldVal} → ${STATUS_LABELS[String(newVal)] ?? newVal}`);
    } else if (typeof newVal === "boolean") {
      lines.push(`${label}: ${fmtVal(newVal)}`);
    } else {
      lines.push(`${label}: ${fmtVal(oldVal)} → ${fmtVal(newVal)}`);
    }
  }
  return lines.join("\n");
}

export async function updateTask(
  id: number,
  data: {
    title?: string;
    category?: string;
    status?: string;
    date?: string;
    notes?: string;
    weCompany?: string;
    weContactName?: string;
    weContactPhone?: string;
    weContactEmail?: string;
    weStartDate?: string;
    weEndDate?: string;
    weSPR?: boolean;
    weMyWorkExperience?: boolean;
    weMedicalDocs?: boolean;
    weWorkplaceVisited?: boolean;
    weSafetyGuideParent?: boolean;
    weSafetyGuideEmployer?: boolean;
  }
) {
  // Fetch current values before updating so we can diff them
  const before = await prisma.task.findUnique({ where: { id } });
  const task = await prisma.task.update({ where: { id }, data });

  // Auto-generate a change note
  if (before) {
    const summary = buildChangeSummary(
      before as unknown as Record<string, unknown>,
      data as Record<string, unknown>
    );
    if (summary) {
      await prisma.taskNote.create({ data: { taskId: id, content: `🔄 Updated:\n${summary}` } });
    }
  }

  // If this is a WE task, clear the sort order for this student's group so
  // the updated student automatically floats to the top of the WE page.
  if (task.category === "Work Experience") {
    await prisma.$executeRaw`UPDATE "Task" SET "weSortOrder" = NULL WHERE "studentId" = ${task.studentId} AND category = 'Work Experience'`;
  }

  revalidatePath(`/students/${task.studentId}`);
  revalidatePath("/tasks");
  revalidatePath("/history");
  revalidatePath("/dashboard");
  revalidatePath("/work-experience");
}

export async function getWorkExperienceCompanies() {
  const employers = await prisma.wEEmployer.findMany({ orderBy: { company: "asc" } });
  return employers.map((e) => ({
    weCompany: e.company,
    weContactName: e.contactName,
    weContactPhone: e.contactPhone,
    weContactEmail: e.contactEmail,
  }));
}

export async function getEmployers() {
  return prisma.wEEmployer.findMany({ orderBy: { company: "asc" } });
}

export async function createEmployer(data: { company: string; contactName: string; contactPhone: string; contactEmail: string; address: string }) {
  await prisma.wEEmployer.create({ data });
  revalidatePath("/work-experience/employers");
}

export async function updateEmployer(id: number, data: { company: string; contactName: string; contactPhone: string; contactEmail: string; address: string }) {
  await prisma.wEEmployer.update({ where: { id }, data });
  revalidatePath("/work-experience/employers");
}

export async function deleteEmployer(id: number) {
  await prisma.wEEmployer.delete({ where: { id } });
  revalidatePath("/work-experience/employers");
}

export async function updateWorkExperienceGroupOrder(orderedStudentIds: number[]) {
  // Fetch all WE tasks ordered by updatedAt within each student
  const tasks = await prisma.task.findMany({
    where: { category: "Work Experience" },
    select: { id: true, studentId: true },
    orderBy: { updatedAt: "desc" },
  });
  const updates: { id: number; order: number }[] = [];
  for (let si = 0; si < orderedStudentIds.length; si++) {
    const studentTasks = tasks.filter((t) => t.studentId === orderedStudentIds[si]);
    studentTasks.forEach((t, ti) => updates.push({ id: t.id, order: si * 100 + ti }));
  }
  // Use raw SQL so updatedAt is not bumped (reordering shouldn't appear in History)
  await Promise.all(
    updates.map((u) => prisma.$executeRaw`UPDATE "Task" SET "weSortOrder" = ${u.order} WHERE id = ${u.id}`)
  );
  revalidatePath("/work-experience");
}

export async function resetWorkExperienceOrder() {
  await prisma.task.updateMany({
    where: { category: "Work Experience" },
    data: { weSortOrder: null },
  });
  revalidatePath("/work-experience");
}

export async function addTaskNote(taskId: number, content: string) {
  await prisma.taskNote.create({ data: { taskId, content } });
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (task) {
    revalidatePath(`/students/${task.studentId}`);
    revalidatePath("/tasks");
    revalidatePath("/history");
  }
}

export async function getTaskNotes(taskId: number) {
  return prisma.taskNote.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getTaskAttachments(taskId: number) {
  return prisma.taskAttachment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
  });
}

export async function deleteTaskAttachment(id: number) {
  const attachment = await prisma.taskAttachment.findUnique({ where: { id } });
  if (!attachment) return;
  // Delete from Vercel Blob
  const { del } = await import("@vercel/blob");
  await del(attachment.url);
  await prisma.taskAttachment.delete({ where: { id } });
}

export async function deleteTask(id: number) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return;
  await prisma.task.delete({ where: { id } });
  revalidatePath(`/students/${task.studentId}`);
  revalidatePath("/tasks");
  revalidatePath("/history");
  revalidatePath("/dashboard");
}
