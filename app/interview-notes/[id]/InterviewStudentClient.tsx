"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Send, Printer, Mail, RefreshCw } from "lucide-react";
import { addInterviewNote, saveInterviewChecklist } from "@/lib/interviewActions";
import { fmtDateTime, fmtDate } from "@/lib/dateFormat";

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
  { key: "university", label: "University / ATAR", links: [{ label: "UAC Course Search", url: "https://uac.edu.au/course-search/search/find-a-course-undergraduate" }] },
  { key: "tafe", label: "TAFE / VET", links: [{ label: "TAFE NSW", url: "https://www.tafensw.edu.au/" }] },
  { key: "apprenticeship", label: "Apprenticeship / Traineeship", links: [{ label: "Types of Apprenticeships", url: "https://www.apprenticeships.gov.au/about-apprenticeships/types-apprenticeships" }, { label: "How to Find an Apprenticeship", url: "https://www.apprenticeships.gov.au/apprentices/how-find-and-prepare-apprenticeship" }] },
  { key: "sbat", label: "School-Based Apprenticeship (SBAT)", links: [] },
  { key: "gapYear", label: "Gap Year", links: [] },
  { key: "employment", label: "Direct Employment", links: [] },
  { key: "other", label: "Other", links: [] },
];
const PATHWAY_OPTIONS = ["Not Aware", "Interested", "Not Interested", "Researched"];
const PATHWAY_LABELS: Record<string, string> = {
  university: "University", tafe: "TAFE/VET", apprenticeship: "Apprenticeship",
  sbat: "SBAT", gapYear: "Gap Year", employment: "Employment", other: "Other",
};

const REFERRALS = [
  { key: "tafe", label: "TAFE referral" },
  { key: "university", label: "University Open Day" },
  { key: "workExperience", label: "Work Experience" },
  { key: "externalCareers", label: "External Careers Advisor" },
  { key: "wellbeing", label: "Student Services / Wellbeing" },
];

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Open", "In Progress", "Closed"];

// Career Development rows
const CAREER_DEV_ROWS = [
  { key: "selfAwareness", label: "Self-awareness", options: ["Can identify strengths", "Can identify interests", "Needs support identifying strengths and interests"] },
  { key: "careerExploration", label: "Career exploration", options: ["Has researched careers", "Needs help researching careers", "Has not started exploring careers"] },
  { key: "workExperience", label: "Work experience", options: ["Completed", "Arranged", "Interested", "Needs assistance finding a placement"] },
  { key: "resume", label: "Resume", options: ["Has a resume", "Needs to develop a resume", "Needs resume improvement"] },
  { key: "employabilitySkills", label: "Employability skills", options: ["Can identify transferable skills", "Needs help identifying skills", "Discussed communication, teamwork or problem-solving"] },
  { key: "extracurricular", label: "Extracurricular experience", options: ["Part-time employment", "Volunteering", "Sport", "Leadership", "Community involvement", "No experience discussed"] },
  { key: "industryExposure", label: "Industry exposure", options: ["Career expo", "Industry visit", "Work experience", "Employer engagement", "Needs exposure to industries"] },
];

// Subject Selection rows
const SUBJ_STATUS_OPTIONS = ["Confident with choices", "Has shortlisted subjects", "Undecided", "Needs individual subject selection support"];
const PREREQ_OPTIONS = ["Understands prerequisites", "Needs to check prerequisites", "Unaware of prerequisites"];
const RELEVANCE_OPTIONS = ["Understands links to career goals", "Needs guidance on subject relevance", "Choosing based on interest", "Choosing based on perceived scaling"];
const ACADEMIC_OPTIONS = ["Current performance discussed", "Minimum entry requirements discussed", "Alternative subject combinations explored", "No concerns identified"];
const SUPPORT_OPTIONS = ["Subject selection meeting", "Faculty consultation", "Academic planning", "Further research"];

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

function buildChecklistSummary(data: Record<string, unknown>): string {
  const lines: string[] = [`📋 Consultation saved — ${new Date().toLocaleDateString("en-AU")}`];
  const types = getArr(data, "consultationType");
  if (types.length) lines.push(`Type: ${types.join(", ")}`);
  const reasons = getArr(data, "mainReason");
  if (reasons.length) lines.push(`Reason: ${reasons.join(", ")}`);
  const freq = getStr(data, "frequency");
  if (freq) lines.push(`Frequency: ${freq}`);
  const awareness = getObj(data, "pathwayAwareness");
  const interested = Object.entries(awareness)
    .filter(([, v]) => v === "Interested" || v === "Researched")
    .map(([k]) => PATHWAY_LABELS[k] ?? k);
  if (interested.length) lines.push(`Pathway interest: ${interested.join(", ")}`);
  const outcomes = getObj(data, "outcomes");
  const mainOutcome = getStr(outcomes, "mainOutcome");
  if (mainOutcome) lines.push(`Outcome: ${mainOutcome}`);
  const nextSteps = getStr(outcomes, "nextSteps");
  if (nextSteps) lines.push(`Next steps: ${nextSteps}`);
  if (getBool(outcomes, "followUpRequired")) {
    const d = getStr(outcomes, "followUpDate");
    lines.push(`Follow-up required${d ? ` by ${fmtDate(d)}` : ""}`);
  }
  return lines.join("\n");
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function SectionNotes({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-3">
      <label className="block text-xs font-semibold text-gray-400 mb-1">Notes — {label}</label>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Optional notes…"
        className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-1 resize-none bg-gray-50"
        style={{ borderColor: "#e5e7eb" }}
      />
    </div>
  );
}

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
  const tab1Notes = getObj(data, "tab1Notes");

  function toggleArr(key: string, arr: string[], val: string) {
    const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
    onChange({ ...data, [key]: next });
  }
  function setNote(key: string, val: string) {
    onChange({ ...data, tab1Notes: { ...tab1Notes, [key]: val } });
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
        <SectionNotes label="Consultation Type" value={getStr(tab1Notes, "consultationType")} onChange={(v) => setNote("consultationType", v)} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">Main Reason for Visit</h3>
        <div className="flex flex-wrap gap-2">
          {MAIN_REASONS.map((r) => (
            <CheckboxChip key={r} label={r} checked={reasons.includes(r)} onChange={() => toggleArr("mainReason", reasons, r)} />
          ))}
        </div>
        <SectionNotes label="Main Reason" value={getStr(tab1Notes, "mainReason")} onChange={(v) => setNote("mainReason", v)} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">Consultation Frequency</h3>
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map((f) => (
            <RadioChip key={f} label={f} selected={freq === f} onChange={() => onChange({ ...data, frequency: f })} />
          ))}
        </div>
        <SectionNotes label="Frequency" value={getStr(tab1Notes, "frequency")} onChange={(v) => setNote("frequency", v)} />
      </div>
    </div>
  );
}

// ── Tab 2: Career Aspirations ─────────────────────────────────────────────────

function Tab2({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const aspirations = getObj(data, "careerAspirations");
  const aspirationNotes = getObj(data, "aspirationNotes");

  function toggleOption(rowKey: string, opt: string) {
    const row = getArr(aspirations as Record<string, unknown>, rowKey);
    const next = row.includes(opt) ? row.filter((x) => x !== opt) : [...row, opt];
    onChange({ ...data, careerAspirations: { ...aspirations, [rowKey]: next } });
  }
  function setNote(rowKey: string, val: string) {
    onChange({ ...data, aspirationNotes: { ...aspirationNotes, [rowKey]: val } });
  }

  return (
    <div className="space-y-4">
      {CAREER_ASPIRATIONS.map(({ key, label }) => {
        const row = getArr(aspirations as Record<string, unknown>, key);
        return (
          <div key={key} className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
            <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {ASPIRATION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(key, opt)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                  style={row.includes(opt)
                    ? { backgroundColor: "#534ab7", color: "#fff", borderColor: "#534ab7" }
                    : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}
                >
                  {row.includes(opt) ? "✓" : "○"} {opt}
                </button>
              ))}
            </div>
            <SectionNotes label={label} value={getStr(aspirationNotes as Record<string, unknown>, key)} onChange={(v) => setNote(key, v)} />
          </div>
        );
      })}
    </div>
  );
}

// ── Tab 3: Post-School Pathway Awareness ─────────────────────────────────────

function Tab3({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const awareness = getObj(data, "pathwayAwareness");
  const pathwayNotes = getObj(data, "pathwayNotes");

  function setOption(rowKey: string, opt: string) {
    const current = getStr(awareness as Record<string, unknown>, rowKey);
    onChange({ ...data, pathwayAwareness: { ...awareness, [rowKey]: current === opt ? "" : opt } });
  }
  function setNote(rowKey: string, val: string) {
    onChange({ ...data, pathwayNotes: { ...pathwayNotes, [rowKey]: val } });
  }

  return (
    <div className="space-y-4">
      {PATHWAYS.map(({ key, label, links }) => {
        const selected = getStr(awareness as Record<string, unknown>, key);
        return (
          <div key={key} className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <p className="text-sm font-semibold text-gray-700">{label}</p>
              {links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold hover:underline" style={{ color: "#534ab7" }}>
                  🔗 {l.label}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {PATHWAY_OPTIONS.map((opt) => (
                <button key={opt} type="button" onClick={() => setOption(key, opt)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                  style={selected === opt
                    ? { backgroundColor: "#3d2c8d", color: "#fff", borderColor: "#3d2c8d" }
                    : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>
                  {selected === opt ? "●" : "○"} {opt}
                </button>
              ))}
            </div>
            <SectionNotes label={label} value={getStr(pathwayNotes as Record<string, unknown>, key)} onChange={(v) => setNote(key, v)} />
          </div>
        );
      })}
      <p className="text-xs text-gray-400 px-1">
        <strong>Pathway Interest</strong> on the main list is derived from &ldquo;Interested&rdquo; or &ldquo;Researched&rdquo; rows.
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
            <SectionNotes label={label} value={getStr(row, "notes")} onChange={(v) => setNote(key, v)} />
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
        <textarea rows={2} value={getStr(outcomes, "mainOutcome")} onChange={(e) => set("mainOutcome", e.target.value)}
          className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1 resize-none" style={{ borderColor: "#d1d5db" }}
          placeholder="Describe the main outcome of the consultation…" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Next Steps</label>
        <textarea rows={2} value={getStr(outcomes, "nextSteps")} onChange={(e) => set("nextSteps", e.target.value)}
          className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1 resize-none" style={{ borderColor: "#d1d5db" }}
          placeholder="What happens next…" />
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
            <input type="date" value={followUpDate} onChange={(e) => set("followUpDate", e.target.value)}
              className="text-sm border rounded px-3 py-1.5 outline-none focus:ring-1" style={{ borderColor: "#d1d5db" }} />
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
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes</label>
        <textarea rows={3} value={getStr(outcomes, "additionalNotes")} onChange={(e) => set("additionalNotes", e.target.value)}
          className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1 resize-none" style={{ borderColor: "#d1d5db" }}
          placeholder="Any additional observations or notes…" />
      </div>
    </div>
  );
}

// ── Tab 6: Action Plan ────────────────────────────────────────────────────────

function Tab6({ data, onChange, student }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; student: Student }) {
  const plan = getObj(data, "actionPlan");
  const date = getStr(plan, "date", new Date().toISOString().slice(0, 10));
  const content = getStr(plan, "content");
  const resources = getStr(plan, "resources");
  const deadline = getStr(plan, "deadline");

  function set(key: string, val: string) {
    onChange({ ...data, actionPlan: { ...plan, [key]: val } });
  }

  function handlePrint() { window.print(); }

  function handleEmail() {
    const body = [
      `Action Plan — ${student.firstName} ${student.lastName}`,
      `Date: ${date}`,
      ``,
      content ? `Overview:\n${content}` : "",
      getStr(plan, "goal1") ? `Goal 1: ${getStr(plan, "goal1")}` : "",
      getStr(plan, "goal2") ? `Goal 2: ${getStr(plan, "goal2")}` : "",
      getStr(plan, "goal3") ? `Goal 3: ${getStr(plan, "goal3")}` : "",
      resources ? `Resources / Support:\n${resources}` : "",
      deadline ? `Target Completion: ${deadline}` : "",
      ``,
      `— Canley Vale HS Careers Hub`,
    ].filter(Boolean).join("\n");
    window.location.href = `mailto:${encodeURIComponent(student.email)}?subject=${encodeURIComponent("Your Career Action Plan — Canley Vale HS")}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="space-y-5 p-4">
      <style>{`
        @media print {
          body > * { display: none !important; }
          .print-action-plan { display: block !important; position: fixed; top: 0; left: 0; width: 100%; background: white; z-index: 99999; padding: 40px; }
        }
        .print-action-plan { display: none; }
      `}</style>
      <div className="print-action-plan">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Career Action Plan</h1>
        <p style={{ fontSize: 14, marginBottom: 2 }}><strong>Student:</strong> {student.firstName} {student.lastName} {student.studentId ? `(${student.studentId})` : ""}</p>
        <p style={{ fontSize: 14, marginBottom: 16 }}><strong>Date:</strong> {date}</p>
        {content && <><p style={{ fontWeight: 700, marginBottom: 4 }}>Overview</p><p style={{ fontSize: 14, whiteSpace: "pre-wrap", marginBottom: 16 }}>{content}</p></>}
        {(getStr(plan, "goal1") || getStr(plan, "goal2") || getStr(plan, "goal3")) && (
          <><p style={{ fontWeight: 700, marginBottom: 4 }}>Goals</p>
            {getStr(plan, "goal1") && <p style={{ fontSize: 14, marginBottom: 4 }}>1. {getStr(plan, "goal1")}</p>}
            {getStr(plan, "goal2") && <p style={{ fontSize: 14, marginBottom: 4 }}>2. {getStr(plan, "goal2")}</p>}
            {getStr(plan, "goal3") && <p style={{ fontSize: 14, marginBottom: 4 }}>3. {getStr(plan, "goal3")}</p>}</>
        )}
        {resources && <><p style={{ fontWeight: 700, marginTop: 12, marginBottom: 4 }}>Resources / Support</p><p style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{resources}</p></>}
        {deadline && <p style={{ fontSize: 14, marginTop: 12 }}><strong>Target Completion:</strong> {deadline}</p>}
        <p style={{ fontSize: 12, marginTop: 32, color: "#6b7280" }}>Canley Vale HS — Careers Hub</p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-bold text-gray-700">Action Plan</h3>
        <div className="flex gap-2">
          <button type="button" onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-gray-50"
            style={{ color: "#374151", borderColor: "#d1d5db" }}>
            <Printer size={14} /> Print / Save PDF
          </button>
          <button type="button" onClick={handleEmail} disabled={!student.email}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: "#534ab7" }}
            title={student.email ? `Email to ${student.email}` : "No email address on file"}>
            <Mail size={14} /> Email to Student
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-gray-700 shrink-0">Plan Date</label>
        <input type="date" value={date} onChange={(e) => set("date", e.target.value)}
          className="text-sm border rounded px-3 py-1.5 outline-none focus:ring-1" style={{ borderColor: "#d1d5db" }} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Overview / Summary</label>
        <textarea rows={3} value={content} onChange={(e) => set("content", e.target.value)}
          className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1 resize-none" style={{ borderColor: "#d1d5db" }}
          placeholder="Brief summary of the student's situation and what this plan aims to achieve…" />
      </div>
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">Goals / Action Steps</label>
        {(["goal1", "goal2", "goal3"] as const).map((k, i) => (
          <div key={k} className="flex items-start gap-2">
            <span className="text-xs font-bold text-gray-400 mt-2.5 shrink-0 w-10">Goal {i + 1}</span>
            <input type="text" value={getStr(plan, k)} onChange={(e) => set(k, e.target.value)}
              className="flex-1 text-sm border rounded px-3 py-2 outline-none focus:ring-1" style={{ borderColor: "#d1d5db" }}
              placeholder="e.g. Research TAFE courses…" />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Resources / Support Available</label>
        <textarea rows={2} value={resources} onChange={(e) => set("resources", e.target.value)}
          className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1 resize-none" style={{ borderColor: "#d1d5db" }}
          placeholder="e.g. MyFuture website, TAFE NSW open days, school counsellor…" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Target Completion Date</label>
        <input type="date" value={deadline} onChange={(e) => set("deadline", e.target.value)}
          className="text-sm border rounded px-3 py-1.5 outline-none focus:ring-1" style={{ borderColor: "#d1d5db" }} />
      </div>
      {!student.email && (
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
          No email address on file — add one via the import spreadsheet to enable email sending.
        </p>
      )}
    </div>
  );
}

// ── Tab 7: Career Development & Employability Skills ─────────────────────────

function Tab7({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const careerDev = getObj(data, "careerDev");
  const careerDevNotes = getObj(data, "careerDevNotes");

  function toggle(rowKey: string, opt: string) {
    const row = getArr(careerDev as Record<string, unknown>, rowKey);
    const next = row.includes(opt) ? row.filter((x) => x !== opt) : [...row, opt];
    onChange({ ...data, careerDev: { ...careerDev, [rowKey]: next } });
  }
  function setNote(rowKey: string, val: string) {
    onChange({ ...data, careerDevNotes: { ...careerDevNotes, [rowKey]: val } });
  }

  return (
    <div className="space-y-4">
      {CAREER_DEV_ROWS.map(({ key, label, options }) => {
        const row = getArr(careerDev as Record<string, unknown>, key);
        return (
          <div key={key} className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
            <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {options.map((opt) => (
                <button key={opt} type="button" onClick={() => toggle(key, opt)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                  style={row.includes(opt)
                    ? { backgroundColor: "#534ab7", color: "#fff", borderColor: "#534ab7" }
                    : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>
                  {row.includes(opt) ? "✓" : "○"} {opt}
                </button>
              ))}
            </div>
            <SectionNotes label={label} value={getStr(careerDevNotes as Record<string, unknown>, key)} onChange={(v) => setNote(key, v)} />
          </div>
        );
      })}
    </div>
  );
}

// ── Tab 8: Subject Selection & Academic Planning ──────────────────────────────

function Tab8({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const subj = getObj(data, "subjectSelection");
  const subjNotes = getObj(data, "subjectSelectionNotes");

  function toggleArr(key: string, opt: string) {
    const arr = getArr(subj as Record<string, unknown>, key);
    const next = arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt];
    onChange({ ...data, subjectSelection: { ...subj, [key]: next } });
  }
  function setRadio(key: string, opt: string) {
    const cur = getStr(subj as Record<string, unknown>, key);
    onChange({ ...data, subjectSelection: { ...subj, [key]: cur === opt ? "" : opt } });
  }
  function setText(key: string, val: string) {
    onChange({ ...data, subjectSelection: { ...subj, [key]: val } });
  }
  function setNote(key: string, val: string) {
    onChange({ ...data, subjectSelectionNotes: { ...subjNotes, [key]: val } });
  }

  const TEXT_FIELDS = [
    { key: "subjectsOfInterest", label: "Subjects of interest" },
    { key: "subjectsEnjoys", label: "Subjects the student enjoys" },
    { key: "subjectsPerformsWell", label: "Subjects the student performs well in" },
    { key: "subjectsChallenging", label: "Subjects the student finds challenging" },
  ];

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
        <p className="text-sm font-semibold text-gray-700 mb-2">Subject selection status</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {SUBJ_STATUS_OPTIONS.map((opt) => {
            const arr = getArr(subj as Record<string, unknown>, "status");
            return (
              <button key={opt} type="button" onClick={() => toggleArr("status", opt)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                style={arr.includes(opt)
                  ? { backgroundColor: "#534ab7", color: "#fff", borderColor: "#534ab7" }
                  : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>
                {arr.includes(opt) ? "✓" : "○"} {opt}
              </button>
            );
          })}
        </div>
        <SectionNotes label="Subject selection status" value={getStr(subjNotes as Record<string, unknown>, "status")} onChange={(v) => setNote("status", v)} />
      </div>

      {/* Text fields */}
      {TEXT_FIELDS.map(({ key, label }) => (
        <div key={key} className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
          <input type="text" value={getStr(subj as Record<string, unknown>, key)}
            onChange={(e) => setText(key, e.target.value)}
            className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1" style={{ borderColor: "#d1d5db" }}
            placeholder="Enter details…" />
        </div>
      ))}

      {/* Prerequisites */}
      <div className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
        <p className="text-sm font-semibold text-gray-700 mb-2">Understanding of prerequisites</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {PREREQ_OPTIONS.map((opt) => (
            <button key={opt} type="button" onClick={() => setRadio("prerequisites", opt)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
              style={getStr(subj as Record<string, unknown>, "prerequisites") === opt
                ? { backgroundColor: "#3d2c8d", color: "#fff", borderColor: "#3d2c8d" }
                : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>
              {getStr(subj as Record<string, unknown>, "prerequisites") === opt ? "●" : "○"} {opt}
            </button>
          ))}
        </div>
        <SectionNotes label="Prerequisites" value={getStr(subjNotes as Record<string, unknown>, "prerequisites")} onChange={(v) => setNote("prerequisites", v)} />
      </div>

      {/* Subject relevance */}
      <div className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
        <p className="text-sm font-semibold text-gray-700 mb-2">Understanding of subject relevance</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {RELEVANCE_OPTIONS.map((opt) => {
            const arr = getArr(subj as Record<string, unknown>, "relevance");
            return (
              <button key={opt} type="button" onClick={() => toggleArr("relevance", opt)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                style={arr.includes(opt)
                  ? { backgroundColor: "#534ab7", color: "#fff", borderColor: "#534ab7" }
                  : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>
                {arr.includes(opt) ? "✓" : "○"} {opt}
              </button>
            );
          })}
        </div>
        <SectionNotes label="Subject relevance" value={getStr(subjNotes as Record<string, unknown>, "relevance")} onChange={(v) => setNote("relevance", v)} />
      </div>

      {/* Academic considerations */}
      <div className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
        <p className="text-sm font-semibold text-gray-700 mb-2">Academic considerations</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {ACADEMIC_OPTIONS.map((opt) => {
            const arr = getArr(subj as Record<string, unknown>, "academic");
            return (
              <button key={opt} type="button" onClick={() => toggleArr("academic", opt)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                style={arr.includes(opt)
                  ? { backgroundColor: "#534ab7", color: "#fff", borderColor: "#534ab7" }
                  : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>
                {arr.includes(opt) ? "✓" : "○"} {opt}
              </button>
            );
          })}
        </div>
        <SectionNotes label="Academic considerations" value={getStr(subjNotes as Record<string, unknown>, "academic")} onChange={(v) => setNote("academic", v)} />
      </div>

      {/* Additional support */}
      <div className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
        <p className="text-sm font-semibold text-gray-700 mb-2">Additional support required</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {SUPPORT_OPTIONS.map((opt) => {
            const arr = getArr(subj as Record<string, unknown>, "support");
            return (
              <button key={opt} type="button" onClick={() => toggleArr("support", opt)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                style={arr.includes(opt)
                  ? { backgroundColor: "#534ab7", color: "#fff", borderColor: "#534ab7" }
                  : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>
                {arr.includes(opt) ? "✓" : "○"} {opt}
              </button>
            );
          })}
        </div>
        <SectionNotes label="Additional support" value={getStr(subjNotes as Record<string, unknown>, "support")} onChange={(v) => setNote("support", v)} />
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

  // Allow parent to push new notes in (after save)
  NotesPanel.push = (note: Note) => setNotes((prev) => [...prev, note]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      await addInterviewNote(studentId, text.trim(), followUp);
      const newNote: Note = { id: Date.now(), content: text.trim(), isFollowUp: followUp, createdAt: new Date().toISOString() };
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
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {notes.length === 0 && <p className="text-xs text-gray-400 italic">No notes yet. Saved consultations will appear here.</p>}
        {notes.map((n) => (
          <div key={n.id} className="rounded-lg px-3 py-2 text-sm"
            style={n.isFollowUp
              ? { backgroundColor: "#fef3c7", border: "1px solid #fcd34d" }
              : n.content.startsWith("📋")
                ? { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }
                : { backgroundColor: "#f5f4fe", border: "1px solid #eeedfe" }}>
            <p className="text-xs mb-1" style={{ color: n.isFollowUp ? "#92400e" : n.content.startsWith("📋") ? "#15803d" : "#9ca3af" }}>
              {n.isFollowUp ? "🔔 Follow-up · " : n.content.startsWith("📋") ? "⚙ Auto-saved · " : ""}{fmtDateTime(n.createdAt)}
            </p>
            <p className="text-gray-800 whitespace-pre-wrap break-words">{n.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a note or update…"
          className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-1 resize-none" style={{ borderColor: "#afa9ec" }} />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} className="rounded" />
            Mark as follow-up session
          </label>
          <button type="submit" disabled={saving || !text.trim()}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: "#534ab7" }}>
            <Send size={13} /> {saving ? "Saving…" : "Add Note"}
          </button>
        </div>
      </form>
    </div>
  );
}
// Allows external push
NotesPanel.push = (_note: Note) => {};

// ── Main Component ────────────────────────────────────────────────────────────

const TAB_NAMES = ["Consultation", "Career Aspirations", "Pathway Awareness", "Referrals", "Outcomes", "Action Plan", "Career Dev.", "Subject Selection"];

export function InterviewStudentClient({ student }: { student: Student }) {
  const [activeTab, setActiveTab] = useState(0);
  const [checklistData, setChecklistData] = useState(student.checklistData);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState(student.notes);
  const router = useRouter();

  async function handleSaveChecklist() {
    setSaving(true);
    try {
      await saveInterviewChecklist(student.id, checklistData);
      // Auto-create a summary note
      const summary = buildChecklistSummary(checklistData);
      await addInterviewNote(student.id, summary, false);
      const autoNote: Note = { id: Date.now(), content: summary, isFollowUp: false, createdAt: new Date().toISOString() };
      setNotes((prev) => [...prev, autoNote]);
      toast.success("Saved — summary added to notes");
      router.refresh();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleFollowUp() {
    if (!confirm("Start a new follow-up session? This will clear the Consultation and Outcomes tabs so you can record the new session. All other data and notes are kept.")) return;
    const cleared = {
      ...checklistData,
      consultationType: [],
      mainReason: [],
      frequency: "",
      tab1Notes: {},
      outcomes: {},
    };
    setChecklistData(cleared);
    setSaving(true);
    try {
      await saveInterviewChecklist(student.id, cleared);
      const followUpNote = `🔔 Follow-up session started — ${new Date().toLocaleDateString("en-AU")}\nConsultation and Outcomes tabs cleared for new entry.`;
      await addInterviewNote(student.id, followUpNote, true);
      const newNote: Note = { id: Date.now(), content: followUpNote, isFollowUp: true, createdAt: new Date().toISOString() };
      setNotes((prev) => [...prev, newNote]);
      setActiveTab(0);
      toast.success("Ready for follow-up interview");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="mb-6">
        <a href="/interview-notes" className="inline-flex items-center gap-1 text-sm font-semibold mb-3 hover:underline" style={{ color: "#534ab7" }}>
          <ChevronLeft size={16} /> Year 10 Interview Notes
        </a>
        <h1 className="text-2xl font-extrabold" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
          {student.lastName}, {student.firstName}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {student.studentId && <span className="mr-3">ID: {student.studentId}</span>}
          {student.email && <span>{student.email}</span>}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Checklist tabs */}
        <div className="w-full rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
          <div className="flex border-b overflow-x-auto" style={{ borderColor: "#afa9ec", backgroundColor: "#f5f4fe" }}>
            {TAB_NAMES.map((name, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className="px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors shrink-0"
                style={activeTab === i
                  ? { color: "#26215c", borderBottom: "2px solid #3d2c8d", backgroundColor: "#fff" }
                  : { color: "#6b7280" }}>
                {name}
              </button>
            ))}
          </div>

          <div className="bg-white p-4">
            {activeTab === 0 && <Tab1 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 1 && <Tab2 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 2 && <Tab3 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 3 && <Tab4 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 4 && <Tab5 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 5 && <Tab6 data={checklistData} onChange={setChecklistData} student={student} />}
            {activeTab === 6 && <Tab7 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 7 && <Tab8 data={checklistData} onChange={setChecklistData} />}
          </div>

          <div className="px-4 py-3 border-t flex items-center justify-between gap-3" style={{ borderColor: "#eeedfe" }}>
            <p className="text-xs text-gray-400">Saving creates a summary entry in Notes &amp; Updates below.</p>
            <div className="flex gap-2">
              <button onClick={handleFollowUp} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border disabled:opacity-50 transition-colors hover:bg-amber-50"
                style={{ color: "#92400e", borderColor: "#fcd34d" }}>
                <RefreshCw size={13} /> Follow-up
              </button>
              <button onClick={handleSaveChecklist} disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                style={{ backgroundColor: "#3d2c8d" }}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Notes panel below */}
        <div className="w-full rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
          <div className="px-4 py-3 font-extrabold text-sm" style={{ backgroundColor: "#3d2c8d", color: "#fff", fontFamily: "var(--font-nunito), sans-serif" }}>
            Notes &amp; Updates
          </div>
          <div className="bg-white p-4">
            <NotesPanel studentId={student.id} initialNotes={notes} />
          </div>
        </div>
      </div>
    </div>
  );
}
