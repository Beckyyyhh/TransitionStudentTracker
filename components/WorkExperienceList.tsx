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
import { updateWorkExperienceOrder, resetWorkExperienceOrder } from "@/lib/actions";
import { GripVertical, RotateCcw } from "lucide-react";

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

function SortableRow({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-5 border-b last:border-0" {...attributes}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            {...listeners}
            className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
            title="Drag to reorder"
          >
            <GripVertical size={18} />
          </button>
          <a href={`/students/${task.studentId}`} className="font-extrabold text-base hover:underline" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
            {task.student.lastName}, {task.student.firstName}
          </a>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#534ab7" }}>
            Yr {task.student.year}
          </span>
          <StatusBadge status={task.status} />
        </div>
        <WorkExperienceEditButton task={task} />
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

export function WorkExperienceList({ initialTasks, isCustomOrdered }: { initialTasks: Task[]; isCustomOrdered: boolean }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [saving, setSaving] = useState(false);
  const [customOrdered, setCustomOrdered] = useState(isCustomOrdered);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    setTasks(reordered);
    setCustomOrdered(true);
    setSaving(true);
    await updateWorkExperienceOrder(reordered.map((t) => t.id));
    setSaving(false);
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
        {saving && <span className="text-xs text-gray-400">Saving…</span>}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="bg-white divide-y" style={{ borderColor: "#eeedfe" }}>
            {tasks.map((task) => (
              <SortableRow key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
