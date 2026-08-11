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
  weContactName: string;
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

type UpdatedFields = { title: string; category: string; status: string; date: string; weCompany: string; weContactName: string; weContactPhone: string; weContactEmail: string; weStartDate: string; weEndDate: string; weSPR: boolean; weMyWorkExperience: boolean; weMedicalDocs: boolean; weWorkplaceVisited: boolean; weSafetyGuideParent: boolean; weSafetyGuideEmployer: boolean };

export function WorkExperienceEditButton({ task, onSaved }: { task: Task; onSaved?: (updated: UpdatedFields) => void }) {
  return (
    <EditTaskModal
      task={task}
      onSaved={onSaved}
      trigger={
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-md transition-colors hover:bg-purple-50" style={{ color: "#534ab7", borderColor: "#afa9ec" }}>
          <Pencil size={12} />
          Edit
        </button>
      }
    />
  );
}
