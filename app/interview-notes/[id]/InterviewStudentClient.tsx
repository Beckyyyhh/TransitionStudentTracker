"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Send, Printer, Mail, RefreshCw, ChevronDown, ChevronRight as ChevronRightIcon, Trash2 } from "lucide-react";
import { addInterviewNote, saveInterviewChecklist, deleteInterviewNote, addInterviewStudentToWE, removeInterviewStudentFromWE } from "@/lib/interviewActions";
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
  { key: "workExperience", label: "Work Experience referral" },
  { key: "wellbeing", label: "Student Services / Wellbeing" },
];

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Open", "In Progress", "Closed"];

const CAREER_DEV_ROWS = [
  { key: "selfAwareness", label: "Self-awareness", options: ["Can identify strengths", "Can identify interests", "Needs support identifying strengths and interests"] },
  { key: "careerExploration", label: "Career exploration", options: ["Has researched careers", "Needs help researching careers", "Has not started exploring careers"] },
  { key: "workExperience", label: "Work experience", options: ["Completed", "Arranged", "Interested", "Needs assistance finding a placement"] },
  { key: "resume", label: "Resume", options: ["Has a resume", "Needs to develop a resume", "Needs resume improvement"] },
  { key: "employabilitySkills", label: "Employability skills", options: ["Can identify transferable skills", "Needs help identifying skills", "Discussed communication, teamwork or problem-solving"] },
  { key: "extracurricular", label: "Extracurricular experience", options: ["Part-time employment", "Volunteering", "Sport", "Leadership", "Community involvement", "No experience discussed"] },
  { key: "industryExposure", label: "Industry exposure", options: ["Career expo", "Industry visit", "Work experience", "Employer engagement", "Needs exposure to industries"] },
];

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

function buildFullSummary(data: Record<string, unknown>, studentId: number): string {
  const sections: string[] = [`📋 Consultation saved — ${new Date().toLocaleDateString("en-AU")}`];

  // Tab 1
  const consultLines: string[] = [];
  const types = getArr(data, "consultationType");
  if (types.length) consultLines.push(`  Type: ${types.join(", ")}`);
  const reasons = getArr(data, "mainReason");
  if (reasons.length) consultLines.push(`  Reason: ${reasons.join(", ")}`);
  const freq = getStr(data, "frequency");
  if (freq) consultLines.push(`  Frequency: ${freq}`);
  const t1n = getObj(data, "tab1Notes");
  if (getStr(t1n, "consultationType")) consultLines.push(`  Notes (Type): ${getStr(t1n, "consultationType")}`);
  if (getStr(t1n, "mainReason")) consultLines.push(`  Notes (Reason): ${getStr(t1n, "mainReason")}`);
  if (getStr(t1n, "frequency")) consultLines.push(`  Notes (Frequency): ${getStr(t1n, "frequency")}`);
  if (consultLines.length) sections.push(`── Consultation\n${consultLines.join("\n")}`);

  // Tab 2
  const aspLines: string[] = [];
  const asp = getObj(data, "careerAspirations");
  const aspN = getObj(data, "aspirationNotes");
  for (const { key, label } of CAREER_ASPIRATIONS) {
    const row = getArr(asp as Record<string, unknown>, key);
    const note = getStr(aspN as Record<string, unknown>, key);
    if (row.length || note) aspLines.push(`  ${label}: ${row.join(", ") || "—"}${note ? ` | ${note}` : ""}`);
  }
  if (aspLines.length) sections.push(`── Career Aspirations\n${aspLines.join("\n")}`);

  // Tab 3
  const pathLines: string[] = [];
  const aw = getObj(data, "pathwayAwareness");
  const pathN = getObj(data, "pathwayNotes");
  for (const { key, label } of PATHWAYS) {
    const sel = getStr(aw as Record<string, unknown>, key);
    const note = getStr(pathN as Record<string, unknown>, key);
    if (sel || note) pathLines.push(`  ${label}: ${sel || "—"}${note ? ` | ${note}` : ""}`);
  }
  if (pathLines.length) sections.push(`── Pathway Awareness\n${pathLines.join("\n")}`);

  // Tab 4
  const refLines: string[] = [];
  const refs = getObj(data, "referrals");
  for (const { key, label } of REFERRALS) {
    const row = getObj(refs as Record<string, unknown>, key);
    const statuses = ["made", "pending", "completed"].filter((f) => getBool(row, f));
    const note = getStr(row, "notes");
    if (statuses.length || note) refLines.push(`  ${label}: ${statuses.join(", ") || "—"}${note ? ` | ${note}` : ""}`);
  }
  if (refLines.length) sections.push(`── Referrals\n${refLines.join("\n")}`);

  // Tab 5
  const outcomes = getObj(data, "outcomes");
  const outLines: string[] = [];
  if (getStr(outcomes, "mainOutcome")) outLines.push(`  Outcome: ${getStr(outcomes, "mainOutcome")}`);
  if (getBool(outcomes, "followUpRequired")) {
    const d = getStr(outcomes, "followUpDate");
    outLines.push(`  Follow-up required${d ? ` by ${fmtDate(d)}` : ""}`);
  }
  if (getStr(outcomes, "priority")) outLines.push(`  Priority: ${getStr(outcomes, "priority")}`);
  if (getStr(outcomes, "status")) outLines.push(`  Status: ${getStr(outcomes, "status")}`);
  if (getStr(outcomes, "additionalNotes")) outLines.push(`  Notes: ${getStr(outcomes, "additionalNotes")}`);
  if (outLines.length) sections.push(`── Outcomes\n${outLines.join("\n")}`);

  // Tab 7
  const devLines: string[] = [];
  const cd = getObj(data, "careerDev");
  const cdN = getObj(data, "careerDevNotes");
  for (const { key, label } of CAREER_DEV_ROWS) {
    const row = getArr(cd as Record<string, unknown>, key);
    const note = getStr(cdN as Record<string, unknown>, key);
    if (row.length || note) devLines.push(`  ${label}: ${row.join(", ") || "—"}${note ? ` | ${note}` : ""}`);
  }
  if (devLines.length) sections.push(`── Career Development\n${devLines.join("\n")}`);

  // Tab 8
  const subj = getObj(data, "subjectSelection");
  const subjN = getObj(data, "subjectSelectionNotes");
  const subjLines: string[] = [];
  const subjStatus = getArr(subj as Record<string, unknown>, "status");
  if (subjStatus.length) subjLines.push(`  Status: ${subjStatus.join(", ")}`);
  for (const [k, lbl] of [["subjectsOfInterest", "Subjects of interest"], ["subjectsEnjoys", "Enjoys"], ["subjectsPerformsWell", "Performs well"], ["subjectsChallenging", "Challenging"]] as [string, string][]) {
    const v = getStr(subj as Record<string, unknown>, k);
    if (v) subjLines.push(`  ${lbl}: ${v}`);
  }
  if (getStr(subj as Record<string, unknown>, "prerequisites")) subjLines.push(`  Prerequisites: ${getStr(subj as Record<string, unknown>, "prerequisites")}`);
  const rel = getArr(subj as Record<string, unknown>, "relevance");
  if (rel.length) subjLines.push(`  Relevance: ${rel.join(", ")}`);
  const acad = getArr(subj as Record<string, unknown>, "academic");
  if (acad.length) subjLines.push(`  Academic: ${acad.join(", ")}`);
  const sup = getArr(subj as Record<string, unknown>, "support");
  if (sup.length) subjLines.push(`  Support: ${sup.join(", ")}`);
  for (const [, v] of Object.entries(subjN)) {
    if (v) subjLines.push(`  Note: ${v}`);
  }
  if (subjLines.length) sections.push(`── Subject Selection\n${subjLines.join("\n")}`);

  sections.push(`📎 [View Action Plan](/interview-notes/${studentId}?tab=7)`);

  return sections.join("\n\n");
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function SectionNotes({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-3">
      <label className="block text-xs font-semibold text-gray-400 mb-1">Notes — {label}</label>
      <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Optional notes…"
        className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-1 resize-none bg-gray-50"
        style={{ borderColor: "#e5e7eb" }} />
    </div>
  );
}

function CheckboxChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
      style={checked ? { backgroundColor: "#534ab7", color: "#fff", borderColor: "#534ab7" } : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>
      {checked ? "✓" : "○"} {label}
    </button>
  );
}

function RadioChip({ label, selected, onChange }: { label: string; selected: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
      style={selected ? { backgroundColor: "#3d2c8d", color: "#fff", borderColor: "#3d2c8d" } : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>
      {selected ? "●" : "○"} {label}
    </button>
  );
}

// ── Tabs 1–8 (condensed — same logic as before) ───────────────────────────────

function Tab1({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const types = getArr(data, "consultationType");
  const reasons = getArr(data, "mainReason");
  const freq = getStr(data, "frequency");
  const tab1Notes = getObj(data, "tab1Notes");
  function toggleArr(key: string, arr: string[], val: string) {
    onChange({ ...data, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] });
  }
  function setNote(key: string, val: string) { onChange({ ...data, tab1Notes: { ...tab1Notes, [key]: val } }); }
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">Consultation Type</h3>
        <div className="flex flex-wrap gap-2">{CONSULTATION_TYPES.map((t) => <CheckboxChip key={t} label={t} checked={types.includes(t)} onChange={() => toggleArr("consultationType", types, t)} />)}</div>
        <SectionNotes label="Consultation Type" value={getStr(tab1Notes, "consultationType")} onChange={(v) => setNote("consultationType", v)} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">Main Reason for Visit</h3>
        <div className="flex flex-wrap gap-2">{MAIN_REASONS.map((r) => <CheckboxChip key={r} label={r} checked={reasons.includes(r)} onChange={() => toggleArr("mainReason", reasons, r)} />)}</div>
        <SectionNotes label="Main Reason" value={getStr(tab1Notes, "mainReason")} onChange={(v) => setNote("mainReason", v)} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">Consultation Frequency</h3>
        <div className="flex flex-wrap gap-2">{FREQUENCIES.map((f) => <RadioChip key={f} label={f} selected={freq === f} onChange={() => onChange({ ...data, frequency: f })} />)}</div>
        <SectionNotes label="Frequency" value={getStr(tab1Notes, "frequency")} onChange={(v) => setNote("frequency", v)} />
      </div>
    </div>
  );
}

function Tab2({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const asp = getObj(data, "careerAspirations");
  const aspN = getObj(data, "aspirationNotes");
  function toggleOption(rowKey: string, opt: string) {
    const row = getArr(asp as Record<string, unknown>, rowKey);
    onChange({ ...data, careerAspirations: { ...asp, [rowKey]: row.includes(opt) ? row.filter((x) => x !== opt) : [...row, opt] } });
  }
  function setNote(k: string, v: string) { onChange({ ...data, aspirationNotes: { ...aspN, [k]: v } }); }
  return (
    <div className="space-y-4">
      {CAREER_ASPIRATIONS.map(({ key, label }) => {
        const row = getArr(asp as Record<string, unknown>, key);
        return (
          <div key={key} className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
            <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {ASPIRATION_OPTIONS.map((opt) => (
                <button key={opt} type="button" onClick={() => toggleOption(key, opt)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                  style={row.includes(opt) ? { backgroundColor: "#534ab7", color: "#fff", borderColor: "#534ab7" } : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>
                  {row.includes(opt) ? "✓" : "○"} {opt}
                </button>
              ))}
            </div>
            <SectionNotes label={label} value={getStr(aspN as Record<string, unknown>, key)} onChange={(v) => setNote(key, v)} />
          </div>
        );
      })}
    </div>
  );
}

function Tab3({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const aw = getObj(data, "pathwayAwareness");
  const pathN = getObj(data, "pathwayNotes");
  function setOption(k: string, opt: string) {
    onChange({ ...data, pathwayAwareness: { ...aw, [k]: getStr(aw as Record<string, unknown>, k) === opt ? "" : opt } });
  }
  function setNote(k: string, v: string) { onChange({ ...data, pathwayNotes: { ...pathN, [k]: v } }); }
  return (
    <div className="space-y-4">
      {PATHWAYS.map(({ key, label, links }) => {
        const selected = getStr(aw as Record<string, unknown>, key);
        return (
          <div key={key} className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <p className="text-sm font-semibold text-gray-700">{label}</p>
              {links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold hover:underline" style={{ color: "#534ab7" }}>🔗 {l.label}</a>)}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {PATHWAY_OPTIONS.map((opt) => (
                <button key={opt} type="button" onClick={() => setOption(key, opt)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                  style={selected === opt ? { backgroundColor: "#3d2c8d", color: "#fff", borderColor: "#3d2c8d" } : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>
                  {selected === opt ? "●" : "○"} {opt}
                </button>
              ))}
            </div>
            <SectionNotes label={label} value={getStr(pathN as Record<string, unknown>, key)} onChange={(v) => setNote(key, v)} />
          </div>
        );
      })}
      <p className="text-xs text-gray-400 px-1"><strong>Pathway Interest</strong> on the main list is derived from &ldquo;Interested&rdquo; or &ldquo;Researched&rdquo; rows.</p>
    </div>
  );
}

function Tab4({ data, onChange, onWEPending, onWEUnpending }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; onWEPending: () => Promise<void>; onWEUnpending: () => Promise<boolean> }) {
  const refs = getObj(data, "referrals");
  function toggle(key: string, field: string) {
    const row = getObj(refs as Record<string, unknown>, key);
    onChange({ ...data, referrals: { ...refs, [key]: { ...row, [field]: !row[field] } } });
  }
  async function toggleWEPending() {
    const row = getObj(refs as Record<string, unknown>, "workExperience");
    const nowPending = !getBool(row, "pending");
    if (nowPending) {
      onChange({ ...data, referrals: { ...refs, workExperience: { ...row, pending: true } } });
      await onWEPending();
    } else {
      // Ask before removing
      const remove = await onWEUnpending();
      onChange({ ...data, referrals: { ...refs, workExperience: { ...row, pending: false } } });
      // If they declined removal we still untick the checkbox but don't touch WE tab
    }
  }
  function setNote(key: string, val: string) {
    const row = getObj(refs as Record<string, unknown>, key);
    onChange({ ...data, referrals: { ...refs, [key]: { ...row, notes: val } } });
  }
  return (
    <div className="space-y-4 p-4">
      {REFERRALS.map(({ key, label }) => {
        const row = getObj(refs as Record<string, unknown>, key);
        const isWE = key === "workExperience";
        return (
          <div key={key} className="border rounded-lg p-4" style={{ borderColor: "#eeedfe" }}>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="font-semibold text-gray-700">{label}</span>
              {!isWE && <CheckboxChip label="Made" checked={getBool(row, "made")} onChange={() => toggle(key, "made")} />}
              <CheckboxChip label="Pending" checked={getBool(row, "pending")} onChange={isWE ? toggleWEPending : () => toggle(key, "pending")} />
              <CheckboxChip label="Completed" checked={getBool(row, "completed")} onChange={() => toggle(key, "completed")} />
              {isWE && getBool(row, "pending") && (
                <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full">Added to Work Experience tab</span>
              )}
            </div>
            <SectionNotes label={label} value={getStr(row, "notes")} onChange={(v) => setNote(key, v)} />
          </div>
        );
      })}
    </div>
  );
}

function Tab5({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const outcomes = getObj(data, "outcomes");
  function set(key: string, val: unknown) { onChange({ ...data, outcomes: { ...outcomes, [key]: val } }); }
  const followUp = getBool(outcomes, "followUpRequired");
  const followUpDate = getStr(outcomes, "followUpDate");
  const daysUntil = followUpDate ? Math.round((new Date(followUpDate).getTime() - Date.now()) / 86400000) : null;
  const alertSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 3;
  return (
    <div className="space-y-5 p-4">
      {alertSoon && <div className="rounded-lg px-4 py-3 text-sm font-semibold" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>⚠ Follow-up is {daysUntil === 0 ? "today" : `in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`}!</div>}
      <div><label className="block text-sm font-semibold text-gray-700 mb-1">Main Outcome</label>
        <textarea rows={2} value={getStr(outcomes, "mainOutcome")} onChange={(e) => set("mainOutcome", e.target.value)} className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1 resize-none" style={{ borderColor: "#d1d5db" }} placeholder="Describe the main outcome…" /></div>
      <div className="flex flex-wrap gap-6">
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Follow-up Required</label>
          <div className="flex gap-2"><RadioChip label="Yes" selected={followUp} onChange={() => set("followUpRequired", true)} /><RadioChip label="No" selected={!followUp} onChange={() => set("followUpRequired", false)} /></div></div>
        {followUp && <div><label className="block text-sm font-semibold text-gray-700 mb-1">Follow-up Date</label>
          <input type="date" value={followUpDate} onChange={(e) => set("followUpDate", e.target.value)} className="text-sm border rounded px-3 py-1.5 outline-none focus:ring-1" style={{ borderColor: "#d1d5db" }} /></div>}
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
          <div className="flex gap-2">{PRIORITIES.map((p) => <RadioChip key={p} label={p} selected={getStr(outcomes, "priority") === p} onChange={() => set("priority", p)} />)}</div></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
          <div className="flex gap-2">{STATUSES.map((s) => <RadioChip key={s} label={s} selected={getStr(outcomes, "status") === s} onChange={() => set("status", s)} />)}</div></div>
      </div>
      <div><label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes</label>
        <textarea rows={3} value={getStr(outcomes, "additionalNotes")} onChange={(e) => set("additionalNotes", e.target.value)} className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1 resize-none" style={{ borderColor: "#d1d5db" }} placeholder="Any additional observations…" /></div>
    </div>
  );
}

function Tab6({ data, onChange, student }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; student: Student }) {
  const plan = getObj(data, "actionPlan");
  const date = getStr(plan, "date", new Date().toISOString().slice(0, 10));
  const content = getStr(plan, "content");
  const resources = getStr(plan, "resources");
  const deadline = getStr(plan, "deadline");
  function set(key: string, val: string) { onChange({ ...data, actionPlan: { ...plan, [key]: val } }); }
  function handleEmail() {
    const body = [`Action Plan — ${student.firstName} ${student.lastName}`, `Date: ${date}`, ``, content ? `Overview:\n${content}` : "", getStr(plan, "goal1") ? `Goal 1: ${getStr(plan, "goal1")}` : "", getStr(plan, "goal2") ? `Goal 2: ${getStr(plan, "goal2")}` : "", getStr(plan, "goal3") ? `Goal 3: ${getStr(plan, "goal3")}` : "", resources ? `Resources:\n${resources}` : "", deadline ? `Target: ${deadline}` : "", ``, `— Canley Vale HS Careers Hub`].filter(Boolean).join("\n");
    window.location.href = `mailto:${encodeURIComponent(student.email)}?subject=${encodeURIComponent("Your Career Action Plan — Canley Vale HS")}&body=${encodeURIComponent(body)}`;
  }
  return (
    <div className="space-y-5 p-4">
      <style>{`@media print { body > * { display: none !important; } .print-action-plan { display: block !important; position: fixed; top: 0; left: 0; width: 100%; background: white; z-index: 99999; padding: 40px; } } .print-action-plan { display: none; }`}</style>
      <div className="print-action-plan">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Career Action Plan</h1>
        <p style={{ fontSize: 14, marginBottom: 2 }}><strong>Student:</strong> {student.firstName} {student.lastName} {student.studentId ? `(${student.studentId})` : ""}</p>
        <p style={{ fontSize: 14, marginBottom: 16 }}><strong>Date:</strong> {date}</p>
        {content && <><p style={{ fontWeight: 700, marginBottom: 4 }}>Overview</p><p style={{ fontSize: 14, whiteSpace: "pre-wrap", marginBottom: 16 }}>{content}</p></>}
        {(getStr(plan, "goal1") || getStr(plan, "goal2") || getStr(plan, "goal3")) && (<><p style={{ fontWeight: 700, marginBottom: 4 }}>Goals</p>{["goal1", "goal2", "goal3"].map((k, i) => getStr(plan, k) ? <p key={k} style={{ fontSize: 14, marginBottom: 4 }}>{i + 1}. {getStr(plan, k)}</p> : null)}</>)}
        {resources && <><p style={{ fontWeight: 700, marginTop: 12, marginBottom: 4 }}>Resources</p><p style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{resources}</p></>}
        {deadline && <p style={{ fontSize: 14, marginTop: 12 }}><strong>Target:</strong> {deadline}</p>}
        <p style={{ fontSize: 12, marginTop: 32, color: "#6b7280" }}>Canley Vale HS — Careers Hub</p>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-bold text-gray-700">Action Plan</h3>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-gray-50" style={{ color: "#374151", borderColor: "#d1d5db" }}><Printer size={14} /> Print / Save PDF</button>
          <button type="button" onClick={handleEmail} disabled={!student.email} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40" style={{ backgroundColor: "#534ab7" }} title={student.email ? `Email to ${student.email}` : "No email"}><Mail size={14} /> Email to Student</button>
        </div>
      </div>
      <div className="flex items-center gap-3"><label className="text-sm font-semibold text-gray-700 shrink-0">Plan Date</label><input type="date" value={date} onChange={(e) => set("date", e.target.value)} className="text-sm border rounded px-3 py-1.5 outline-none focus:ring-1" style={{ borderColor: "#d1d5db" }} /></div>
      <div><label className="block text-sm font-semibold text-gray-700 mb-1">Overview / Summary</label><textarea rows={3} value={content} onChange={(e) => set("content", e.target.value)} className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1 resize-none" style={{ borderColor: "#d1d5db" }} placeholder="Brief summary…" /></div>
      <div className="space-y-3"><label className="block text-sm font-semibold text-gray-700">Goals / Action Steps</label>
        {(["goal1", "goal2", "goal3"] as const).map((k, i) => (
          <div key={k} className="flex items-start gap-2"><span className="text-xs font-bold text-gray-400 mt-2.5 shrink-0 w-10">Goal {i + 1}</span><input type="text" value={getStr(plan, k)} onChange={(e) => set(k, e.target.value)} className="flex-1 text-sm border rounded px-3 py-2 outline-none focus:ring-1" style={{ borderColor: "#d1d5db" }} placeholder="e.g. Research TAFE courses…" /></div>
        ))}</div>
      <div><label className="block text-sm font-semibold text-gray-700 mb-1">Resources / Support</label><textarea rows={2} value={resources} onChange={(e) => set("resources", e.target.value)} className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1 resize-none" style={{ borderColor: "#d1d5db" }} placeholder="e.g. MyFuture, TAFE open days…" /></div>
      <div><label className="block text-sm font-semibold text-gray-700 mb-1">Target Completion Date</label><input type="date" value={deadline} onChange={(e) => set("deadline", e.target.value)} className="text-sm border rounded px-3 py-1.5 outline-none focus:ring-1" style={{ borderColor: "#d1d5db" }} /></div>
      {!student.email && <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">No email address on file.</p>}
    </div>
  );
}

function Tab7({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const cd = getObj(data, "careerDev");
  const cdN = getObj(data, "careerDevNotes");
  function toggle(rowKey: string, opt: string) {
    const row = getArr(cd as Record<string, unknown>, rowKey);
    onChange({ ...data, careerDev: { ...cd, [rowKey]: row.includes(opt) ? row.filter((x) => x !== opt) : [...row, opt] } });
  }
  function setNote(k: string, v: string) { onChange({ ...data, careerDevNotes: { ...cdN, [k]: v } }); }
  return (
    <div className="space-y-4">
      {CAREER_DEV_ROWS.map(({ key, label, options }) => {
        const row = getArr(cd as Record<string, unknown>, key);
        return (
          <div key={key} className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
            <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {options.map((opt) => (
                <button key={opt} type="button" onClick={() => toggle(key, opt)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                  style={row.includes(opt) ? { backgroundColor: "#534ab7", color: "#fff", borderColor: "#534ab7" } : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>
                  {row.includes(opt) ? "✓" : "○"} {opt}
                </button>
              ))}
            </div>
            <SectionNotes label={label} value={getStr(cdN as Record<string, unknown>, key)} onChange={(v) => setNote(key, v)} />
          </div>
        );
      })}
    </div>
  );
}

function Tab8({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const subj = getObj(data, "subjectSelection");
  const subjN = getObj(data, "subjectSelectionNotes");
  function toggleArr(key: string, opt: string) {
    const arr = getArr(subj as Record<string, unknown>, key);
    onChange({ ...data, subjectSelection: { ...subj, [key]: arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt] } });
  }
  function setRadio(key: string, opt: string) {
    onChange({ ...data, subjectSelection: { ...subj, [key]: getStr(subj as Record<string, unknown>, key) === opt ? "" : opt } });
  }
  function setText(key: string, val: string) { onChange({ ...data, subjectSelection: { ...subj, [key]: val } }); }
  function setNote(key: string, val: string) { onChange({ ...data, subjectSelectionNotes: { ...subjN, [key]: val } }); }
  const TEXT_FIELDS: [string, string][] = [["subjectsOfInterest", "Subjects of interest"], ["subjectsEnjoys", "Subjects the student enjoys"], ["subjectsPerformsWell", "Subjects the student performs well in"], ["subjectsChallenging", "Subjects the student finds challenging"]];
  function MultiChips({ stateKey, opts }: { stateKey: string; opts: string[] }) {
    const arr = getArr(subj as Record<string, unknown>, stateKey);
    return (<div className="flex flex-wrap gap-2 mb-2">{opts.map((opt) => (<button key={opt} type="button" onClick={() => toggleArr(stateKey, opt)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all" style={arr.includes(opt) ? { backgroundColor: "#534ab7", color: "#fff", borderColor: "#534ab7" } : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>{arr.includes(opt) ? "✓" : "○"} {opt}</button>))}</div>);
  }
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
        <p className="text-sm font-semibold text-gray-700 mb-2">Subject selection status</p>
        <MultiChips stateKey="status" opts={SUBJ_STATUS_OPTIONS} />
        <SectionNotes label="Status" value={getStr(subjN as Record<string, unknown>, "status")} onChange={(v) => setNote("status", v)} />
      </div>
      {TEXT_FIELDS.map(([key, label]) => (
        <div key={key} className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
          <input type="text" value={getStr(subj as Record<string, unknown>, key)} onChange={(e) => setText(key, e.target.value)} className="w-full text-sm border rounded px-3 py-2 outline-none focus:ring-1" style={{ borderColor: "#d1d5db" }} placeholder="Enter details…" />
        </div>
      ))}
      <div className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
        <p className="text-sm font-semibold text-gray-700 mb-2">Understanding of prerequisites</p>
        <div className="flex flex-wrap gap-2 mb-2">{PREREQ_OPTIONS.map((opt) => (<button key={opt} type="button" onClick={() => setRadio("prerequisites", opt)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all" style={getStr(subj as Record<string, unknown>, "prerequisites") === opt ? { backgroundColor: "#3d2c8d", color: "#fff", borderColor: "#3d2c8d" } : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }}>{getStr(subj as Record<string, unknown>, "prerequisites") === opt ? "●" : "○"} {opt}</button>))}</div>
        <SectionNotes label="Prerequisites" value={getStr(subjN as Record<string, unknown>, "prerequisites")} onChange={(v) => setNote("prerequisites", v)} />
      </div>
      <div className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
        <p className="text-sm font-semibold text-gray-700 mb-2">Understanding of subject relevance</p>
        <MultiChips stateKey="relevance" opts={RELEVANCE_OPTIONS} />
        <SectionNotes label="Relevance" value={getStr(subjN as Record<string, unknown>, "relevance")} onChange={(v) => setNote("relevance", v)} />
      </div>
      <div className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
        <p className="text-sm font-semibold text-gray-700 mb-2">Academic considerations</p>
        <MultiChips stateKey="academic" opts={ACADEMIC_OPTIONS} />
        <SectionNotes label="Academic" value={getStr(subjN as Record<string, unknown>, "academic")} onChange={(v) => setNote("academic", v)} />
      </div>
      <div className="border rounded-lg p-3" style={{ borderColor: "#eeedfe" }}>
        <p className="text-sm font-semibold text-gray-700 mb-2">Additional support required</p>
        <MultiChips stateKey="support" opts={SUPPORT_OPTIONS} />
        <SectionNotes label="Support" value={getStr(subjN as Record<string, unknown>, "support")} onChange={(v) => setNote("support", v)} />
      </div>
    </div>
  );
}

// ── Collapsible Note Entry ─────────────────────────────────────────────────────

function renderNoteContent(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) return <a key={i} href={m[2]} className="underline font-semibold" style={{ color: "#534ab7" }}>{m[1]}</a>;
    return <span key={i}>{part}</span>;
  });
}

function NoteEntry({ note, onDelete }: { note: Note; onDelete: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isAuto = note.content.startsWith("📋");
  const isFollowUpNote = note.isFollowUp;
  const firstLine = note.content.split("\n")[0];
  const hasMore = note.content.includes("\n");

  const bgStyle = isFollowUpNote
    ? { backgroundColor: "#fef3c7", border: "1px solid #fcd34d" }
    : isAuto
      ? { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }
      : { backgroundColor: "#f5f4fe", border: "1px solid #eeedfe" };
  const labelColor = isFollowUpNote ? "#92400e" : isAuto ? "#15803d" : "#9ca3af";
  const prefix = isFollowUpNote ? "🔔 Follow-up · " : isAuto ? "⚙ Auto-saved · " : "";

  async function handleDelete() {
    if (!confirm("Delete this note?")) return;
    setDeleting(true);
    try { onDelete(note.id); } finally { setDeleting(false); }
  }

  return (
    <div
      className="rounded-lg px-3 py-2 text-sm select-none"
      style={{ ...bgStyle, cursor: hasMore ? "pointer" : "default" }}
      onClick={hasMore ? () => setExpanded((v) => !v) : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs mb-1" style={{ color: labelColor }}>{prefix}{fmtDateTime(note.createdAt)}</p>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {hasMore && (
            <span className="text-gray-400">
              {expanded ? <ChevronDown size={14} /> : <ChevronRightIcon size={14} />}
            </span>
          )}
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-40"
            title="Delete note">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {expanded || !hasMore ? (
        <p className="text-gray-800 whitespace-pre-wrap break-words">{renderNoteContent(note.content)}</p>
      ) : (
        <p className="text-gray-800 truncate">{firstLine}</p>
      )}
    </div>
  );
}

// ── Notes Panel ───────────────────────────────────────────────────────────────

function NotesPanel({
  studentId,
  notes,
  onNewNote,
  onDeleteNote,
}: {
  studentId: number;
  notes: Note[];
  onNewNote: (note: Note) => void;
  onDeleteNote: (id: number) => void;
}) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [followUp, setFollowUp] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      const saved = await addInterviewNote(studentId, text.trim(), followUp);
      onNewNote({ id: saved.id, content: saved.content, isFollowUp: saved.isFollowUp, createdAt: saved.createdAt.toISOString() });
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
        {notes.map((n) => <NoteEntry key={n.id} note={n} onDelete={onDeleteNote} />)}
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

// ── Main Component ────────────────────────────────────────────────────────────

const TAB_NAMES = ["Consultation", "Career Aspirations", "Pathway Awareness", "Career Dev.", "Subject Selection", "Referrals", "Outcomes", "Action Plan"];

export function InterviewStudentClient({ student }: { student: Student }) {
  const [activeTab, setActiveTab] = useState(0);
  const [checklistData, setChecklistData] = useState(student.checklistData);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<Note[]>(student.notes);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab !== null) {
      const idx = parseInt(tab);
      if (!isNaN(idx) && idx >= 0 && idx < TAB_NAMES.length) setActiveTab(idx);
    }
  }, []);

  function pushNote(note: Note) {
    setNotes((prev) => [...prev, note]);
  }

  async function handleWEPending() {
    const result = await addInterviewStudentToWE(student.id);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  }

  async function handleWEUnpending(): Promise<boolean> {
    if (!confirm(`Remove ${student.firstName} ${student.lastName} from the Work Experience tab?`)) return false;
    const result = await removeInterviewStudentFromWE(student.id);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
    return result.ok;
  }

  async function handleDeleteNote(id: number) {
    await deleteInterviewNote(id, student.id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    router.refresh();
  }

  async function handleSaveChecklist() {
    setSaving(true);
    try {
      await saveInterviewChecklist(student.id, checklistData);
      const summary = buildFullSummary(checklistData, student.id);
      const saved = await addInterviewNote(student.id, summary, false);
      pushNote({ id: saved.id, content: saved.content, isFollowUp: saved.isFollowUp, createdAt: saved.createdAt.toISOString() });
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
    const cleared = { ...checklistData, consultationType: [], mainReason: [], frequency: "", tab1Notes: {}, outcomes: {} };
    setChecklistData(cleared);
    setSaving(true);
    try {
      await saveInterviewChecklist(student.id, cleared);
      const msg = `🔔 Follow-up session started — ${new Date().toLocaleDateString("en-AU")}\nConsultation and Outcomes tabs cleared for new entry.`;
      const saved = await addInterviewNote(student.id, msg, true);
      pushNote({ id: saved.id, content: saved.content, isFollowUp: saved.isFollowUp, createdAt: saved.createdAt.toISOString() });
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
        <div className="w-full rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
          <div className="flex border-b overflow-x-auto" style={{ borderColor: "#afa9ec", backgroundColor: "#f5f4fe" }}>
            {TAB_NAMES.map((name, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className="px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors shrink-0"
                style={activeTab === i ? { color: "#26215c", borderBottom: "2px solid #3d2c8d", backgroundColor: "#fff" } : { color: "#6b7280" }}>
                {name}
              </button>
            ))}
          </div>
          <div className="bg-white p-4">
            {activeTab === 0 && <Tab1 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 1 && <Tab2 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 2 && <Tab3 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 3 && <Tab7 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 4 && <Tab8 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 5 && <Tab4 data={checklistData} onChange={setChecklistData} onWEPending={handleWEPending} onWEUnpending={handleWEUnpending} />}
            {activeTab === 6 && <Tab5 data={checklistData} onChange={setChecklistData} />}
            {activeTab === 7 && <Tab6 data={checklistData} onChange={setChecklistData} student={student} />}
          </div>
          <div className="px-4 py-3 border-t flex items-center justify-between gap-3" style={{ borderColor: "#eeedfe" }}>
            <p className="text-xs text-gray-400">Saving creates a full summary entry in Notes &amp; Updates below.</p>
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

        <div className="w-full rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
          <div className="px-4 py-3 font-extrabold text-sm" style={{ backgroundColor: "#3d2c8d", color: "#fff", fontFamily: "var(--font-nunito), sans-serif" }}>
            Notes &amp; Updates
          </div>
          <div className="bg-white p-4">
            <NotesPanel studentId={student.id} notes={notes} onNewNote={pushNote} onDeleteNote={handleDeleteNote} />
          </div>
        </div>
      </div>
    </div>
  );
}
