import { prisma } from "@/lib/db";
import { SectionHeader } from "@/components/SectionHeader";
import { InterviewNotesClient } from "./InterviewNotesClient";

export const dynamic = "force-dynamic";

export default async function InterviewNotesPage() {
  const students = await prisma.interviewStudent.findMany({
    orderBy: { lastName: "asc" },
    include: {
      notes: { orderBy: { createdAt: "desc" }, take: 1 },
      checklist: { select: { data: true } },
    },
  });

  // Serialize dates
  const serialized = students.map((s) => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    studentId: s.studentId,
    email: s.email,
    latestNote: s.notes[0]
      ? { content: s.notes[0].content, createdAt: s.notes[0].createdAt.toISOString() }
      : null,
    checklistData: (s.checklist?.data ?? {}) as Record<string, unknown>,
  }));

  return (
    <div>
      <h1
        className="text-2xl font-extrabold mb-2"
        style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}
      >
        Year 10 Interview Notes
      </h1>
      <p className="text-sm text-gray-600 mb-4 max-w-3xl">
        This service has been communicated and reinforced through year meetings every term. The service is to help students access relevant opportunities that suit their needs and interests — for example, TVET.
      </p>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}
      >
        <SectionHeader title={`${students.length} student${students.length !== 1 ? "s" : ""}`} />
        <div className="bg-white">
          <InterviewNotesClient students={serialized} />
        </div>
      </div>
    </div>
  );
}
