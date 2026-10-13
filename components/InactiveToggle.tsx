"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleStudentInactive } from "@/lib/actions";
import { toast } from "sonner";
import { ArchiveX, Archive } from "lucide-react";

export function InactiveToggle({ studentId, inactive }: { studentId: number; inactive: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(inactive);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      await toggleStudentInactive(studentId, !current);
      setCurrent(!current);
      toast.success(current ? "Student marked as active" : "Student moved to inactive");
      router.refresh();
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
        ? { backgroundColor: "#6b7280", color: "white" }
        : { backgroundColor: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.4)" }
      }
    >
      {current ? <ArchiveX size={14} /> : <Archive size={14} />}
      {current ? "Inactive" : "Move to Inactive"}
    </button>
  );
}
