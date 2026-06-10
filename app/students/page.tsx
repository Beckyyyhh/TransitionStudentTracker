import { prisma } from "@/lib/db";
import { StudentsClientPage } from "@/components/StudentsClientPage";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    include: { tasks: true },
    orderBy: [{ year: "asc" }, { lastName: "asc" }],
  });

  const data = students.map((s) => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    year: s.year,
    referrer: s.referrer,
    taskCount: s.tasks.length,
  }));

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
      <StudentsClientPage students={data} />
    </div>
  );
}
