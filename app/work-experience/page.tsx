import { prisma } from "@/lib/db";
import { WorkExperiencePageClient } from "@/components/WorkExperiencePageClient";

export const dynamic = "force-dynamic";

export default async function WorkExperiencePage() {
  const allTasks = await prisma.task.findMany({
    where: { category: "Work Experience" },
    include: { student: true },
    orderBy: { updatedAt: "desc" },
  });

  const isCustomOrdered = allTasks.some((t) => t.weSortOrder !== null);

  const tasks = isCustomOrdered
    ? [...allTasks].sort((a, b) => {
        if (a.weSortOrder !== null && b.weSortOrder !== null) return a.weSortOrder - b.weSortOrder;
        if (a.weSortOrder !== null) return -1;
        if (b.weSortOrder !== null) return 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      })
    : allTasks;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function isPast(weEndDate: string, status: string) {
    if (status === "COMPLETED") return true;
    if (!weEndDate) return false;
    const end = new Date(weEndDate);
    if (isNaN(end.getTime())) return false;
    end.setHours(0, 0, 0, 0);
    return end < today;
  }

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
    past: isPast(t.weEndDate, t.status),
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

      <WorkExperiencePageClient initialTasks={serialized} isCustomOrdered={isCustomOrdered} />
    </div>
  );
}
