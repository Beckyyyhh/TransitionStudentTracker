import Link from "next/link";

type Props = {
  id: number;
  firstName: string;
  lastName: string;
  year: number;
  referrer: string;
  taskCount: number;
};

export function StudentCard({ id, firstName, lastName, year, referrer, taskCount }: Props) {
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
        <div className="flex items-center gap-1 text-sm" style={{ color: "#534ab7" }}>
          <span className="font-semibold">{taskCount}</span>
          <span>{taskCount === 1 ? "task" : "tasks"}</span>
        </div>
      </div>
    </Link>
  );
}
