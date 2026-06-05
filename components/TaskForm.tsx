"use client";

import { useRef, useState } from "react";
import { createTask } from "@/lib/actions";
import { TASK_CATEGORIES, TASK_STATUSES } from "@/lib/constants";
import { toast } from "sonner";

export function TaskForm({ studentId }: { studentId: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createTask(formData);
      formRef.current?.reset();
      toast.success("Task added successfully");
    } catch {
      toast.error("Failed to add task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <input type="hidden" name="studentId" value={studentId} />

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Task Title</label>
        <input
          name="title"
          required
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#afa9ec" }}
          placeholder="e.g. Update resume with work experience"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
        <select
          name="category"
          required
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#afa9ec" }}
        >
          <option value="">Select category…</option>
          {TASK_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
        <select
          name="status"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#afa9ec" }}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
        <input
          name="date"
          type="date"
          required
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#afa9ec" }}
          defaultValue={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
        <input
          name="notes"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#afa9ec" }}
          placeholder="Optional notes…"
        />
      </div>

      <div className="md:col-span-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-bold text-white rounded-md transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "#3d2c8d" }}
        >
          {loading ? "Saving…" : "Add Task"}
        </button>
      </div>
    </form>
  );
}
