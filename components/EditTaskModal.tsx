"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { updateTask } from "@/lib/actions";
import { TASK_CATEGORIES, TASK_STATUSES } from "@/lib/constants";
import { toast } from "sonner";
import { X } from "lucide-react";

type Task = {
  id: number;
  title: string;
  category: string;
  status: string;
  date: string;
  notes: string;
};

export function EditTaskModal({
  task,
  trigger,
}: {
  task: Task;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: task.title,
    category: task.category,
    status: task.status,
    date: task.date,
    notes: task.notes,
  });

  async function handleSave() {
    setLoading(true);
    try {
      await updateTask(task.id, form);
      toast.success("Task updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl z-50 w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-extrabold" style={{ color: "#26215c", fontFamily: "Nunito, sans-serif" }}>
              Edit Task
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </Dialog.Close>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm"
                style={{ borderColor: "#afa9ec" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  style={{ borderColor: "#afa9ec" }}
                >
                  {TASK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  style={{ borderColor: "#afa9ec" }}
                >
                  {TASK_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm"
                style={{ borderColor: "#afa9ec" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm resize-none"
                style={{ borderColor: "#afa9ec" }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50" style={{ borderColor: "#afa9ec" }}>
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 text-sm font-bold text-white rounded-md disabled:opacity-60"
              style={{ backgroundColor: "#3d2c8d" }}
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
