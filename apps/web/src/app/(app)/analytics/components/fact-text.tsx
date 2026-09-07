export function FactText({ label, value }: { label: string; value: string | number }) {
  return <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate tabular-nums">{value}</p></div>;
}
