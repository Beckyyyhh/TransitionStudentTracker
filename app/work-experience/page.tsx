import { prisma } from "@/lib/db";
import { SectionHeader } from "@/components/SectionHeader";
import { WorkExperienceList } from "@/components/WorkExperienceList";

export const dynamic = "force-dynamic";

export default async function WorkExperiencePage() {
  const tasks = await prisma.task.findMany({
    where: { category: "Work Experience" },
    include: { student: true },
    orderBy: [
      { weSortOrder: { sort: "asc", nulls: "last" } },
      { updatedAt: "desc" },
    ],
  });

  const isCustomOrdered = tasks.some((t) => t.weSortOrder !== null);

  const serialized = tasks.map((t) => ({
    id: t.id,
    studentId: t.studentId,
    title: t.title,
    status: t.status,
    date: t.date,
    notes: t.notes,
    category: t.category,
    weCompany: t.weCompany,
    weContactName: t.weContactName,
    weContactPhone: t.weContactPhone,
    weContactEmail: t.weContactEmail,
    weStartDate: t.weStartDate,
    weEndDate: t.weEndDate,
    weSPR: t.weSPR,
    weMyWorkExperience: t.weMyWorkExperience,
    weMedicalDocs: t.weMedicalDocs,
    weWorkplaceVisited: t.weWorkplaceVisited,
    weSafetyGuideParent: t.weSafetyGuideParent,
    weSafetyGuideEmployer: t.weSafetyGuideEmployer,
    student: {
      firstName: t.student.firstName,
      lastName: t.student.lastName,
      year: t.student.year,
    },
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
          Work Experience
        </h1>
        <div className="flex gap-2">
          <a
            href="/work-experience/employers"
            className="px-4 py-2 text-sm font-semibold border rounded-md"
            style={{ color: "#534ab7", borderColor: "#afa9ec" }}
          >
            Employer Bank
          </a>
          <a
            href="/work-experience/new"
            className="px-4 py-2 text-sm font-bold text-white rounded-md"
            style={{ backgroundColor: "#3d2c8d" }}
          >
            + Add WE Student
          </a>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title={`${tasks.length} student${tasks.length !== 1 ? "s" : ""}`} />

        {tasks.length === 0 ? (
          <div className="bg-white p-12 text-center text-gray-400">
            No work experience tasks yet. Add a task with category "Work Experience" from a student's profile.
          </div>
        ) : (
          <WorkExperienceList initialTasks={serialized} isCustomOrdered={isCustomOrdered} />
        )}
      </div>
    </div>
  );
}
