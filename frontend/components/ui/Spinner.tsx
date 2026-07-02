export function Spinner({ label }: { label: string }) {
  return (
    <div role="status" className="inline-flex items-center gap-2 text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
