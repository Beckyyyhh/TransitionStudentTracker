"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { updateTask, addTaskNote, getTaskNotes, getWorkExperienceCompanies } from "@/lib/actions";
import { TASK_CATEGORIES, TASK_STATUSES } from "@/lib/constants";
import { toast } from "sonner";
import { X, Send } from "lucide-react";

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

type TaskNote = { id: number; content: string; createdAt: Date | string };

const WE_CHECKLIST = [
  { key: "weSPR", label: "Filled out SPR" },
  { key: "weMyWorkExperience", label: "Completed 'MyWorkExperience' Module" },
  { key: "weMedicalDocs", label: "Medical documents provided to host employer (Individual Health Care Plan; Action Plan for Allergic Reactions; Anaphylaxis Plan)" },
  { key: "weWorkplaceVisited", label: "Workplace visited prior to commencement" },
  { key: "weSafetyGuideParent", label: "Provided Workplace Safety Guide — Parent" },
  { key: "weSafetyGuideEmployer", label: "Provided Workplace Safety Guide — Employer" },
] as const;

export function EditTaskModal({ task, trigger }: { task: Task; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<TaskNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [companies, setCompanies] = useState<{ weCompany: string; weContactPhone: string; weContactEmail: string }[]>([]);

  const [form, setForm] = useState({
    title: task.title,
    category: task.category,
    status: task.status,
    date: task.date,
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

  useEffect(() => {
    if (open) {
      getTaskNotes(task.id).then((fetched) => setNotes(fetched));
      getWorkExperienceCompanies().then(setCompanies);
    }
  }, [open, task.id]);

  function applyCompanyTemplate(name: string) {
    const match = companies.find((c) => c.weCompany === name);
    if (match) {
      setForm((f) => ({ ...f, weCompany: match.weCompany, weContactPhone: match.weContactPhone, weContactEmail: match.weContactEmail }));
    }
  }

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

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setNoteLoading(true);
    try {
      await addTaskNote(task.id, newNote.trim());
      const refreshed = await getTaskNotes(task.id);
      setNotes(refreshed);
      setNewNote("");
    } catch {
      toast.error("Failed to add update");
    } finally {
      setNoteLoading(false);
    }
  }

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleString("en-AU", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
      timeZone: "Australia/Sydney",
    });
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

            {/* Work Experience extra fields */}
            {isWE && (
              <>
                <hr style={{ borderColor: "#eeedfe" }} />
                <p className="text-sm font-extrabold" style={{ color: "#3d2c8d", fontFamily: "var(--font-nunito), sans-serif" }}>Work Experience Details</p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name / Type of Work</label>
                  {companies.length > 0 && (
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm mb-1.5 text-gray-600"
                      style={borderStyle}
                      value=""
                      onChange={(e) => applyCompanyTemplate(e.target.value)}
                    >
                      <option value="">— Pre-fill from previous company —</option>
                      {companies.map((c) => (
                        <option key={c.weCompany} value={c.weCompany}>{c.weCompany}</option>
                      ))}
                    </select>
                  )}
                  <input value={form.weCompany} onChange={(e) => setForm({ ...form, weCompany: e.target.value })} className={inputClass} style={borderStyle} placeholder="e.g. Smith & Co — Accounting" list="we-companies" />
                  <datalist id="we-companies">
                    {companies.map((c) => <option key={c.weCompany} value={c.weCompany} />)}
                  </datalist>
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
                        <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="mt-0.5 accent-purple-700" />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Notes thread */}
            <hr style={{ borderColor: "#eeedfe" }} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Updates / Notes</label>

              {/* Existing notes */}
              {task.notes && notes.length === 0 && (
                <div className="mb-3 rounded-lg p-3 text-sm text-gray-700" style={{ backgroundColor: "#f5f4fe", border: "1px solid #eeedfe" }}>
                  <p className="text-xs text-gray-400 mb-1">Original note</p>
                  {task.notes}
                </div>
              )}
              {notes.length > 0 && (
                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                  {task.notes && (
                    <div className="rounded-lg p-3 text-sm text-gray-700" style={{ backgroundColor: "#f5f4fe", border: "1px solid #eeedfe" }}>
                      <p className="text-xs text-gray-400 mb-1">Original note</p>
                      {task.notes}
                    </div>
                  )}
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-lg p-3 text-sm" style={{ backgroundColor: "#f5f4fe", border: "1px solid #eeedfe" }}>
                      <p className="text-xs text-gray-400 mb-1">{formatDate(n.createdAt)}</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {notes.length === 0 && !task.notes && (
                <p className="text-xs text-gray-400 mb-3">No updates yet.</p>
              )}

              {/* Add new note */}
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddNote(); }}
                  placeholder="Add an update…"
                  rows={2}
                  className="flex-1 border rounded-md px-3 py-2 text-sm resize-none"
                  style={borderStyle}
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={noteLoading || !newNote.trim()}
                  className="self-end px-3 py-2 rounded-md text-white disabled:opacity-40"
                  style={{ backgroundColor: "#3d2c8d" }}
                  title="Add update (Ctrl+Enter)"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Ctrl+Enter to post</p>
            </div>
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
