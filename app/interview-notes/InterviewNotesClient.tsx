"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Upload, Download, Trash2, ChevronRight } from "lucide-react";
import { clearAllInterviewStudents } from "@/lib/interviewActions";
import { fmtDateTime } from "@/lib/dateFormat";

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  latestNote: { content: string; createdAt: string } | null;
  checklistData: Record<string, unknown>;
};

function derivePathwayInterest(data: Record<string, unknown>): string {
  const awareness = data.pathwayAwareness as Record<string, string> | undefined;
  if (!awareness) return "—";
  const interested = Object.entries(awareness)
    .filter(([, v]) => v === "Interested" || v === "Researched")
    .map(([k]) => PATHWAY_LABELS[k] ?? k);
  return interested.length > 0 ? interested.join(", ") : "—";
}

const PATHWAY_LABELS: Record<string, string> = {
  university: "University",
  tafe: "TAFE/VET",
  apprenticeship: "Apprenticeship",
  sbat: "SBAT",
  gapYear: "Gap Year",
  employment: "Employment",
  other: "Other",
};

function deriveFollowUp(data: Record<string, unknown>): string {
  const outcomes = data.outcomes as Record<string, unknown> | undefined;
  return outcomes?.followUpRequired ? "Yes" : "No";
}

function followUpDaysUntil(data: Record<string, unknown>): number | null {
  const outcomes = (data.outcomes ?? {}) as Record<string, unknown>;
  if (!outcomes.followUpRequired) return null;
  const date = outcomes.followUpDate as string;
  if (!date) return null;
  const diff = Math.round((new Date(date).getTime() - Date.now()) / 86400000);
  return diff >= 0 && diff <= 3 ? diff : null;
}

export function InterviewNotesClient({ students: initialStudents }: { students: Student[] }) {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState(initialStudents);
  const [navigatingId, setNavigatingId] = useState<number | null>(null);

  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/interview-notes/import", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Import failed");
      toast.success(`Imported ${json.count} students`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleExport() {
    window.location.href = "/api/interview-notes/export";
  }

  async function handleClearAll() {
    if (!confirm("Remove all Year 10 interview students from this tab? This cannot be undone.\n\nThis does NOT affect students on other tabs.")) return;
    setClearing(true);
    try {
      await clearAllInterviewStudents();
      setStudents([]);
      toast.success("All Year 10 interview students removed");
      router.refresh();
    } finally {
      setClearing(false);
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: "#eeedfe" }}>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-lg border px-3 py-2" style={{ borderColor: "#afa9ec" }}>
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search students…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>

        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-colors"
          style={{ backgroundColor: "#534ab7" }}
        >
          <Upload size={14} />
          {importing ? "Importing…" : "Import Excel"}
        </button>

        <button
          onClick={handleExport}
          disabled={students.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border disabled:opacity-40 transition-colors hover:bg-purple-50"
          style={{ color: "#534ab7", borderColor: "#afa9ec" }}
        >
          <Download size={14} />
          Export Excel
        </button>

        <button
          onClick={handleClearAll}
          disabled={clearing || students.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
        >
          <Trash2 size={14} />
          {clearing ? "Clearing…" : "Remove All"}
        </button>
      </div>

      {/* Template download hint */}
      <div className="px-4 py-2 bg-purple-50/50 border-b text-xs text-gray-500" style={{ borderColor: "#eeedfe" }}>
        Excel template columns: <span className="font-semibold">First Name, Surname, Student ID, Email</span>
        {" · "}
        <a
          href="/api/interview-notes/template"
          className="font-semibold hover:underline"
          style={{ color: "#534ab7" }}
        >
          Download blank template
        </a>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-400 text-sm">
          {students.length === 0 ? "No students yet — import an Excel spreadsheet to get started." : "No students match your search."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#eeedfe" }}>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Student ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Latest Note</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Pathway Interest</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Follow-up</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b cursor-pointer transition-all"
                  style={{
                    borderColor: "#eeedfe",
                    backgroundColor: navigatingId === s.id ? "#ede9ff" : undefined,
                    opacity: navigatingId !== null && navigatingId !== s.id ? 0.5 : 1,
                  }}
                  onClick={() => { setNavigatingId(s.id); router.push(`/interview-notes/${s.id}`); }}
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: "#26215c" }}>
                    <span className="inline-flex items-center gap-2">
                      {s.lastName}, {s.firstName}
                      {navigatingId === s.id && (
                        <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-purple-300 border-t-purple-700 animate-spin" />
                      )}
                    </span>
                    {(() => {
                      const days = followUpDaysUntil(s.checklistData);
                      if (days === null) return null;
                      const label = days === 0 ? "Follow-up today!" : days === 1 ? "Follow-up tomorrow" : `Follow-up in ${days} days`;
                      return (
                        <span className="ml-2 inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
                          ⚠ {label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.studentId || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email || "—"}</td>
                  <td className="px-4 py-3 max-w-xs">
                    {s.latestNote ? (
                      <span className="text-xs text-gray-600 leading-relaxed">
                        <span className="block text-gray-400 text-xs">{fmtDateTime(s.latestNote.createdAt)}</span>
                        {s.latestNote.content.length > 80
                          ? s.latestNote.content.slice(0, 80) + "…"
                          : s.latestNote.content}
                      </span>
                    ) : (
                      <span className="text-gray-300 italic text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {derivePathwayInterest(s.checklistData)}
                  </td>
                  <td className="px-4 py-3">
                    {deriveFollowUp(s.checklistData) === "Yes" ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>Yes</span>
                    ) : (
                      <span className="text-xs text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
