interface CgpaStripProps {
  cgpaValue: number;
  percentage: number;
  totalCredits: number;
}

export default function CgpaStrip({ cgpaValue, percentage, totalCredits }: CgpaStripProps) {
  return (
    <div className="gz-card flex flex-wrap items-center justify-between gap-4 px-5 py-4 mb-6">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--gz-ink-soft)] gz-mono">Cumulative</p>
        <p className="text-3xl font-semibold gz-mono">{cgpaValue.toFixed(2)}</p>
      </div>
      <div className="h-10 w-px bg-[var(--gz-rule-strong)] hidden sm:block" />
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--gz-ink-soft)] gz-mono">Equivalent %</p>
        <p className="text-2xl gz-mono">{percentage.toFixed(1)}%</p>
      </div>
      <div className="h-10 w-px bg-[var(--gz-rule-strong)] hidden sm:block" />
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--gz-ink-soft)] gz-mono">Total credits</p>
        <p className="text-2xl gz-mono">{totalCredits}</p>
      </div>
    </div>
  );
}
