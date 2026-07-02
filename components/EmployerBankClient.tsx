"use client";

import { useState } from "react";
import { createEmployer, updateEmployer, deleteEmployer } from "@/lib/actions";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

type Employer = { id: number; company: string; contactName: string; contactPhone: string; contactEmail: string };

const empty = { company: "", contactName: "", contactPhone: "", contactEmail: "" };

function EmployerRow({ employer, onSaved }: { employer: Employer; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ company: employer.company, contactName: employer.contactName, contactPhone: employer.contactPhone, contactEmail: employer.contactEmail });
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!form.company.trim()) return;
    setLoading(true);
    try {
      await updateEmployer(employer.id, form);
      toast.success("Employer updated");
      setEditing(false);
      onSaved();
    } catch {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${employer.company}" from the employer bank?`)) return;
    setLoading(true);
    try {
      await deleteEmployer(employer.id);
      toast.success("Employer removed");
      onSaved();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border rounded-md px-2 py-1.5 text-sm";
  const borderStyle = { borderColor: "#afa9ec" };

  if (editing) {
    return (
      <div className="p-4 border-b" style={{ borderColor: "#eeedfe", backgroundColor: "#faf9ff" }}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-0.5">Company / Work Type</label>
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputClass} style={borderStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-0.5">Contact Name</label>
            <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className={inputClass} style={borderStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-0.5">Phone</label>
            <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className={inputClass} style={borderStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-0.5">Email</label>
            <input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className={inputClass} style={borderStyle} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={loading} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-md disabled:opacity-60" style={{ backgroundColor: "#3d2c8d" }}>
            <Check size={12} /> Save
          </button>
          <button onClick={() => { setEditing(false); setForm({ company: employer.company, contactName: employer.contactName, contactPhone: employer.contactPhone, contactEmail: employer.contactEmail }); }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border rounded-md text-gray-600 hover:bg-gray-50" style={borderStyle}>
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between px-4 py-3 border-b hover:bg-purple-50/30 transition-colors" style={{ borderColor: "#eeedfe" }}>
      <div>
        <p className="font-semibold text-sm text-gray-800">{employer.company}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {[employer.contactName, employer.contactPhone, employer.contactEmail].filter(Boolean).join(" · ") || <span className="italic">No contact info</span>}
        </p>
      </div>
      <div className="flex gap-1 shrink-0 ml-3">
        <button onClick={() => setEditing(true)} className="p-1.5 rounded hover:bg-purple-100 transition-colors" style={{ color: "#534ab7" }} title="Edit">
          <Pencil size={14} />
        </button>
        <button onClick={handleDelete} disabled={loading} className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40" title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function AddEmployerRow({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!form.company.trim()) return;
    setLoading(true);
    try {
      await createEmployer(form);
      toast.success("Employer added");
      setForm(empty);
      setOpen(false);
      onSaved();
    } catch {
      toast.error("Failed to add employer");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border rounded-md px-2 py-1.5 text-sm";
  const borderStyle = { borderColor: "#afa9ec" };

  if (!open) {
    return (
      <div className="p-4">
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#534ab7" }}>
          <Plus size={15} /> Add Employer
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border-t" style={{ borderColor: "#eeedfe", backgroundColor: "#faf9ff" }}>
      <p className="text-sm font-extrabold mb-3" style={{ color: "#3d2c8d", fontFamily: "var(--font-nunito), sans-serif" }}>New Employer</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-0.5">Company / Work Type *</label>
          <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputClass} style={borderStyle} placeholder="e.g. Smith & Co — Law" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-0.5">Contact Name</label>
          <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className={inputClass} style={borderStyle} placeholder="e.g. Jane Smith" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-0.5">Phone</label>
          <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className={inputClass} style={borderStyle} placeholder="02 9999 0000" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-0.5">Email</label>
          <input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className={inputClass} style={borderStyle} placeholder="contact@company.com" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleAdd} disabled={loading || !form.company.trim()} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-md disabled:opacity-60" style={{ backgroundColor: "#3d2c8d" }}>
          <Plus size={12} /> Add
        </button>
        <button onClick={() => { setOpen(false); setForm(empty); }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border rounded-md text-gray-600 hover:bg-gray-50" style={borderStyle}>
          <X size={12} /> Cancel
        </button>
      </div>
    </div>
  );
}

export function EmployerBankClient({ employers: initial }: { employers: Employer[] }) {
  const [employers, setEmployers] = useState(initial);

  async function refresh() {
    // Re-fetch by reloading — keeps it simple without needing client-side state sync
    window.location.reload();
  }

  return (
    <div>
      {employers.length === 0 && (
        <p className="text-sm text-gray-400 px-4 py-3">No employers yet. Add one below.</p>
      )}
      {employers.map((e) => (
        <EmployerRow key={e.id} employer={e} onSaved={refresh} />
      ))}
      <AddEmployerRow onSaved={refresh} />
    </div>
  );
}
