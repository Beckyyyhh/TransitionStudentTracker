"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function addInterviewStudentToWE(interviewStudentId: number): Promise<{ ok: boolean; message: string }> {
  const is = await prisma.interviewStudent.findUnique({ where: { id: interviewStudentId } });
  if (!is) return { ok: false, message: "Interview student not found." };

  // Match by first + last name (case-insensitive)
  const student = await prisma.student.findFirst({
    where: {
      firstName: { equals: is.firstName, mode: "insensitive" },
      lastName: { equals: is.lastName, mode: "insensitive" },
    },
  });
  if (!student) return { ok: false, message: `No student named "${is.firstName} ${is.lastName}" found in the main student list. Add them there first.` };

  // Avoid duplicates
  const existing = await prisma.task.findFirst({
    where: { studentId: student.id, category: "Work Experience" },
  });
  if (existing) return { ok: true, message: `${is.firstName} ${is.lastName} is already on the Work Experience tab.` };

  await prisma.task.create({
    data: {
      studentId: student.id,
      title: "Work Experience",
      category: "Work Experience",
      status: "NOT_STARTED",
      date: new Date().toISOString().split("T")[0],
      weCompany: "",
      weContactName: "",
      weContactPhone: "",
      weContactEmail: "",
      weStartDate: "",
      weEndDate: "",
    },
  });
  await prisma.$executeRaw`UPDATE "Task" SET "weSortOrder" = NULL WHERE "studentId" = ${student.id} AND category = 'Work Experience'`;
  revalidatePath("/work-experience");
  return { ok: true, message: `${is.firstName} ${is.lastName} added to the Work Experience tab.` };
}

export async function getInterviewStudents() {
  return prisma.interviewStudent.findMany({
    orderBy: { lastName: "asc" },
    include: {
      notes: { orderBy: { createdAt: "desc" }, take: 1 },
      checklist: true,
    },
  });
}

export async function getInterviewStudent(id: number) {
  return prisma.interviewStudent.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "asc" } },
      checklist: true,
    },
  });
}

export async function importInterviewStudents(
  students: { firstName: string; lastName: string; studentId: string; email: string }[]
) {
  await prisma.interviewStudent.createMany({ data: students });
  revalidatePath("/interview-notes");
}

export async function clearAllInterviewStudents() {
  await prisma.interviewStudent.deleteMany({});
  revalidatePath("/interview-notes");
}

export async function addInterviewNote(interviewStudentId: number, content: string, isFollowUp = false) {
  const note = await prisma.interviewNote.create({ data: { interviewStudentId, content, isFollowUp } });
  revalidatePath(`/interview-notes/${interviewStudentId}`);
  return note;
}

export async function saveInterviewChecklist(interviewStudentId: number, data: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonData = data as any;
  await prisma.interviewChecklist.upsert({
    where: { interviewStudentId },
    create: { interviewStudentId, data: jsonData },
    update: { data: jsonData },
  });
  revalidatePath(`/interview-notes/${interviewStudentId}`);
  revalidatePath("/interview-notes");
}

export async function deleteInterviewNote(id: number, interviewStudentId: number) {
  await prisma.interviewNote.delete({ where: { id } });
  revalidatePath(`/interview-notes/${interviewStudentId}`);
}
