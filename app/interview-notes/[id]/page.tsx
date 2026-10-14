import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { InterviewStudentClient } from "./InterviewStudentClient";

export const dynamic = "force-dynamic";

export default async function InterviewStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await prisma.interviewStudent.findUnique({
    where: { id: parseInt(id) },
    include: {
      notes: { orderBy: { createdAt: "asc" } },
      checklist: true,
    },
  });

  if (!student) notFound();

  const serialized = {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    studentId: student.studentId,
    email: student.email,
    notes: student.notes.map((n) => ({
      id: n.id,
      content: n.content,
      isFollowUp: n.isFollowUp,
      createdAt: n.createdAt.toISOString(),
    })),
    checklistData: (student.checklist?.data ?? {}) as Record<string, unknown>,
  };

  return <InterviewStudentClient student={serialized} />;
}
