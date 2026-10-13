"use client";

import { useState } from "react";
import { StudentCard } from "@/components/StudentCard";
import { YEAR_GROUPS } from "@/lib/constants";
import { setYearGroupInactive } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive } from "lucide-react";

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  year: number;
  referrer: string;
  atRisk: boolean;
  inactive: boolean;
  taskCount: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
};

export function StudentsClientPage({ students }: { students: Student[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [atRiskOnly, setAtRiskOnly] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [archivingYear, setArchivingYear] = useState<number | null>(null);

  const active = students.filter((s) => !s.inactive);
  const inactive = students.filter((s) => s.inactive);

  const filtered = active.filter((s) => {
    const matchesYear = year === null || s.year === year;
    const matchesQ =
      q === "" ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q.toLowerCase()) ||
      s.referrer.toLowerCase().includes(q.toLowerCase());
    const matchesRisk = !atRiskOnly || s.atRisk;
    return matchesYear && matchesQ && matchesRisk;
  });

  const grouped = year === null && q === "" && !atRiskOnly
    ? filtered.reduce<Record<number, Student[]>>((acc, s) => {
        (acc[s.year] ??= []).push(s);
        return acc;
      }, {})
    : null;

  const filteredInactive = inactive.filter((s) => {
    const matchesQ = q === "" || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q.toLowerCase());
    return matchesQ;
  });

  async function handleArchiveYear(yr: number) {
    if (!confirm(`Move all Year ${yr} students to Inactive? You can undo this from each student's profile.`)) return;
    setArchivingYear(yr);
    try {
      await setYearGroupInactive(yr);
      toast.success(`Year ${yr} students moved to Inactive`);
      router.refresh();
    } catch {
      toast.error("Failed to archive year group");
    } finally {
      setArchivingYear(null);
    }
  }

  const StudentGrid = ({ list }: { list: Student[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {list.map((s) => (
        <StudentCard key={s.id} {...s} />
      ))}
    </div>
  );

  return (
    <>
      {/* Filters */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <div className="px-4 py-2.5 text-sm font-extrabold text-white" style={{ background: "linear-gradient(135deg, #3d2c8d 0%, #534ab7 100%)", fontFamily: "var(--font-nunito), sans-serif" }}>
          Filter Students
        </div>
        <div className="bg-white p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or referrer…"
              className="border rounded-md px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2"
              style={{ borderColor: "#afa9ec" }}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setAtRiskOnly(!atRiskOnly)}
                className="px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors"
                style={atRiskOnly
                  ? { backgroundColor: "#dc2626", borderColor: "#dc2626", color: "white" }
                  : { borderColor: "#afa9ec", backgroundColor: "white", color: "#6b7280" }}
              >
                ⚠ At Risk
              </button>
              <button
                onClick={() => setYear(null)}
                className="px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors"
                style={year === null ? { backgroundColor: "#3d2c8d", borderColor: "#3d2c8d", color: "white" } : { borderColor: "#afa9ec", backgroundColor: "white", color: "#534ab7" }}
              >
                All Years
              </button>
              {YEAR_GROUPS.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setYear(year === yr ? null : yr)}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors"
                  style={year === yr ? { backgroundColor: "#3d2c8d", borderColor: "#3d2c8d", color: "white" } : { borderColor: "#afa9ec", backgroundColor: "white", color: "#534ab7" }}
                >
                  Year {yr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active students */}
      {filtered.length === 0 && !showInactive ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400" style={{ border: "1px solid #afa9ec" }}>
          No students found. <a href="/students/new" style={{ color: "#3d2c8d" }} className="underline">Add the first one.</a>
        </div>
      ) : grouped ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([yr, list]) => (
            <div key={yr}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-extrabold" style={{ color: "#3d2c8d", fontFamily: "var(--font-nunito), sans-serif" }}>
                  Year {yr} <span className="text-sm font-semibold text-gray-400">— {list.length} student{list.length !== 1 ? "s" : ""}</span>
                </h2>
                <button
                  onClick={() => handleArchiveYear(Number(yr))}
                  disabled={archivingYear === Number(yr)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors disabled:opacity-50"
                  style={{ borderColor: "#d1d5db", color: "#6b7280", backgroundColor: "white" }}
                  title={`Move all Year ${yr} students to Inactive`}
                >
                  <Archive size={12} />
                  {archivingYear === Number(yr) ? "Moving…" : "Move to Inactive"}
                </button>
              </div>
              <StudentGrid list={list} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-3">{filtered.length} student{filtered.length !== 1 ? "s" : ""} found</p>
          <StudentGrid list={filtered} />
        </>
      )}

      {/* Inactive students — collapsed section */}
      {inactive.length > 0 && (
        <div className="mt-10 rounded-xl overflow-hidden" style={{ border: "1px solid #d1d5db" }}>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <Archive size={15} />
              Inactive Students
              <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{inactive.length}</span>
            </span>
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
              {showInactive ? "Hide" : "View"}
              <span style={{ transform: showInactive ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.2s" }}>▾</span>
            </span>
          </button>
          {showInactive && (
            <div className="p-5 bg-white">
              {filteredInactive.length === 0 ? (
                <p className="text-sm text-gray-400">No inactive students match your search.</p>
              ) : (
                <div className="opacity-60">
                  <StudentGrid list={filteredInactive} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
