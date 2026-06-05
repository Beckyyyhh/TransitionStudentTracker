"use client";

import { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { deleteTask } from "@/lib/actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function DeleteTaskButton({ taskId }: { taskId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
      setOpen(false);
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button className="text-red-400 hover:text-red-600 transition-colors p-1" title="Delete task">
          <Trash2 size={16} />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl z-50 w-full max-w-sm p-6">
          <AlertDialog.Title className="text-base font-extrabold mb-2" style={{ color: "#26215c", fontFamily: "Nunito, sans-serif" }}>
            Delete this task?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-gray-500 mb-5">
            This action cannot be undone.
          </AlertDialog.Description>
          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50" style={{ borderColor: "#afa9ec" }}>
                Cancel
              </button>
            </AlertDialog.Cancel>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-md disabled:opacity-60"
            >
              {loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
