export function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20 animate-fade-in">
      <div className="h-12 w-12 rounded-full border-2 border-border border-t-primary animate-spin" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
