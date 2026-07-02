import { prisma } from "@/lib/db";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { WorkExperienceEditButton } from "@/components/WorkExperienceEditButton";

export const dynamic = "force-dynamic";

const CHECKLIST = [
  { key: "weSPR", label: "SPR filled out" },
  { key: "weMyWorkExperience", label: "MyWorkExperience Module" },
  { key: "weMedicalDocs", label: "Medical docs provided" },
  { key: "weWorkplaceVisited", label: "Workplace visited prior" },
  { key: "weSafetyGuideParent", label: "Safety Guide — Parent" },
  { key: "weSafetyGuideEmployer", label: "Safety Guide — Employer" },
] as const;

export default async function WorkExperiencePage() {
  const tasks = await prisma.task.findMany({
    where: { category: "Work Experience" },
    include: { student: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-4" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
        Work Experience
      </h1>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title={`${tasks.length} student${tasks.length !== 1 ? "s" : ""} — most recently updated first`} />

        {tasks.length === 0 ? (
          <div className="bg-white p-12 text-center text-gray-400">
            No work experience tasks yet. Add a task with category "Work Experience" from a student's profile.
          </div>
        ) : (
          <div className="bg-white divide-y" style={{ borderColor: "#eeedfe" }}>
            {tasks.map((task) => (
              <div key={task.id} className="p-5">
                {/* Student header */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <a href={`/students/${task.studentId}`} className="font-extrabold text-base hover:underline" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
                      {task.student.lastName}, {task.student.firstName}
                    </a>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#534ab7" }}>
                      Yr {task.student.year}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>
                  <WorkExperienceEditButton task={task} />
                </div>

                {/* Company & dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Company / Work Type</p>
                    <p className="text-sm text-gray-800">{task.weCompany || <span className="text-gray-400 italic">Not entered</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Dates</p>
                    <p className="text-sm text-gray-800">
                      {task.weStartDate && task.weEndDate
                        ? `${task.weStartDate} → ${task.weEndDate}`
                        : <span className="text-gray-400 italic">Not entered</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Contact</p>
                    <p className="text-sm text-gray-800">{task.weContactPhone || "—"}</p>
                    <p className="text-sm text-gray-800">{task.weContactEmail || ""}</p>
                  </div>
                </div>

                {/* Checklist */}
                <div className="flex flex-wrap gap-2">
                  {CHECKLIST.map(({ key, label }) => {
                    const checked = task[key] as boolean;
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                        style={checked
                          ? { backgroundColor: "#dcfce7", color: "#166534" }
                          : { backgroundColor: "#f3f4f6", color: "#6b7280" }}
                      >
                        <span>{checked ? "✓" : "✗"}</span>
                        {label}
                      </span>
                    );
                  })}
                </div>

                {task.notes && (
                  <p className="mt-2 text-xs text-gray-500 italic">{task.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
