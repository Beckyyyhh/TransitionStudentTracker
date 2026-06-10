import { prisma } from "@/lib/db";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { TasksFilters } from "@/components/TasksFilters";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string; status?: string }>;
}) {
  const { studentId, status } = await searchParams;

  const [students, tasks] = await Promise.all([
    prisma.student.findMany({ orderBy: { lastName: "asc" } }),
    prisma.task.findMany({
      where: {
        ...(studentId ? { studentId: parseInt(studentId) } : {}),
        ...(status ? { status } : {}),
      },
      include: { student: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  // Group by student, preserving updatedAt desc order within each group
  const grouped = new Map<number, { student: { firstName: string; lastName: string; year: number }; tasks: typeof tasks; latestUpdatedAt: Date }>();
  for (const task of tasks) {
    if (!grouped.has(task.studentId)) {
      grouped.set(task.studentId, { student: task.student, tasks: [], latestUpdatedAt: task.updatedAt });
    }
    grouped.get(task.studentId)!.tasks.push(task);
  }

  // Sort student groups by most recently updated task
  const sortedGroups = Array.from(grouped.values()).sort(
    (a, b) => b.latestUpdatedAt.getTime() - a.latestUpdatedAt.getTime()
  );

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-4" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
        Task History
      </h1>

      <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title="Filter History" />
        <div className="bg-white p-4">
          <TasksFilters students={students} currentStudentId={studentId} currentStatus={status} />
        </div>
      </div>

      {grouped.size === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400" style={{ border: "1px solid #afa9ec" }}>
          No records found.
        </div>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map(({ student, tasks: studentTasks }) => (
            <div key={studentTasks[0].studentId} className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
              <SectionHeader title={`${student.lastName}, ${student.firstName} — Year ${student.year}`} />
              <div className="bg-white overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "#eeedfe" }}>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentTasks.map((task) => (
                      <tr key={task.id} className="border-b hover:bg-purple-50/30" style={{ borderColor: "#eeedfe" }}>
                        <td className="px-4 py-3 font-medium text-gray-800">{task.title}</td>
                        <td className="px-4 py-3 text-gray-600">{task.category}</td>
                        <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                        <td className="px-4 py-3 text-gray-600">{task.date}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{task.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
