import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StudentProfileTabs } from "@/components/StudentProfileTabs";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const student = await prisma.student.findUnique({
    where: { id },
    include: { tasks: { orderBy: { createdAt: "desc" } } },
  });

  if (!student) notFound();

  const activeTasks = student.tasks.filter((t) => t.status !== "COMPLETED");
  const historyTasks = student.tasks.filter((t) => t.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <a href="/students" className="text-sm" style={{ color: "#534ab7" }}>← Students</a>
      </div>

      {/* Banner */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <div className="p-6 text-white" style={{ background: "linear-gradient(135deg, #3d2c8d 0%, #534ab7 100%)" }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                {student.firstName} {student.lastName}
              </h1>
              <div className="flex items-center gap-3 text-purple-200 text-sm flex-wrap">
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-white font-semibold">Year {student.year}</span>
                <span>{student.referrer}</span>
              </div>
              {student.notes && (
                <p className="mt-3 text-purple-100 text-sm max-w-xl">{student.notes}</p>
              )}
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-3xl font-extrabold">{student.tasks.length}</div>
                <div className="text-purple-200 text-xs">Total Tasks</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold">{activeTasks.length}</div>
                <div className="text-purple-200 text-xs">Active</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold">{historyTasks.length}</div>
                <div className="text-purple-200 text-xs">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed task view */}
      <StudentProfileTabs
        activeTasks={activeTasks}
        historyTasks={historyTasks}
        studentId={student.id}
      />
    </div>
  );
}
