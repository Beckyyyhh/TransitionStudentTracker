export function SectionHeader({ title }: { title: string }) {
  return (
    <div
      className="px-4 py-2 text-white text-xs font-bold uppercase tracking-widest"
      style={{ backgroundColor: "#3d2c8d", letterSpacing: "1px" }}
    >
      {title}
    </div>
  );
}
