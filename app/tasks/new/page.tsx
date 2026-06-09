import { prisma } from "@/lib/db";
import { SectionHeader } from "@/components/SectionHeader";
import { BulkTaskForm } from "@/components/BulkTaskForm";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const students = await prisma.student.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <a href="/tasks" className="text-sm" style={{ color: "#534ab7" }}>← Tasks</a>
      </div>
      <h1 className="text-2xl font-extrabold mb-4" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
        Add Task to Multiple Students
      </h1>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title="Task Details" />
        <div className="bg-white">
          <BulkTaskForm students={students} />
        </div>
      </div>
    </div>
  );
}
