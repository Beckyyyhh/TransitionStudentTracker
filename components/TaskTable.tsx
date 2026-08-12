"use client";

import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { EditTaskModal } from "./EditTaskModal";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { getTaskNotes } from "@/lib/actions";
import { Pencil, ChevronDown, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon, MessageSquare } from "lucide-react";

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

type TaskNote = { id: number; content: string; createdAt: string | Date };

function ExpandedNotes({ taskId, originalNote }: { taskId: number; originalNote: string }) {
  const [notes, setNotes] = useState<TaskNote[] | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch on first render of this component
  if (notes === null && !loading) {
    setLoading(true);
    getTaskNotes(taskId).then((fetched) => {
      setNotes(fetched.map((n) => ({ ...n, createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt })));
      setLoading(false);
    });
  }

  // Build full list: original note first (if any), then thread notes
  const allNotes: { label: string; content: string }[] = [];
  if (originalNote) allNotes.push({ label: "Original note", content: originalNote });
  if (notes) {
    notes.forEach((n) => {
      const label = new Date(n.createdAt).toLocaleString("en-AU", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
        timeZone: "Australia/Sydney",
      });
      allNotes.push({ label, content: n.content });
    });
  }

  const safeIndex = Math.min(index, Math.max(0, allNotes.length - 1));
  const current = allNotes[safeIndex];

  if (loading) {
    return <p className="text-xs text-gray-400 italic py-1">Loading notes…</p>;
  }

  if (allNotes.length === 0) {
    return <p className="text-xs text-gray-400 italic py-1">No notes yet.</p>;
  }

  return (
    <div className="flex items-start gap-2">
      {/* Prev arrow */}
      <button
        onClick={() => setIndex((i) => Math.max(0, i - 1))}
        disabled={safeIndex === 0}
        className="mt-0.5 shrink-0 p-1 rounded hover:bg-purple-100 disabled:opacity-20 disabled:cursor-default transition-colors"
        style={{ color: "#534ab7" }}
        title="Previous note"
      >
        <ChevronLeft size={14} />
      </button>

      {/* Note content */}
      <div className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "#f5f4fe", border: "1px solid #eeedfe" }}>
        <p className="text-xs text-gray-400 mb-1">
          {current.label}
          {allNotes.length > 1 && (
            <span className="ml-2 font-semibold" style={{ color: "#534ab7" }}>
              {safeIndex + 1} / {allNotes.length}
            </span>
          )}
        </p>
        <p className="text-gray-800 whitespace-pre-wrap break-words">{current.content}</p>
      </div>

      {/* Next arrow */}
      <button
        onClick={() => setIndex((i) => Math.min(allNotes.length - 1, i + 1))}
        disabled={safeIndex === allNotes.length - 1}
        className="mt-0.5 shrink-0 p-1 rounded hover:bg-purple-100 disabled:opacity-20 disabled:cursor-default transition-colors"
        style={{ color: "#534ab7" }}
        title="Next note"
      >
        <ChevronRightIcon size={14} />
      </button>
    </div>
  );
}

function TaskRow({
  task,
  showStudent,
  showUpdatedAt,
  colCount,
}: {
  task: Task;
  showStudent: boolean;
  showUpdatedAt: boolean;
  colCount: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b hover:bg-purple-50/30 transition-colors cursor-pointer"
        style={{ borderColor: "#eeedfe" }}
        onClick={() => setExpanded((v) => !v)}
      >
        {showStudent && (
          <td className="px-4 py-3 font-medium" style={{ color: "#26215c" }}>
            {task.student?.firstName} {task.student?.lastName}
          </td>
        )}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 shrink-0">
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            <span className="font-medium text-gray-800">{task.title}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-600">{task.category}</td>
        <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
        <td className="px-4 py-3 text-gray-600">{task.date}</td>
        {showUpdatedAt && (
          <td className="px-4 py-3 text-gray-500 text-xs">
            {task.updatedAt
              ? new Date(task.updatedAt).toLocaleString("en-AU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Australia/Sydney" })
              : "—"}
          </td>
        )}
        <td className="px-4 py-3 text-gray-400">
          {task.notes && (
            <MessageSquare size={14} className="inline-block opacity-60" />
          )}
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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

      {expanded && (
        <tr style={{ backgroundColor: "#faf9ff" }}>
          <td colSpan={colCount} className="px-6 py-3 border-b" style={{ borderColor: "#eeedfe" }}>
            <ExpandedNotes key={task.id} taskId={task.id} originalNote={task.notes} />
          </td>
        </tr>
      )}
    </>
  );
}

export function TaskTable({
  tasks,
  showStudent = false,
  showUpdatedAt = false,
}: {
  tasks: Task[];
  showStudent?: boolean;
  showUpdatedAt?: boolean;
}) {
  if (tasks.length === 0) {
    return <p className="text-sm text-gray-400 p-4">No tasks found.</p>;
  }

  const colCount =
    1 + // title (always)
    (showStudent ? 1 : 0) +
    1 + // category
    1 + // status
    1 + // date
    (showUpdatedAt ? 1 : 0) +
    1 + // notes icon
    1;  // actions

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
            <TaskRow
              key={task.id}
              task={task}
              showStudent={showStudent}
              showUpdatedAt={showUpdatedAt}
              colCount={colCount}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
