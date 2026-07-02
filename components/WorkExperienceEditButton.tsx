"use client";

import { EditTaskModal } from "@/components/EditTaskModal";
import { Pencil } from "lucide-react";

type Task = {
  id: number;
  title: string;
  category: string;
  status: string;
  date: string;
  notes: string;
  weCompany: string;
  weContactPhone: string;
  weContactEmail: string;
  weStartDate: string;
  weEndDate: string;
  weSPR: boolean;
  weMyWorkExperience: boolean;
  weMedicalDocs: boolean;
  weWorkplaceVisited: boolean;
  weSafetyGuideParent: boolean;
  weSafetyGuideEmployer: boolean;
};

export function WorkExperienceEditButton({ task }: { task: Task }) {
  return (
    <EditTaskModal
      task={task}
      trigger={
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-md transition-colors hover:bg-purple-50" style={{ color: "#534ab7", borderColor: "#afa9ec" }}>
          <Pencil size={12} />
          Edit
        </button>
      }
    />
  );
}
