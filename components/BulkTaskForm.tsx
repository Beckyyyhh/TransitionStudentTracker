"use client";

import { useState, useRef } from "react";
import { createTask } from "@/lib/actions";
import { TASK_CATEGORIES, TASK_STATUSES } from "@/lib/constants";
import { toast } from "sonner";

type Student = { id: number; firstName: string; lastName: string; year: number };

export function BulkTaskForm({ students }: { students: Student[] }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  function toggleStudent(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedIds(filtered.map((s) => s.id));
  }

  function clearAll() {
    setSelectedIds([]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedIds.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await Promise.all(
        selectedIds.map((studentId) => {
          const fd = new FormData();
          fd.set("studentId", String(studentId));
          fd.set("title", data.get("title") as string);
          fd.set("category", data.get("category") as string);
          fd.set("status", data.get("status") as string);
          fd.set("date", data.get("date") as string);
          fd.set("notes", data.get("notes") as string);
          return createTask(fd);
        })
      );
      toast.success(`Task added to ${selectedIds.length} student${selectedIds.length > 1 ? "s" : ""}`);
      formRef.current?.reset();
      setSelectedIds([]);
    } catch {
      toast.error("Failed to add tasks");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="p-4 space-y-5">
      {/* Task fields */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Task Title</label>
        <input
          name="title"
          required
          className="w-full border rounded-md px-3 py-2 text-sm"
          style={{ borderColor: "#afa9ec" }}
          placeholder="e.g. Attend careers expo"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
          <select name="category" required className="w-full border rounded-md px-3 py-2 text-sm" style={{ borderColor: "#afa9ec" }}>
            <option value="">Select…</option>
            {TASK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
          <select name="status" className="w-full border rounded-md px-3 py-2 text-sm" style={{ borderColor: "#afa9ec" }}>
            {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
          <input
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full border rounded-md px-3 py-2 text-sm"
            style={{ borderColor: "#afa9ec" }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
          <input name="notes" className="w-full border rounded-md px-3 py-2 text-sm" style={{ borderColor: "#afa9ec" }} placeholder="Optional…" />
        </div>
      </div>

      {/* Student selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">
            Select Students
            {selectedIds.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs text-white font-bold" style={{ backgroundColor: "#3d2c8d" }}>
                {selectedIds.length} selected
              </span>
            )}
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={selectAll} className="text-xs font-semibold" style={{ color: "#534ab7" }}>Select all</button>
            <span className="text-gray-300">|</span>
            <button type="button" onClick={clearAll} className="text-xs font-semibold text-gray-400">Clear</button>
          </div>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students…"
          className="w-full border rounded-md px-3 py-2 text-sm mb-2"
          style={{ borderColor: "#afa9ec" }}
        />

        <div className="border rounded-md overflow-y-auto max-h-56" style={{ borderColor: "#afa9ec" }}>
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 p-3">No students found.</p>
          ) : (
            filtered.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-purple-50 transition-colors border-b last:border-0"
                style={{ borderColor: "#eeedfe" }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(s.id)}
                  onChange={() => toggleStudent(s.id)}
                  className="accent-purple-700"
                />
                <span className="text-sm text-gray-800 flex-1">{s.lastName}, {s.firstName}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#534ab7" }}>
                  Yr {s.year}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <a href="/tasks" className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50" style={{ borderColor: "#afa9ec" }}>
          Cancel
        </a>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-bold text-white rounded-md disabled:opacity-60"
          style={{ backgroundColor: "#3d2c8d" }}
        >
          {loading ? "Adding…" : `Add Task${selectedIds.length > 1 ? ` to ${selectedIds.length} Students` : ""}`}
        </button>
      </div>
    </form>
  );
}
