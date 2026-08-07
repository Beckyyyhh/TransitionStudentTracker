"use client";

import { useState } from "react";
import { createWEStudent, createWETaskForExistingStudent } from "@/lib/actions";
import { SectionHeader } from "@/components/SectionHeader";
import { YEAR_GROUPS } from "@/lib/constants";
import { toast } from "sonner";

type Employer = { id: number; company: string; contactName: string; contactPhone: string; contactEmail: string };
type ExistingStudent = { id: number; firstName: string; lastName: string; year: number };

const emptyPlacement = {
  weCompany: "", weContactName: "", weContactPhone: "", weContactEmail: "",
  weStartDate: "", weEndDate: "",
};

function PlacementFields({
  placement,
  setPlacement,
  employers,
}: {
  placement: typeof emptyPlacement;
  setPlacement: React.Dispatch<React.SetStateAction<typeof emptyPlacement>>;
  employers: Employer[];
}) {
  const inputClass = "w-full border rounded-md px-3 py-2 text-sm";
  const borderStyle = { borderColor: "#afa9ec" };

  function applyEmployer(id: string) {
    const e = employers.find((e) => String(e.id) === id);
    if (e) {
      setPlacement((p) => ({ ...p, weCompany: e.company, weContactName: e.contactName, weContactPhone: e.contactPhone, weContactEmail: e.contactEmail }));
    }
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
      <SectionHeader title="Work Experience Placement" />
      <div className="bg-white p-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Placement Title</label>
          <input name="title" defaultValue="Work Experience" className={inputClass} style={borderStyle} placeholder="e.g. Work Experience — Law" />
        </div>

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
  );
}

export function NewWEStudentForm({
  employers,
  existingStudents,
}: {
  employers: Employer[];
  existingStudents: ExistingStudent[];
}) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [loading, setLoading] = useState(false);
  const [placement, setPlacement] = useState(emptyPlacement);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const inputClass = "w-full border rounded-md px-3 py-2 text-sm";
  const borderStyle = { borderColor: "#afa9ec" };

  const filteredStudents = existingStudents.filter((s) => {
    const q = studentSearch.toLowerCase();
    return `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || String(s.year).includes(q);
  });

  async function handleExistingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Please select a student");
      return;
    }
    setLoading(true);
    try {
      const form = e.currentTarget;
      const title = (form.elements.namedItem("title") as HTMLInputElement)?.value || "Work Experience";
      const date = (form.elements.namedItem("date") as HTMLInputElement)?.value || new Date().toISOString().split("T")[0];
      await createWETaskForExistingStudent(parseInt(selectedStudentId), { title, date, ...placement });
      toast.success("Work experience placement added");
      window.location.href = "/work-experience";
    } catch {
      toast.error("Failed to add placement");
      setLoading(false);
    }
  }

  async function handleNewSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
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

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-4">
        <a href="/work-experience" className="text-sm" style={{ color: "#534ab7" }}>← Work Experience</a>
      </div>
      <h1 className="text-2xl font-extrabold mb-4" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
        Add Work Experience
      </h1>

      {/* Mode toggle */}
      <div className="flex rounded-lg overflow-hidden border mb-6" style={{ borderColor: "#afa9ec" }}>
        <button
          type="button"
          onClick={() => { setMode("existing"); setPlacement(emptyPlacement); }}
          className="flex-1 py-2.5 text-sm font-semibold transition-colors"
          style={mode === "existing" ? { backgroundColor: "#3d2c8d", color: "#fff" } : { backgroundColor: "#fff", color: "#534ab7" }}
        >
          Existing Student
        </button>
        <button
          type="button"
          onClick={() => { setMode("new"); setPlacement(emptyPlacement); }}
          className="flex-1 py-2.5 text-sm font-semibold transition-colors border-l"
          style={mode === "new" ? { backgroundColor: "#3d2c8d", color: "#fff", borderColor: "#afa9ec" } : { backgroundColor: "#fff", color: "#534ab7", borderColor: "#afa9ec" }}
        >
          New Student (WE Only)
        </button>
      </div>

      {/* ── Existing student mode ── */}
      {mode === "existing" && (
        <form onSubmit={handleExistingSubmit} className="space-y-5">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
            <SectionHeader title="Select Student" />
            <div className="bg-white p-5 space-y-3">
              <p className="text-sm text-gray-500">Search and select a student already in the database.</p>
              <input
                type="text"
                placeholder="Search by name or year…"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className={inputClass}
                style={borderStyle}
              />
              {studentSearch && (
                <div className="rounded-md border overflow-hidden" style={{ borderColor: "#afa9ec", maxHeight: "220px", overflowY: "auto" }}>
                  {filteredStudents.length === 0 ? (
                    <p className="text-sm text-gray-400 px-3 py-2">No students found</p>
                  ) : (
                    filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(String(s.id));
                          setStudentSearch(`${s.firstName} ${s.lastName} (Year ${s.year})`);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 border-b transition-colors"
                        style={{ borderColor: "#eeedfe" }}
                      >
                        <span className="font-semibold text-gray-800">{s.firstName} {s.lastName}</span>
                        <span className="ml-2 text-gray-400 text-xs">Year {s.year}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
              {selectedStudentId && !studentSearch.includes("(Year") && (
                <p className="text-xs text-red-400">Please select a student from the list</p>
              )}
              {selectedStudentId && (
                <p className="text-xs font-semibold" style={{ color: "#3d2c8d" }}>
                  Selected: {existingStudents.find((s) => String(s.id) === selectedStudentId)
                    ? `${existingStudents.find((s) => String(s.id) === selectedStudentId)!.firstName} ${existingStudents.find((s) => String(s.id) === selectedStudentId)!.lastName} (Year ${existingStudents.find((s) => String(s.id) === selectedStudentId)!.year})`
                    : ""}
                </p>
              )}
            </div>
          </div>

          <PlacementFields placement={placement} setPlacement={setPlacement} employers={employers} />

          <div className="flex justify-end gap-3">
            <a href="/work-experience" className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50" style={borderStyle}>Cancel</a>
            <button type="submit" disabled={loading || !selectedStudentId} className="px-5 py-2 text-sm font-bold text-white rounded-md disabled:opacity-60" style={{ backgroundColor: "#3d2c8d" }}>
              {loading ? "Adding…" : "Add Placement"}
            </button>
          </div>
        </form>
      )}

      {/* ── New WE-only student mode ── */}
      {mode === "new" && (
        <form onSubmit={handleNewSubmit} className="space-y-5">
          <p className="text-sm text-gray-500 -mt-3">
            This student will only appear on the Work Experience page, not the main Students list.
          </p>

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

          <PlacementFields placement={placement} setPlacement={setPlacement} employers={employers} />

          <div className="flex justify-end gap-3">
            <a href="/work-experience" className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50" style={borderStyle}>Cancel</a>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-bold text-white rounded-md disabled:opacity-60" style={{ backgroundColor: "#3d2c8d" }}>
              {loading ? "Adding…" : "Add Student"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
