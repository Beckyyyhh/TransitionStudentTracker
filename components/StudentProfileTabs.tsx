"use client";

import { useState } from "react";
import { TaskTable } from "./TaskTable";
import { TaskForm } from "./TaskForm";
import { SectionHeader } from "./SectionHeader";

type Task = {
  id: number;
  title: string;
  category: string;
  status: string;
  date: string;
  notes: string;
};

export function StudentProfileTabs({
  activeTasks,
  historyTasks,
  studentId,
}: {
  activeTasks: Task[];
  historyTasks: Task[];
  studentId: number;
}) {
  const [tab, setTab] = useState<"active" | "history" | "add">("active");

  function tabClass(t: string) {
    return `px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${
      tab === t
        ? "border-purple-800 text-purple-800"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
      <div className="bg-white border-b flex" style={{ borderColor: "#eeedfe" }}>
        <button className={tabClass("active")} onClick={() => setTab("active")}>
          Active Tasks ({activeTasks.length})
        </button>
        <button className={tabClass("history")} onClick={() => setTab("history")}>
          Completed ({historyTasks.length})
        </button>
        <button className={tabClass("add")} onClick={() => setTab("add")}>
          + Add Task
        </button>
      </div>

      {tab === "active" && (
        <div className="bg-white">
          <TaskTable tasks={activeTasks} />
        </div>
      )}

      {tab === "history" && (
        <div className="bg-white">
          <TaskTable tasks={historyTasks} />
        </div>
      )}

      {tab === "add" && (
        <div className="bg-white">
          <SectionHeader title="Add New Task" />
          <TaskForm studentId={studentId} />
        </div>
      )}
    </div>
  );
}
