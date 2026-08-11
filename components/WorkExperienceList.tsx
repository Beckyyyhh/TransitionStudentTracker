"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StatusBadge } from "@/components/StatusBadge";
import { WorkExperienceEditButton } from "@/components/WorkExperienceEditButton";
import { updateWorkExperienceGroupOrder, resetWorkExperienceOrder } from "@/lib/actions";
import { GripVertical, RotateCcw, ChevronDown, ChevronRight } from "lucide-react";

const CHECKLIST = [
  { key: "weSPR", label: "SPR filled out" },
  { key: "weMyWorkExperience", label: "MyWorkExperience Module" },
  { key: "weMedicalDocs", label: "Medical docs provided" },
  { key: "weWorkplaceVisited", label: "Workplace visited prior" },
  { key: "weSafetyGuideParent", label: "Safety Guide — Parent" },
  { key: "weSafetyGuideEmployer", label: "Safety Guide — Employer" },
] as const;

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
  student: { firstName: string; lastName: string; year: number };
};

type Group = { studentId: number; student: Task["student"]; tasks: Task[] };

function TaskCard({ task, onTaskSaved }: { task: Task; onTaskSaved: (updated: Partial<Task>) => void }) {
  return (
    <div className="ml-8 mr-4 mb-3 rounded-lg border p-4" style={{ borderColor: "#eeedfe", backgroundColor: "#faf9ff" }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-800">{task.title}</span>
          <StatusBadge status={task.status} />
        </div>
        <WorkExperienceEditButton task={task} onSaved={onTaskSaved} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Company / Work Type</p>
          <p className="text-sm text-gray-800">{task.weCompany || <span className="text-gray-400 italic">Not entered</span>}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Dates</p>
          <p className="text-sm text-gray-800">
            {task.weStartDate && task.weEndDate
              ? `${task.weStartDate} → ${task.weEndDate}`
              : <span className="text-gray-400 italic">Not entered</span>}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Contact</p>
          {task.weContactName && <p className="text-sm font-medium text-gray-800">{task.weContactName}</p>}
          <p className="text-sm text-gray-800">{task.weContactPhone || "—"}</p>
          <p className="text-sm text-gray-800">{task.weContactEmail || ""}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CHECKLIST.map(({ key, label }) => {
          const checked = task[key] as boolean;
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
              style={checked
                ? { backgroundColor: "#dcfce7", color: "#166534" }
                : { backgroundColor: "#f3f4f6", color: "#6b7280" }}
            >
              <span>{checked ? "✓" : "✗"}</span>
              {label}
            </span>
          );
        })}
      </div>

      {task.notes && <p className="mt-2 text-xs text-gray-500 italic">{task.notes}</p>}
    </div>
  );
}

function SortableGroup({
  group,
  expanded,
  onToggle,
  onTaskSaved,
}: {
  group: Group;
  expanded: boolean;
  onToggle: () => void;
  onTaskSaved: (taskId: number, updated: Partial<Task>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.studentId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const completedCount = group.tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div ref={setNodeRef} style={{ ...style, borderColor: "#eeedfe" }} className="border-b last:border-0">
      {/* Group header */}
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-purple-50/40 transition-colors"
        onClick={onToggle}
      >
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
          title="Drag to reorder"
        >
          <GripVertical size={18} />
        </button>

        <span className="text-gray-400 shrink-0">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>

        <a
          href={`/students/${group.studentId}`}
          onClick={(e) => e.stopPropagation()}
          className="font-extrabold text-base hover:underline shrink-0"
          style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}
        >
          {group.student.lastName}, {group.student.firstName}
        </a>

        <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: "#534ab7" }}>
          Yr {group.student.year}
        </span>

        <span className="text-xs text-gray-500 ml-1">
          {group.tasks.length} placement{group.tasks.length !== 1 ? "s" : ""}
          {completedCount > 0 && ` · ${completedCount} completed`}
        </span>
      </div>

      {/* Expanded tasks */}
      {expanded && (
        <div className="pb-2">
          {group.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onTaskSaved={(updated) => onTaskSaved(task.id, updated)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkExperienceList({ initialTasks, isCustomOrdered }: { initialTasks: Task[]; isCustomOrdered: boolean }) {
  // Group by student, preserving server sort order
  const buildGroups = (tasks: Task[]): Group[] => {
    const map = new Map<number, Group>();
    for (const task of tasks) {
      if (!map.has(task.studentId)) {
        map.set(task.studentId, { studentId: task.studentId, student: task.student, tasks: [] });
      }
      map.get(task.studentId)!.tasks.push(task);
    }
    return Array.from(map.values());
  };

  const [groups, setGroups] = useState(() => buildGroups(initialTasks));
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [customOrdered, setCustomOrdered] = useState(isCustomOrdered);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function toggleExpand(studentId: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = groups.findIndex((g) => g.studentId === active.id);
    const newIndex = groups.findIndex((g) => g.studentId === over.id);
    const reordered = arrayMove(groups, oldIndex, newIndex);
    setGroups(reordered);
    setCustomOrdered(true);
    setSaving(true);
    await updateWorkExperienceGroupOrder(reordered.map((g) => g.studentId));
    setSaving(false);
  }

  function handleTaskSaved(taskId: number, updated: Partial<Task>) {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, ...updated } : t)),
      }))
    );
  }

  async function handleReset() {
    setSaving(true);
    await resetWorkExperienceOrder();
    setSaving(false);
    setCustomOrdered(false);
    window.location.reload();
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b bg-purple-50/50" style={{ borderColor: "#eeedfe" }}>
        <p className="text-xs text-gray-500">
          {customOrdered ? "Custom order — drag to rearrange" : "Sorted by most recently updated · drag to rearrange"}
        </p>
        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-gray-400">Saving…</span>}
          {customOrdered && (
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-1 text-xs font-semibold disabled:opacity-50"
              style={{ color: "#534ab7" }}
            >
              <RotateCcw size={12} />
              Reset to default order
            </button>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={groups.map((g) => g.studentId)} strategy={verticalListSortingStrategy}>
          <div className="bg-white">
            {groups.map((group) => (
              <SortableGroup
                key={group.studentId}
                group={group}
                expanded={expanded.has(group.studentId)}
                onToggle={() => toggleExpand(group.studentId)}
                onTaskSaved={handleTaskSaved}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
