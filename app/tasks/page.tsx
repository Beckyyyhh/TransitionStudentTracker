import { prisma } from "@/lib/db";
import { SectionHeader } from "@/components/SectionHeader";
import { TaskTable } from "@/components/TaskTable";
import { TasksFilters } from "@/components/TasksFilters";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string; status?: string; category?: string }>;
}) {
  const { studentId, status, category } = await searchParams;

  const [tasks, students] = await Promise.all([
    prisma.task.findMany({
      where: {
        ...(studentId ? { studentId: parseInt(studentId) } : {}),
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
      },
      include: { student: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.student.findMany({ orderBy: { lastName: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-4" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
        All Tasks
      </h1>

      <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title="Filter Tasks" />
        <div className="bg-white p-4">
          <TasksFilters
            students={students}
            currentStudentId={studentId}
            currentStatus={status}
            currentCategory={category}
          />
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title={`Tasks — ${tasks.length} record${tasks.length !== 1 ? "s" : ""}`} />
        <div className="bg-white">
          <TaskTable tasks={tasks} showStudent />
        </div>
      </div>
    </div>
  );
}
