"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

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
  await prisma.interviewNote.create({ data: { interviewStudentId, content, isFollowUp } });
  revalidatePath(`/interview-notes/${interviewStudentId}`);
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
}

export async function deleteInterviewNote(id: number, interviewStudentId: number) {
  await prisma.interviewNote.delete({ where: { id } });
  revalidatePath(`/interview-notes/${interviewStudentId}`);
}
