"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CalendarX } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { WorkExperienceEditButton } from "@/components/WorkExperienceEditButton";

type Task = {
  id: number;
  studentId: number;
  title: string;
  status: string;
  date: string;
  notes: string;
  category: string;
  weCompany: string;
  weContactName: string;
  weContactPhone: string;
  weContactEmail: string;
  weStartDate: string;
  weEndDate: string;
  weSPR: boolean;
  weMyWorkExperience: boolean;
  weMedicalDocs: boolean;
  weWorkplaceVisited: boolean;
  weSafetyGuideParent: boolean;
  weSafetyGuideEmployer: boolean;
  past: boolean;
  student: { firstName: string; lastName: string; year: number };
};

type Group = { studentId: number; student: Task["student"]; tasks: Task[] };

export function WorkExperienceNoDatesSection({ initialTasks }: { initialTasks: Task[] }) {
  const [open, setOpen] = useState(false);
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set());
  const [tasks, setTasks] = useState(initialTasks);

  const groups: Group[] = [];
  const seen = new Set<number>();
  for (const t of tasks) {
    if (!seen.has(t.studentId)) {
      seen.add(t.studentId);
      groups.push({ studentId: t.studentId, student: t.student, tasks: tasks.filter((x) => x.studentId === t.studentId) });
    }
  }

  function toggleStudent(id: number) {
    setExpandedStudents((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleTaskSaved(taskId: number, updated: Partial<Task>) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updated } : t)));
  }

  return (
    <div className="mt-6 rounded-xl overflow-hidden" style={{ border: "1px solid #fcd34d", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 transition-colors"
        style={{ backgroundColor: "#fffbeb" }}
      >
        <span className="flex items-center gap-2 font-extrabold text-base" style={{ color: "#92400e", fontFamily: "var(--font-nunito), sans-serif" }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <CalendarX size={16} />
          No Date Set
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#fde68a", color: "#92400e" }}>{groups.length}</span>
        </span>
        <span className="text-xs font-semibold" style={{ color: "#b45309" }}>{open ? "Hide" : "View"}</span>
      </button>

      {open && (
        <div className="bg-white divide-y" style={{ borderColor: "#fef3c7" }}>
          {groups.map((group) => (
            <div key={group.studentId}>
              <div
                className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-amber-50 transition-colors"
                onClick={() => toggleStudent(group.studentId)}
              >
                <span style={{ color: "#d97706" }}>
                  {expandedStudents.has(group.studentId) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                <a
                  href={`/students/${group.studentId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-extrabold text-base hover:underline"
                  style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}
                >
                  {group.student.lastName}, {group.student.firstName}
                </a>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#534ab7" }}>
                  Yr {group.student.year}
                </span>
                <span className="text-xs text-gray-400">
                  {group.tasks.length} placement{group.tasks.length !== 1 ? "s" : ""}
                </span>
              </div>

              {expandedStudents.has(group.studentId) && (
                <div className="pb-2">
                  {group.tasks.map((task) => (
                    <div key={task.id} className="ml-8 mr-4 mb-3 rounded-lg border p-4" style={{ borderColor: "#fde68a", backgroundColor: "#fffdf0" }}>
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-800">{task.title}</span>
                          <StatusBadge status={task.status} />
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}>
                            <CalendarX size={10} /> No date
                          </span>
                        </div>
                        <WorkExperienceEditButton task={task} onSaved={(u) => handleTaskSaved(task.id, u)} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                        <div><span className="font-semibold">Company: </span>{task.weCompany || <span className="italic text-gray-400">Not entered</span>}</div>
                        <div><span className="font-semibold">Contact: </span>{task.weContactName || <span className="italic text-gray-400">Not entered</span>}</div>
                      </div>
                      {task.notes && <p className="mt-2 text-xs text-gray-400 italic">{task.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
