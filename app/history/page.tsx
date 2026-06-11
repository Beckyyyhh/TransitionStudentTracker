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

  const [students, studentGroups] = await Promise.all([
    prisma.student.findMany({ orderBy: { lastName: "asc" } }),
    prisma.student.findMany({
      where: {
        tasks: { some: {} },
        ...(studentId ? { id: parseInt(studentId) } : {}),
      },
      include: {
        tasks: {
          where: { ...(status ? { status } : {}) },
          orderBy: { updatedAt: "desc" },
        },
      },
    }),
  ]);

  // Remove students whose tasks were all filtered out by the status filter
  const filtered = studentGroups.filter((s) => s.tasks.length > 0);

  // Sort students by their most recently updated task
  filtered.sort(
    (a, b) =>
      new Date(b.tasks[0].updatedAt).getTime() -
      new Date(a.tasks[0].updatedAt).getTime()
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

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400" style={{ border: "1px solid #afa9ec" }}>
          No records found.
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
              <SectionHeader title={`${s.lastName}, ${s.firstName} — Year ${s.year}`} />
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
                    {s.tasks.map((task) => (
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
