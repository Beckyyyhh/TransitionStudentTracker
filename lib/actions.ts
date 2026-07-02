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

export async function deleteTask(id: number) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return;
  await prisma.task.delete({ where: { id } });
  revalidatePath(`/students/${task.studentId}`);
  revalidatePath("/tasks");
  revalidatePath("/history");
  revalidatePath("/dashboard");
}
