import { prisma } from "@/lib/db";
import { SectionHeader } from "@/components/SectionHeader";
import { DashboardCharts } from "@/components/DashboardCharts";
import { TASK_CATEGORIES, YEAR_GROUPS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [students, tasks] = await Promise.all([
    prisma.student.findMany({ include: { tasks: true } }),
    prisma.task.findMany(),
  ]);

  const totalStudents = students.length;
  const totalTasks = tasks.length;
  const notStarted = tasks.filter((t) => t.status === "NOT_STARTED").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;

  const byYear = YEAR_GROUPS.map((y) => ({
    year: `Year ${y}`,
    count: students.filter((s) => s.year === y).length,
  }));

  const byCategory = TASK_CATEGORIES.map((cat) => ({
    category: cat,
    count: tasks.filter((t) => t.category === cat).length,
  })).filter((d) => d.count > 0);

  const statCards = [
    { label: "Total Students", value: totalStudents, color: "#3d2c8d" },
    { label: "Total Tasks", value: totalTasks, color: "#534ab7" },
    { label: "Not Started", value: notStarted, color: "#9ca3af" },
    { label: "In Progress", value: inProgress, color: "#d97706" },
    { label: "Completed", value: completed, color: "#16a34a" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title="Overview" />
        <div className="bg-white p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg p-4 text-center"
              style={{ backgroundColor: "#eeedfe", border: "1px solid #afa9ec" }}
            >
              <div className="text-3xl font-extrabold mb-1" style={{ color: card.color, fontFamily: "var(--font-nunito), sans-serif" }}>
                {card.value}
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Year breakdown */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title="Students by Year Group" />
        <div className="bg-white p-4 flex gap-4 flex-wrap">
          {byYear.map(({ year, count }) => (
            <div key={year} className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">{year}:</span>
              <span className="text-sm font-extrabold" style={{ color: "#3d2c8d" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts byCategory={byCategory} />
    </div>
  );
}
