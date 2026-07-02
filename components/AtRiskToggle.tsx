"use client";

import { useState } from "react";
import { toggleAtRisk } from "@/lib/actions";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

export function AtRiskToggle({ studentId, atRisk }: { studentId: number; atRisk: boolean }) {
  const [current, setCurrent] = useState(atRisk);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      await toggleAtRisk(studentId, !current);
      setCurrent(!current);
      toast.success(current ? "At Risk flag removed" : "Student marked as At Risk");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors disabled:opacity-60"
      style={current
        ? { backgroundColor: "#dc2626", color: "white" }
        : { backgroundColor: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.4)" }
      }
    >
      <ShieldAlert size={14} />
      {current ? "At Risk" : "Mark At Risk"}
    </button>
  );
}
