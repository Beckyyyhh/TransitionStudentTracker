import { getEmployers } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { NewWEStudentForm } from "@/components/NewWEStudentForm";

export const dynamic = "force-dynamic";

export default async function NewWEStudentPage() {
  const [employers, students] = await Promise.all([
    getEmployers(),
    prisma.student.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
  ]);
  const serializedStudents = students.map((s) => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    year: s.year,
  }));
  return <NewWEStudentForm employers={employers} existingStudents={serializedStudents} />;
}
