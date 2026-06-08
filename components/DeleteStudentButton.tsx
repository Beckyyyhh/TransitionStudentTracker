"use client";

import { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { deleteStudent } from "@/lib/actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function DeleteStudentButton({ studentId }: { studentId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteStudent(studentId);
      toast.success("Student deleted");
      window.location.href = "/students";
    } catch {
      toast.error("Failed to delete student");
      setLoading(false);
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
        >
          <Trash2 size={14} />
          Delete Student
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl z-50 w-full max-w-sm p-6">
          <AlertDialog.Title className="text-base font-extrabold mb-2" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
            Delete this student?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-gray-500 mb-5">
            This will permanently delete the student and all their tasks. This cannot be undone.
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
