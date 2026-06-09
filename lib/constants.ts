export const TASK_CATEGORIES = [
  "Resume/CV",
  "Work Experience",
  "TAFE/VET",
  "University Pathway",
  "Job Application",
  "Career Planning",
  "Interview Prep",
  "UCAT/Selective",
  "Mentoring",
  "Other",
] as const;

export const REFERRER_OPTIONS = [
  "Self-referred",
  "Deputy",
  "Head Teacher",
  "Year Adviser",
  "Class Teacher",
  "Parent/Carer",
  "School Counsellor",
  "Wellbeing Team",
  "LOTE/EAL/D",
  "Other",
] as const;

export const TASK_STATUSES = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
] as const;

export const YEAR_GROUPS = [9, 10, 11, 12] as const;
