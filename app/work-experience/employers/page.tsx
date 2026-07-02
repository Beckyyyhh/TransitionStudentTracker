import { getEmployers } from "@/lib/actions";
import { SectionHeader } from "@/components/SectionHeader";
import { EmployerBankClient } from "@/components/EmployerBankClient";

export const dynamic = "force-dynamic";

export default async function EmployersPage() {
  const employers = await getEmployers();
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <a href="/work-experience" className="text-sm" style={{ color: "#534ab7" }}>← Work Experience</a>
      </div>
      <h1 className="text-2xl font-extrabold mb-4" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
        Employer Bank
      </h1>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #afa9ec", boxShadow: "0 1px 4px rgba(61,44,141,0.08)" }}>
        <SectionHeader title={`${employers.length} employer${employers.length !== 1 ? "s" : ""}`} />
        <div className="bg-white">
          <EmployerBankClient employers={employers} />
        </div>
      </div>
    </div>
  );
}
