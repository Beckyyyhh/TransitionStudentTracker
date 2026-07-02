import { StatusBadge } from "./StatusBadge";
import { EditTaskModal } from "./EditTaskModal";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { Pencil } from "lucide-react";

type Task = {
  id: number;
  title: string;
  category: string;
  status: string;
  date: string;
  notes: string;
  updatedAt?: string | Date;
  student?: { firstName: string; lastName: string };
  weCompany?: string;
  weContactPhone?: string;
  weContactEmail?: string;
  weStartDate?: string;
  weEndDate?: string;
  weSPR?: boolean;
  weMyWorkExperience?: boolean;
  weMedicalDocs?: boolean;
  weWorkplaceVisited?: boolean;
  weSafetyGuideParent?: boolean;
  weSafetyGuideEmployer?: boolean;
};

export function TaskTable({ tasks, showStudent = false, showUpdatedAt = false }: { tasks: Task[]; showStudent?: boolean; showUpdatedAt?: boolean }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-gray-400 p-4">No tasks found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "#eeedfe" }}>
            {showStudent && <th className="px-4 py-3 text-left font-semibold text-gray-600">Student</th>}
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
            {showUpdatedAt && <th className="px-4 py-3 text-left font-semibold text-gray-600">Last Updated</th>}
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Notes</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b hover:bg-purple-50/30 transition-colors" style={{ borderColor: "#eeedfe" }}>
              {showStudent && (
                <td className="px-4 py-3 font-medium" style={{ color: "#26215c" }}>
                  {task.student?.firstName} {task.student?.lastName}
                </td>
              )}
              <td className="px-4 py-3 font-medium text-gray-800">{task.title}</td>
              <td className="px-4 py-3 text-gray-600">{task.category}</td>
              <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
              <td className="px-4 py-3 text-gray-600">{task.date}</td>
              {showUpdatedAt && (
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {task.updatedAt ? new Date(task.updatedAt).toLocaleString("en-AU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                </td>
              )}
              <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{task.notes}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <EditTaskModal
                    task={task}
                    trigger={
                      <button className="p-1 transition-colors" style={{ color: "#534ab7" }} title="Edit task">
                        <Pencil size={16} />
                      </button>
                    }
                  />
                  <DeleteTaskButton taskId={task.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
