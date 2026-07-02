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
  weCompany?: string;
  weContactPhone?: string;
  weContactEmail?: string;
  weStartDate?: string;
  weEndDate?: string;
  weSPR?: boolean;
  weMyWorkExperience?: boolean;
  weMedicalDocs?: boolean;
  weWorkplaceVisited?: boolean;
  weSafetyGuideParent?: boolean;
  weSafetyGuideEmployer?: boolean;
};

const WE_CHECKLIST = [
  { key: "weSPR", label: "Filled out SPR" },
  { key: "weMyWorkExperience", label: "Completed 'MyWorkExperience' Module" },
  { key: "weMedicalDocs", label: "Medical documents provided to host employer (Individual Health Care Plan; Action Plan for Allergic Reactions; Anaphylaxis Plan)" },
  { key: "weWorkplaceVisited", label: "Workplace visited prior to commencement" },
  { key: "weSafetyGuideParent", label: "Provided Workplace Safety Guide — Parent" },
  { key: "weSafetyGuideEmployer", label: "Provided Workplace Safety Guide — Employer" },
] as const;

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
    weCompany: task.weCompany ?? "",
    weContactPhone: task.weContactPhone ?? "",
    weContactEmail: task.weContactEmail ?? "",
    weStartDate: task.weStartDate ?? "",
    weEndDate: task.weEndDate ?? "",
    weSPR: task.weSPR ?? false,
    weMyWorkExperience: task.weMyWorkExperience ?? false,
    weMedicalDocs: task.weMedicalDocs ?? false,
    weWorkplaceVisited: task.weWorkplaceVisited ?? false,
    weSafetyGuideParent: task.weSafetyGuideParent ?? false,
    weSafetyGuideEmployer: task.weSafetyGuideEmployer ?? false,
  });

  const isWE = form.category === "Work Experience";

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

  const inputClass = "w-full border rounded-md px-3 py-2 text-sm";
  const borderStyle = { borderColor: "#afa9ec" };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-extrabold" style={{ color: "#26215c", fontFamily: "Nunito, sans-serif" }}>
              Edit Task
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </Dialog.Close>
          </div>

          <div className="grid gap-4">
            {/* Core fields */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} style={borderStyle} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} style={borderStyle}>
                  {TASK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass} style={borderStyle}>
                  {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} style={borderStyle} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={`${inputClass} resize-none`} style={borderStyle} />
            </div>

            {/* Work Experience extra fields */}
            {isWE && (
              <>
                <hr style={{ borderColor: "#eeedfe" }} />
                <p className="text-sm font-extrabold" style={{ color: "#3d2c8d", fontFamily: "var(--font-nunito), sans-serif" }}>Work Experience Details</p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name / Type of Work</label>
                  <input value={form.weCompany} onChange={(e) => setForm({ ...form, weCompany: e.target.value })} className={inputClass} style={borderStyle} placeholder="e.g. Smith & Co — Accounting" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
                    <input value={form.weContactPhone} onChange={(e) => setForm({ ...form, weContactPhone: e.target.value })} className={inputClass} style={borderStyle} placeholder="02 9999 0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
                    <input type="email" value={form.weContactEmail} onChange={(e) => setForm({ ...form, weContactEmail: e.target.value })} className={inputClass} style={borderStyle} placeholder="contact@company.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">From Date</label>
                    <input type="date" value={form.weStartDate} onChange={(e) => setForm({ ...form, weStartDate: e.target.value })} className={inputClass} style={borderStyle} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">To Date</label>
                    <input type="date" value={form.weEndDate} onChange={(e) => setForm({ ...form, weEndDate: e.target.value })} className={inputClass} style={borderStyle} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Checklist</label>
                  <div className="space-y-2">
                    {WE_CHECKLIST.map(({ key, label }) => (
                      <label key={key} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                          className="mt-0.5 accent-purple-700"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50" style={borderStyle}>Cancel</button>
            </Dialog.Close>
            <button onClick={handleSave} disabled={loading} className="px-5 py-2 text-sm font-bold text-white rounded-md disabled:opacity-60" style={{ backgroundColor: "#3d2c8d" }}>
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
