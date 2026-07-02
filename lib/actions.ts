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

export async function updateTask(
  id: number,
  data: {
    title?: string;
    category?: string;
    status?: string;
    date?: string;
    notes?: string;
    weCompany?: string;
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
  const task = await prisma.task.update({ where: { id }, data });
  revalidatePath(`/students/${task.studentId}`);
  revalidatePath("/tasks");
  revalidatePath("/history");
  revalidatePath("/dashboard");
}

export async function getWorkExperienceCompanies() {
  const tasks = await prisma.task.findMany({
    where: { category: "Work Experience", NOT: { weCompany: "" } },
    select: { weCompany: true, weContactPhone: true, weContactEmail: true },
    orderBy: { updatedAt: "desc" },
  });
  // Deduplicate by company name, keeping most recent contact info
  const seen = new Map<string, { weCompany: string; weContactPhone: string; weContactEmail: string }>();
  for (const t of tasks) {
    if (t.weCompany && !seen.has(t.weCompany)) {
      seen.set(t.weCompany, { weCompany: t.weCompany, weContactPhone: t.weContactPhone, weContactEmail: t.weContactEmail });
    }
  }
  return Array.from(seen.values());
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
  await Promise.all(updates.map((u) => prisma.task.update({ where: { id: u.id }, data: { weSortOrder: u.order } })));
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

export async function deleteTask(id: number) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return;
  await prisma.task.delete({ where: { id } });
  revalidatePath(`/students/${task.studentId}`);
  revalidatePath("/tasks");
  revalidatePath("/history");
  revalidatePath("/dashboard");
}
