import Link from "next/link";

type Props = {
  id: number;
  firstName: string;
  lastName: string;
  year: number;
  referrer: string;
  taskCount: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
};

export function StudentCard({ id, firstName, lastName, year, referrer, taskCount, completedCount, inProgressCount, notStartedCount }: Props) {
  return (
    <Link href={`/students/${id}`}>
      <div
        className="bg-white rounded-lg p-5 cursor-pointer hover:shadow-md transition-shadow"
        style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-extrabold text-lg" style={{ color: "#26215c", fontFamily: "Nunito, sans-serif" }}>
            {firstName} {lastName}
          </h3>
          <span
            className="text-xs font-bold px-2 py-1 rounded-full text-white ml-2 shrink-0"
            style={{ backgroundColor: "#3d2c8d" }}
          >
            Yr {year}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-3">{referrer}</p>
        {taskCount === 0 ? (
          <p className="text-xs text-gray-400">No tasks</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {completedCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{completedCount} completed</span>
            )}
            {inProgressCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{inProgressCount} in progress</span>
            )}
            {notStartedCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{notStartedCount} not started</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
