"use client";

import { useState, useMemo } from "react";
import { WorkExperienceList } from "@/components/WorkExperienceList";
import { WorkExperiencePastSection } from "@/components/WorkExperiencePastSection";
import { WorkExperienceNoDatesSection } from "@/components/WorkExperienceNoDatesSection";
import { SectionHeader } from "@/components/SectionHeader";

export type WETask = {
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
  studentInactive: boolean;
  student: { firstName: string; lastName: string; year: number };
};

function isPast(weEndDate: string, status: string): boolean {
  if (status === "COMPLETED") return true;
  if (!weEndDate) return false;
  const end = new Date(weEndDate);
  if (isNaN(end.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return end < today;
}

function splitTasks(tasks: WETask[]) {
  const recomputed = tasks.map((t) => ({ ...t, past: isPast(t.weEndDate, t.status) }));
  const allStudentIds = [...new Set(recomputed.map((t) => t.studentId))];

  const isPastStudent = (sid: number) => {
    const studentTasks = recomputed.filter((t) => t.studentId === sid);
    // Inactive student → past
    if (studentTasks[0]?.studentInactive) return true;
    // Only one placement and it's completed or cancelled → past
    if (studentTasks.length === 1 && (studentTasks[0].status === "COMPLETED" || studentTasks[0].status === "CANCELLED")) return true;
    // All placements are past (end date passed or completed) → past
    return studentTasks.every((t) => t.past);
  };

  const isNoDatesStudent = (sid: number) => {
    if (isPastStudent(sid)) return false;
    return recomputed.filter((t) => t.studentId === sid).every((t) => !t.weStartDate);
  };

  const pastStudentIds = new Set(allStudentIds.filter(isPastStudent));
  const noDatStudentIds = new Set(allStudentIds.filter(isNoDatesStudent));

  return {
    activeTasks: recomputed.filter((t) => !noDatStudentIds.has(t.studentId) && !pastStudentIds.has(t.studentId)),
    noDatTasks: recomputed.filter((t) => noDatStudentIds.has(t.studentId)),
    pastTasks: recomputed.filter((t) => pastStudentIds.has(t.studentId)),
    uniqueStudentIds: allStudentIds,
  };
}

export function WorkExperiencePageClient({
  initialTasks,
  isCustomOrdered,
}: {
  initialTasks: WETask[];
  isCustomOrdered: boolean;
}) {
  const [tasks, setTasks] = useState(initialTasks);

  function handleTaskSaved(taskId: number, updated: Partial<WETask>) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updated } : t)));
  }

  const { activeTasks, noDatTasks, pastTasks, uniqueStudentIds } = useMemo(
    () => splitTasks(tasks),
    [tasks]
  );

  return (
    <>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title={`${uniqueStudentIds.length} student${uniqueStudentIds.length !== 1 ? "s" : ""}`} />
        {tasks.length === 0 ? (
          <div className="bg-white p-12 text-center text-gray-400">
            No work experience tasks yet. Add a task with category "Work Experience" from a student&apos;s profile.
          </div>
        ) : (
          <WorkExperienceList
            initialTasks={activeTasks}
            isCustomOrdered={isCustomOrdered}
            onTaskSaved={handleTaskSaved}
          />
        )}
      </div>

      {noDatTasks.length > 0 && (
        <WorkExperienceNoDatesSection initialTasks={noDatTasks} onTaskSaved={handleTaskSaved} />
      )}

      {pastTasks.length > 0 && (
        <WorkExperiencePastSection initialTasks={pastTasks} onTaskSaved={handleTaskSaved} />
      )}
    </>
  );
}
