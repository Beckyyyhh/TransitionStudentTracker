"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createStudent } from "@/lib/actions";
import { REFERRER_OPTIONS, YEAR_GROUPS } from "@/lib/constants";
import { SectionHeader } from "@/components/SectionHeader";
import { toast } from "sonner";

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createStudent(formData);
      toast.success("Student registered");
      router.push("/students");
    } catch {
      toast.error("Failed to register student");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-4">
        <a href="/students" className="text-sm" style={{ color: "#534ab7" }}>← Students</a>
      </div>
      <h1 className="text-2xl font-extrabold mb-4" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
        Register New Student
      </h1>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title="Student Details" />
        <form onSubmit={handleSubmit} className="bg-white p-6 grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
              <input
                name="firstName"
                required
                className="w-full border rounded-md px-3 py-2 text-sm"
                style={{ borderColor: "#afa9ec" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
              <input
                name="lastName"
                required
                className="w-full border rounded-md px-3 py-2 text-sm"
                style={{ borderColor: "#afa9ec" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Year Group</label>
              <select
                name="year"
                required
                className="w-full border rounded-md px-3 py-2 text-sm"
                style={{ borderColor: "#afa9ec" }}
              >
                <option value="">Select year…</option>
                {YEAR_GROUPS.map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Referrer</label>
              <select
                name="referrer"
                required
                className="w-full border rounded-md px-3 py-2 text-sm"
                style={{ borderColor: "#afa9ec" }}
              >
                <option value="">Select referrer…</option>
                {REFERRER_OPTIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm resize-none"
              style={{ borderColor: "#afa9ec" }}
              placeholder="Optional notes about this student…"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <a
              href="/students"
              className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50"
              style={{ borderColor: "#afa9ec" }}
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-bold text-white rounded-md disabled:opacity-60"
              style={{ backgroundColor: "#3d2c8d" }}
            >
              {loading ? "Saving…" : "Register Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
