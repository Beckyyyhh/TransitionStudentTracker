"use client";

import { useState } from "react";
import { createWEStudent } from "@/lib/actions";
import { SectionHeader } from "@/components/SectionHeader";
import { YEAR_GROUPS } from "@/lib/constants";
import { toast } from "sonner";

type Employer = { id: number; company: string; contactName: string; contactPhone: string; contactEmail: string };

export function NewWEStudentForm({ employers }: { employers: Employer[] }) {
  const [loading, setLoading] = useState(false);
  const [placement, setPlacement] = useState({
    weCompany: "", weContactName: "", weContactPhone: "", weContactEmail: "",
    weStartDate: "", weEndDate: "",
  });

  function applyEmployer(id: string) {
    const e = employers.find((e) => String(e.id) === id);
    if (e) {
      setPlacement((p) => ({ ...p, weCompany: e.company, weContactName: e.contactName, weContactPhone: e.contactPhone, weContactEmail: e.contactEmail }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      // Inject controlled placement fields
      formData.set("weCompany", placement.weCompany);
      formData.set("weContactName", placement.weContactName);
      formData.set("weContactPhone", placement.weContactPhone);
      formData.set("weContactEmail", placement.weContactEmail);
      formData.set("weStartDate", placement.weStartDate);
      formData.set("weEndDate", placement.weEndDate);
      await createWEStudent(formData);
      toast.success("Student added to Work Experience");
      window.location.href = "/work-experience";
    } catch {
      toast.error("Failed to add student");
      setLoading(false);
    }
  }

  const inputClass = "w-full border rounded-md px-3 py-2 text-sm";
  const borderStyle = { borderColor: "#afa9ec" };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-4">
        <a href="/work-experience" className="text-sm" style={{ color: "#534ab7" }}>← Work Experience</a>
      </div>
      <h1 className="text-2xl font-extrabold mb-2" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
        Add Work Experience Student
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        This student will only appear on the Work Experience page, not the main Students list.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Student details */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
          <SectionHeader title="Student Details" />
          <div className="bg-white p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                <input name="firstName" required className={inputClass} style={borderStyle} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                <input name="lastName" required className={inputClass} style={borderStyle} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Year Group</label>
              <select name="year" required className={inputClass} style={borderStyle}>
                <option value="">Select year…</option>
                {YEAR_GROUPS.map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Placement details */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
          <SectionHeader title="Work Experience Placement" />
          <div className="bg-white p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Placement Title</label>
              <input name="title" defaultValue="Work Experience" className={inputClass} style={borderStyle} placeholder="e.g. Work Experience — Law" />
            </div>

            {/* Employer pre-fill */}
            {employers.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pre-fill from Employer Bank</label>
                <select className={inputClass} style={borderStyle} defaultValue="" onChange={(e) => applyEmployer(e.target.value)}>
                  <option value="">— Select existing employer —</option>
                  {employers.map((e) => (
                    <option key={e.id} value={e.id}>{e.company}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Company / Type of Work</label>
              <input value={placement.weCompany} onChange={(e) => setPlacement((p) => ({ ...p, weCompany: e.target.value }))} className={inputClass} style={borderStyle} placeholder="e.g. Smith & Co — Accounting" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Name</label>
              <input value={placement.weContactName} onChange={(e) => setPlacement((p) => ({ ...p, weContactName: e.target.value }))} className={inputClass} style={borderStyle} placeholder="e.g. Jane Smith" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
                <input value={placement.weContactPhone} onChange={(e) => setPlacement((p) => ({ ...p, weContactPhone: e.target.value }))} className={inputClass} style={borderStyle} placeholder="02 9999 0000" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
                <input type="email" value={placement.weContactEmail} onChange={(e) => setPlacement((p) => ({ ...p, weContactEmail: e.target.value }))} className={inputClass} style={borderStyle} placeholder="contact@company.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">From Date</label>
                <input type="date" value={placement.weStartDate} onChange={(e) => setPlacement((p) => ({ ...p, weStartDate: e.target.value }))} className={inputClass} style={borderStyle} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">To Date</label>
                <input type="date" value={placement.weEndDate} onChange={(e) => setPlacement((p) => ({ ...p, weEndDate: e.target.value }))} className={inputClass} style={borderStyle} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date Added</label>
              <input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} className={inputClass} style={borderStyle} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <a href="/work-experience" className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50" style={borderStyle}>Cancel</a>
          <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-bold text-white rounded-md disabled:opacity-60" style={{ backgroundColor: "#3d2c8d" }}>
            {loading ? "Adding…" : "Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
}
