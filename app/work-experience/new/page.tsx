import { getEmployers } from "@/lib/actions";
import { NewWEStudentForm } from "@/components/NewWEStudentForm";

export const dynamic = "force-dynamic";

export default async function NewWEStudentPage() {
  const employers = await getEmployers();
  return <NewWEStudentForm employers={employers} />;
}
