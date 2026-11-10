export interface Segment {
  key: string;
  label: string;
  color: string;
  /** Weighted combos in the segment. */
  weight: number;
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const num = (x: number) => (Math.round(x * 10) / 10).toString();

/** Big range distribution: a segmented bar and one figure per segment. */
export function Distribution({
  eyebrow,
  title,
  segments,
  empty,
  className = '',
}: {
  eyebrow: string;
  title: string;
  segments: Segment[];
  /** Shown instead of the bar when the range has no live combos. */
  empty: string;
  className?: string;
}) {
  const total = segments.reduce((s, x) => s + x.weight, 0);
  return (
    <section
      className={`shrink-0 flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur sm:p-4 ${className}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">{eyebrow}</p>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      {total > 0 ? (
        <>
          <div className="flex h-7 overflow-hidden rounded-xl bg-white/[0.06] ring-1 ring-white/10">
            {segments.map((s) => {
              const share = s.weight / total;
              return (
                <div
                  key={s.key}
                  title={`${s.label} ${pct(share)}`}
                  className="flex h-full items-center justify-center overflow-hidden font-mono text-[11px] font-bold text-[#0b0d1a] transition-[width] duration-500"
                  style={{ width: `${share * 100}%`, background: s.color, boxShadow: `0 0 18px -4px ${s.color}` }}
                >
                  {share >= 0.09 ? `${Math.round(share * 100)}%` : ''}
                </div>
              );
            })}
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}>
            {segments.map((s) => (
              <div key={s.key} className="min-w-0 rounded-xl border border-white/[0.06] bg-black/20 px-2 py-1.5">
                <p className="flex items-center gap-1.5 truncate text-[11px] text-slate-400">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                  {s.label}
                </p>
                <p className="font-mono text-lg font-bold tabular-nums text-white sm:text-xl">{pct(s.weight / total)}</p>
                <p className="font-mono text-[10px] tabular-nums text-slate-500">{num(s.weight)} combos</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400">{empty}</p>
      )}
    </section>
  );
}
