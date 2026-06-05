"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { YEAR_GROUPS } from "@/lib/constants";

export function StudentsFilters({
  currentYear,
  currentQ,
}: {
  currentYear?: string;
  currentQ?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(currentQ ?? "");

  function applyFilters(year?: string, search?: string) {
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (search) params.set("q", search);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && applyFilters(currentYear, q)}
        placeholder="Search by name or referrer…"
        className="border rounded-md px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2"
        style={{ borderColor: "#afa9ec" }}
      />
      <button
        onClick={() => applyFilters(currentYear, q)}
        className="px-4 py-2 text-sm font-semibold text-white rounded-md"
        style={{ backgroundColor: "#3d2c8d" }}
      >
        Search
      </button>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => applyFilters(undefined, q)}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${!currentYear ? "text-white" : "bg-white text-gray-600"}`}
          style={!currentYear ? { backgroundColor: "#3d2c8d", borderColor: "#3d2c8d" } : { borderColor: "#afa9ec" }}
        >
          All Years
        </button>
        {YEAR_GROUPS.map((yr) => (
          <button
            key={yr}
            onClick={() => applyFilters(String(yr), q)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors`}
            style={
              currentYear === String(yr)
                ? { backgroundColor: "#3d2c8d", borderColor: "#3d2c8d", color: "white" }
                : { borderColor: "#afa9ec", backgroundColor: "white", color: "#534ab7" }
            }
          >
            Year {yr}
          </button>
        ))}
      </div>
    </div>
  );
}
