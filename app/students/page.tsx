import { prisma } from "@/lib/db";
import { StudentCard } from "@/components/StudentCard";
import { SectionHeader } from "@/components/SectionHeader";
import { StudentsFilters } from "@/components/StudentsFilters";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; year?: string }>;
}) {
  const { q, year } = await searchParams;

  const students = await prisma.student.findMany({
    include: { tasks: true },
    orderBy: [{ year: "asc" }, { lastName: "asc" }],
    where: {
      ...(year ? { year: parseInt(year) } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { referrer: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
  });

  const grouped = !year && !q
    ? students.reduce<Record<number, typeof students>>((acc, s) => {
        (acc[s.year] ??= []).push(s);
        return acc;
      }, {})
    : null;

  const StudentGrid = ({ list }: { list: typeof students }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {list.map((s) => (
        <StudentCard
          key={s.id}
          id={s.id}
          firstName={s.firstName}
          lastName={s.lastName}
          year={s.year}
          referrer={s.referrer}
          taskCount={s.tasks.length}
        />
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
          Students
        </h1>
        <a
          href="/students/new"
          className="px-4 py-2 text-sm font-bold text-white rounded-md"
          style={{ backgroundColor: "#3d2c8d" }}
        >
          + New Student
        </a>
      </div>

      <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title="Filter Students" />
        <div className="bg-white p-4">
          <StudentsFilters currentYear={year} currentQ={q} />
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400" style={{ border: "1px solid #afa9ec" }}>
          No students found. <a href="/students/new" style={{ color: "#3d2c8d" }} className="underline">Add the first one.</a>
        </div>
      ) : grouped ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([yr, list]) => (
            <div key={yr}>
              <h2 className="text-lg font-extrabold mb-3" style={{ color: "#3d2c8d", fontFamily: "var(--font-nunito), sans-serif" }}>
                Year {yr} <span className="text-sm font-semibold text-gray-400">— {list.length} student{list.length !== 1 ? "s" : ""}</span>
              </h2>
              <StudentGrid list={list} />
            </div>
          ))}
        </div>
      ) : (
        <StudentGrid list={students} />
      )}
    </div>
  );
}
