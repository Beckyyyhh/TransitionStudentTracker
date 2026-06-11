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

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title={`${tasks.length} task${tasks.length !== 1 ? "s" : ""}${status || studentId ? " (filtered)" : ""} — most recently updated first`} />
        {tasks.length === 0 ? (
          <div className="bg-white p-12 text-center text-gray-400">No records found.</div>
        ) : (
          <div className="bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "#eeedfe" }}>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Last Updated</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b hover:bg-purple-50/30" style={{ borderColor: "#eeedfe" }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: "#3d2c8d" }}>
                      <a href={`/students/${task.studentId}`} className="hover:underline">
                        {task.student.lastName}, {task.student.firstName}
                      </a>
                      <span className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "#534ab7" }}>
                        Yr {task.student.year}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{task.title}</td>
                    <td className="px-4 py-3 text-gray-600">{task.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{task.date}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {task.updatedAt.toLocaleString("en-AU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{task.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
