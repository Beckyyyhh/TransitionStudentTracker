export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    NOT_STARTED: {
      label: "Not Started",
      className: "bg-gray-100 text-gray-600 border border-gray-300",
    },
    IN_PROGRESS: {
      label: "In Progress",
      className: "bg-amber-50 text-amber-700 border border-amber-300",
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-green-50 text-green-700 border border-green-300",
    },
  };
  const { label, className } = map[status] ?? map.NOT_STARTED;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
