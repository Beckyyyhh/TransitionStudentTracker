"use client";

import { useRouter, usePathname } from "next/navigation";
import { TASK_CATEGORIES, TASK_STATUSES } from "@/lib/constants";

type Student = { id: number; firstName: string; lastName: string };

export function TasksFilters({
  students,
  currentStudentId,
  currentStatus,
  currentCategory,
}: {
  students: Student[];
  currentStudentId?: string;
  currentStatus?: string;
  currentCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function update(key: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={currentStudentId ?? ""}
        onChange={(e) => update("studentId", e.target.value)}
        className="border rounded-md px-3 py-2 text-sm"
        style={{ borderColor: "#afa9ec" }}
      >
        <option value="">All Students</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>{s.lastName}, {s.firstName}</option>
        ))}
      </select>

      <select
        value={currentStatus ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className="border rounded-md px-3 py-2 text-sm"
        style={{ borderColor: "#afa9ec" }}
      >
        <option value="">All Statuses</option>
        {TASK_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select
        value={currentCategory ?? ""}
        onChange={(e) => update("category", e.target.value)}
        className="border rounded-md px-3 py-2 text-sm"
        style={{ borderColor: "#afa9ec" }}
      >
        <option value="">All Categories</option>
        {TASK_CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      {(currentStudentId || currentStatus || currentCategory) && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm px-3 py-2 rounded-md border"
          style={{ borderColor: "#afa9ec", color: "#534ab7" }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
