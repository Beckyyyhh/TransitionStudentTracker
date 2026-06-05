"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/students", label: "Students" },
  { href: "/tasks", label: "Tasks" },
  { href: "/history", label: "History" },
  { href: "/dashboard", label: "Dashboard" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav style={{ backgroundColor: "#3d2c8d" }}>
      <div className="max-w-7xl mx-auto px-4 flex">
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/students" ? pathname.startsWith(tab.href) : pathname === "/students" || pathname.startsWith("/students/"));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 relative"
              style={{ fontFamily: "var(--font-nunito), sans-serif" }}
            >
              {tab.label}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
