"use client";

import { useState } from "react";
import { StudentCard } from "@/components/StudentCard";
import { YEAR_GROUPS } from "@/lib/constants";

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  year: number;
  referrer: string;
  taskCount: number;
};

export function StudentsClientPage({ students }: { students: Student[] }) {
  const [q, setQ] = useState("");
  const [year, setYear] = useState<number | null>(null);

  const filtered = students.filter((s) => {
    const matchesYear = year === null || s.year === year;
    const matchesQ =
      q === "" ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q.toLowerCase()) ||
      s.referrer.toLowerCase().includes(q.toLowerCase());
    return matchesYear && matchesQ;
  });

  const grouped = year === null && q === ""
    ? filtered.reduce<Record<number, Student[]>>((acc, s) => {
        (acc[s.year] ??= []).push(s);
        return acc;
      }, {})
    : null;

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

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400" style={{ border: "1px solid #afa9ec" }}>
          No students found. <a href="/students/new" style={{ color: "#3d2c8d" }} className="underline">Add the first one.</a>
        </div>
      ) : grouped ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([yr, list]) => (
            <div key={yr}>
              <h2 className="text-lg font-extrabold mb-3" style={{ color: "#3d2c8d", fontFamily: "var(--font-nunito), sans-serif" }}>
                Year {yr} <span className="text-sm font-semibold text-gray-400">— {list.length} student{list.length !== 1 ? "s" : ""}</span>
              </h2>
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
    </>
  );
}
