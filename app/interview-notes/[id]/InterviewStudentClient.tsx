"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Plus, Send } from "lucide-react";
import { addInterviewNote, saveInterviewChecklist } from "@/lib/interviewActions";
import { fmtDateTime } from "@/lib/dateFormat";

type Note = { id: number; content: string; isFollowUp: boolean; createdAt: string };

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  notes: Note[];
  checklistData: Record<string, unknown>;
};

// ── Checklist definitions ────────────────────────────────────────────────────

const CONSULTATION_TYPES = ["Individual", "Group", "Drop-in", "Referral", "Follow-up"];
const MAIN_REASONS = [
  "Subject Selection", "Career Exploration", "University Info",
  "TAFE / VET Info", "Apprenticeship / Traineeship", "Personal Concerns", "Other",
];
const FREQUENCIES = ["First Visit", "Second Visit", "Third Visit", "Four or More"];

const CAREER_ASPIRATIONS = [
  { key: "careerGoals", label: "Career goals discussed" },
  { key: "subjectAlignment", label: "Subject selection alignment" },
  { key: "workExperience", label: "Work experience interest" },
  { key: "extracurricular", label: "Extracurricular / hobby interests" },
  { key: "longTermGoals", label: "Long-term goals" },
];
const ASPIRATION_OPTIONS = ["Discussed", "Action Set", "Resources Provided", "Follow-up Needed"];

const PATHWAYS = [
  { key: "university", label: "University / ATAR" },
  { key: "tafe", label: "TAFE / VET" },
  { key: "apprenticeship", label: "Apprenticeship / Traineeship" },
  { key: "sbat", label: "School-Based Apprenticeship (SBAT)" },
  { key: "gapYear", label: "Gap Year" },
  { key: "employment", label: "Direct Employment" },
  { key: "other", label: "Other" },
];
const PATHWAY_OPTIONS = ["Not Aware", "Aware", "Interested", "Researched"];

const REFERRALS = [
  { key: "tafe", label: "TAFE referral" },
  { key: "university", label: "University Open Day" },
  { key: "workExperience", label: "Work Experience" },
  { key: "externalCareers", label: "External Careers Advisor" },
  { key: "wellbeing", label: "Student Services / Wellbeing" },
];

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Open", "In Progress", "Closed"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getObj(data: Record<string, unknown>, key: string): Record<string, unknown> {
  return (data[key] ?? {}) as Record<string, unknown>;
}
function getArr(data: Record<string, unknown>, key: string): string[] {
  return (data[key] ?? []) as string[];
}
function getStr(data: Record<string, unknown>, key: string, fallback = ""): string {
  return (data[key] ?? fallback) as string;
}
function getBool(data: Record<string, unknown>, key: string): boolean {
  return !!(data[key]);
}

// ── Components ───────────────────────────────────────────────────────────────

function CheckboxChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
      style={checked
        ? { backgroundColor: "#534ab7", color: "#fff", borderColor: "#534ab7" }
        : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}
    >
      {checked ? "✓" : "○"} {label}
    </button>
  );
}

function RadioChip({ label, selected, onChange }: { label: string; selected: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
      style={selected
        ? { backgroundColor: "#3d2c8d", color: "#fff", borderColor: "#3d2c8d" }
        : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}
    >
      {selected ? "●" : "○"} {label}
    </button>
  );
}

// ── Tab 1: Consultation ──────────────────────────────────────────────────────

function Tab1({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const types = getArr(data, "consultationType");
  const reasons = getArr(data, "mainReason");
  const freq = getStr(data, "frequency");

  function toggleArr(key: string, arr: string[], val: string) {
    const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
    onChange({ ...data, [key]: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">Consultation Type</h3>
        <div className="flex flex-wrap gap-2">
          {CONSULTATION_TYPES.map((t) => (
            <CheckboxChip key={t} label={t} checked={types.includes(t)} onChange={() => toggleArr("consultationType", types, t)} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">Main Reason for Visit</h3>
        <div className="flex flex-wrap gap-2">
          {MAIN_REASONS.map((r) => (
            <CheckboxChip key={r} label={r} checked={reasons.includes(r)} onChange={() => toggleArr("mainReason", reasons, r)} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">Consultation Frequency</h3>
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map((f) => (
            <RadioChip key={f} label={f} selected={freq === f} onChange={() => onChange({ ...data, frequency: f })} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Career Aspirations ─────────────────────────────────────────────────

function Tab2({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const aspirations = getObj(data, "careerAspirations");

  function toggleOption(rowKey: string, opt: string) {
    const row = getArr(aspirations as Record<string, unknown>, rowKey);
    const next = row.includes(opt) ? row.filter((x) => x !== opt) : [...row, opt];
    onChange({ ...data, careerAspirations: { ...aspirations, [rowKey]: next } });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "#eeedfe" }}>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 min-w-[200px]">Area</th>
            {ASPIRATION_OPTIONS.map((o) => (
              <th key={o} className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">{o}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CAREER_ASPIRATIONS.map(({ key, label }) => {
            const row = getArr(aspirations as Record<string, unknown>, key);
            return (
              <tr key={key} className="border-b hover:bg-purple-50/20" style={{ borderColor: "#eeedfe" }}>
                <td className="px-4 py-3 text-gray-700">{label}</td>
                {ASPIRATION_OPTIONS.map((opt) => (
                  <td key={opt} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleOption(key, opt)}
                      className="w-5 h-5 rounded border-2 transition-all inline-flex items-center justify-center"
                      style={row.includes(opt)
                        ? { backgroundColor: "#534ab7", borderColor: "#534ab7" }
                        : { borderColor: "#d1d5db" }}
                    >
                      {row.includes(opt) && <span className="text-white text-xs font-bold">✓</span>}
                    </button>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab 3: Post-School Pathway Awareness ─────────────────────────────────────

function Tab3({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const awareness = getObj(data, "pathwayAwareness");

  function setOption(rowKey: string, opt: string) {
    const current = getStr(awareness as Record<string, unknown>, rowKey);
    onChange({ ...data, pathwayAwareness: { ...awareness, [rowKey]: current === opt ? "" : opt } });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "#eeedfe" }}>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 min-w-[200px]">Pathway</th>
            {PATHWAY_OPTIONS.map((o) => (
              <th key={o} className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">{o}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PATHWAYS.map(({ key, label }) => {
            const selected = getStr(awareness as Record<string, unknown>, key);
            return (
              <tr key={key} className="border-b hover:bg-purple-50/20" style={{ borderColor: "#eeedfe" }}>
                <td className="px-4 py-3 text-gray-700">{label}</td>
                {PATHWAY_OPTIONS.map((opt) => (
                  <td key={opt} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => setOption(key, opt)}
                      className="w-5 h-5 rounded-full border-2 transition-all inline-flex items-center justify-center"
                      style={selected === opt
                        ? { backgroundColor: "#3d2c8d", borderColor: "#3d2c8d" }
                        : { borderColor: "#d1d5db" }}
                    >
                      {selected === opt && <span className="w-2 h-2 rounded-full bg-white inline-block" />}
                    </button>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="px-4 py-2 text-xs text-gray-400 bg-purple-50/40">
        <strong>Pathway Interest</strong> column on the main list is derived from &ldquo;Interested&rdquo; or &ldquo;Researched&rdquo; rows.
      </p>
    </div>
  );
}

// ── Tab 4: Referrals & Opportunities ─────────────────────────────────────────

function Tab4({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const referrals = getObj(data, "referrals");

  function toggle(key: string, field: string) {
    const row = getObj(referrals as Record<string, unknown>, key);
    onChange({ ...data, referrals: { ...referrals, [key]: { ...row, [field]: !row[field] } } });
  }

  function setNote(key: string, val: string) {
    const row = getObj(referrals as Record<string, unknown>, key);
    onChange({ ...data, referrals: { ...referrals, [key]: { ...row, notes: val } } });
  }

  return (
    <div className="space-y-4 p-4">
      {REFERRALS.map(({ key, label }) => {
        const row = getObj(referrals as Record<string, unknown>, key);
        return (
          <div key={key} className="border rounded-lg p-4" style={{ borderColor: "#eeedfe" }}>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="font-semibold text-gray-700">{label}</span>
              <CheckboxChip label="Made" checked={getBool(row, "made")} onChange={() => toggle(key, "made")} />
              <CheckboxChip label="Pending" checked={getBool(row, "pending")} onChange={() => toggle(key, "pending")} />
              <CheckboxChip label="Completed" checked={getBool(row, "completed")} onChange={() => toggle(key, "completed")} />
            </div>
            <input
              type="text"
              placeholder="Notes / outcome…"
              value={getStr(row, "notes")}
              onChange={(e) => setNote(key, e.target.value)}
              className="w-full text-sm border rounded px-3 py-1.5 outline-none focus:ring-1"
              style={{ borderColor: "#d1d5db" }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Tab 5: Outcomes & Follow-up ───────────────────────────────────────────────

function Tab5({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const outcomes = getObj(data, "outcomes");

  function set(key: string, val: unknown) {
    onChange({ ...data, outcomes: { ...outcomes, [key]: val } });
  }

  const followUp = getBool(outcomes, "followUpRequired");
  const followUpDate = getStr(outcomes, "followUpDate");
  const daysUntil = followUpDate
    ? Math.round((new Date(followUpDate).getTime() - Date.now()) / 86400000)
    : null;
  const alertSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 3;

  return (
    <div className="space-y-5 p-4">
      {alertSoon && (
        <div className="rounded-lg px-4 py-3 text-sm font-semibold" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
          ⚠ Follow-up is {daysUntil === 0 ? "today" : `in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`}!
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Main Outcome</label>
        <textarea
          rows={2}
          value={getStr(outcomes, "mainOutcome")}
          onChange={(e) => set("mainOutcome", e.target.value)}
          className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1 resize-none"
          style={{ borderColor: "#d1d5db" }}
          placeholder="Describe the main outcome of the consultation…"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Next Steps</label>
        <textarea
          rows={2}
          value={getStr(outcomes, "nextSteps")}
          onChange={(e) => set("nextSteps", e.target.value)}
          className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1 resize-none"
          style={{ borderColor: "#d1d5db" }}
          placeholder="What happens next…"
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Follow-up Required</label>
          <div className="flex gap-2">
            <RadioChip label="Yes" selected={followUp} onChange={() => set("followUpRequired", true)} />
            <RadioChip label="No" selected={!followUp} onChange={() => set("followUpRequired", false)} />
          </div>
        </div>

        {followUp && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Follow-up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => set("followUpDate", e.target.value)}
              className="text-sm border rounded px-3 py-1.5 outline-none focus:ring-1"
              style={{ borderColor: "#d1d5db" }}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <RadioChip key={p} label={p} selected={getStr(outcomes, "priority") === p} onChange={() => set("priority", p)} />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <RadioChip key={s} label={s} selected={getStr(outcomes, "status") === s} onChange={() => set("status", s)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Notes Panel ───────────────────────────────────────────────────────────────

function NotesPanel({ studentId, initialNotes }: { studentId: number; initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [followUp, setFollowUp] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      await addInterviewNote(studentId, text.trim(), followUp);
      const newNote: Note = {
        id: Date.now(),
        content: text.trim(),
        isFollowUp: followUp,
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => [...prev, newNote]);
      setText("");
      setFollowUp(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Note thread */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {notes.length === 0 && (
          <p className="text-xs text-gray-400 italic">No notes yet.</p>
        )}
        {notes.map((n) => (
          <div
            key={n.id}
            className="rounded-lg px-3 py-2 text-sm"
            style={n.isFollowUp
              ? { backgroundColor: "#fef3c7", border: "1px solid #fcd34d" }
              : { backgroundColor: "#f5f4fe", border: "1px solid #eeedfe" }}
          >
            <p className="text-xs mb-1" style={{ color: n.isFollowUp ? "#92400e" : "#9ca3af" }}>
              {n.isFollowUp ? "🔔 Follow-up · " : ""}{fmtDateTime(n.createdAt)}
            </p>
            <p className="text-gray-800 whitespace-pre-wrap break-words">{n.content}</p>
          </div>
        ))}
      </div>

      {/* New note form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note or update…"
          className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-1 resize-none"
          style={{ borderColor: "#afa9ec" }}
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={followUp}
              onChange={(e) => setFollowUp(e.target.checked)}
              className="rounded"
            />
            Mark as follow-up session
          </label>
          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: "#534ab7" }}
          >
            <Send size={13} />
            {saving ? "Saving…" : "Add Note"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const TAB_NAMES = ["Consultation", "Career Aspirations", "Pathway Awareness", "Referrals", "Outcomes"];

export function InterviewStudentClient({ student }: { student: Student }) {
  const [activeTab, setActiveTab] = useState(0);
  const [checklistData, setChecklistData] = useState(student.checklistData);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSaveChecklist() {
    setSaving(true);
    try {
      await saveInterviewChecklist(student.id, checklistData);
      toast.success("Checklist saved");
      router.refresh();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Back + header */}
      <div className="mb-6">
        <a
          href="/interview-notes"
          className="inline-flex items-center gap-1 text-sm font-semibold mb-3 hover:underline"
          style={{ color: "#534ab7" }}
        >
          <ChevronLeft size={16} /> Year 10 Interview Notes
        </a>
        <h1
          className="text-2xl font-extrabold"
          style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}
        >
          {student.lastName}, {student.firstName}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {student.studentId && <span className="mr-3">ID: {student.studentId}</span>}
          {student.email && <span>{student.email}</span>}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left: Checklist tabs */}
        <div className="flex-1 min-w-0 rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
          {/* Tab nav */}
          <div className="flex border-b overflow-x-auto" style={{ borderColor: "#afa9ec", backgroundColor: "#f5f4fe" }}>
            {TAB_NAMES.map((name, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className="px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors shrink-0"
                style={activeTab === i
                  ? { color: "#26215c", borderBottom: "2px solid #3d2c8d", backgroundColor: "#fff" }
                  : { color: "#6b7280" }}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white p-4">
            {activeTab === 0 && <Tab1 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 1 && <Tab2 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 2 && <Tab3 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 3 && <Tab4 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 4 && <Tab5 data={checklistData} onChange={setChecklistData} />}
          </div>

          {/* Save button */}
          <div className="px-4 py-3 border-t flex justify-end" style={{ borderColor: "#eeedfe" }}>
            <button
              onClick={handleSaveChecklist}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              style={{ backgroundColor: "#3d2c8d" }}
            >
              {saving ? "Saving…" : "Save Checklist"}
            </button>
          </div>
        </div>

        {/* Right: Notes */}
        <div className="w-full lg:w-96 rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
          <div className="px-4 py-3 font-extrabold text-sm" style={{ backgroundColor: "#3d2c8d", color: "#fff", fontFamily: "var(--font-nunito), sans-serif" }}>
            Notes & Updates
          </div>
          <div className="bg-white p-4">
            <NotesPanel studentId={student.id} initialNotes={student.notes} />
          </div>
        </div>
      </div>
    </div>
  );
}
