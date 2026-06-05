"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { SectionHeader } from "./SectionHeader";

const COLORS = ["#3d2c8d", "#534ab7", "#7c6fcf", "#afa9ec", "#26215c", "#6b7280", "#4f46e5", "#7c3aed", "#a855f7", "#8b5cf6"];

export function DashboardCharts({
  byCategory,
}: {
  byCategory: { category: string; count: number }[];
}) {
  if (byCategory.length === 0) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec" }}>
        <SectionHeader title="Tasks by Category" />
        <div className="bg-white p-8 text-center text-gray-400 text-sm">No task data yet.</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
      <SectionHeader title="Tasks by Category" />
      <div className="bg-white p-6">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={byCategory} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
            <XAxis
              dataKey="category"
              tick={{ fontSize: 12, fill: "#4b5563" }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#4b5563" }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #afa9ec", fontSize: 13 }}
              cursor={{ fill: "#eeedfe" }}
            />
            <Bar dataKey="count" name="Tasks" radius={[4, 4, 0, 0]}>
              {byCategory.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
