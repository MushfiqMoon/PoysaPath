type StackPeekStripProps = {
  title: string;
  meta: string;
};

export function StackPeekStrip({ title, meta }: StackPeekStripProps) {
  return (
    <div className="pointer-events-none w-full overflow-hidden rounded-t-lg border border-b-0 border-border/70 bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <p className="min-w-0 truncate text-sm font-medium text-text">{title}</p>
        <span className="shrink-0 rounded-full bg-bg/70 px-2 py-0.5 text-[0.65rem] text-text-muted">
          {meta}
        </span>
      </div>
    </div>
  );
}
