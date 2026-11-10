import { useLang } from '../../i18n/lang';
import {
  type Category,
  DRAW_CATEGORIES,
  MADE_CATEGORIES,
  type RangeAnalysis,
  type RangeEquityResult,
} from '../../logic';
import { CATEGORY_LABELS, T } from './texts';

const num = (x: number) => (Math.round(x * 10) / 10).toString();
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

interface Props {
  analysis: RangeAnalysis;
  equity: RangeEquityResult | null;
  hasHero: boolean;
  selected: Set<Category>;
  onToggle: (c: Category) => void;
  onHover: (c: Category | null) => void;
  onFilter: (mode: 'keep' | 'remove') => void;
}

export function StatsPanel({ analysis, equity, hasHero, selected, onToggle, onHover, onFilter }: Props) {
  const { lang } = useLang();
  const t = T[lang];
  const total = analysis.total;
  const labels = CATEGORY_LABELS[lang];

  const row = (cat: Category, weight: number, cumulative: number | null, eq: number | null, sub?: string) => {
    const on = selected.has(cat);
    return (
      <li key={cat}>
        <label
          onPointerEnter={() => onHover(cat)}
          onPointerLeave={() => onHover(null)}
          onFocus={() => onHover(cat)}
          onBlur={() => onHover(null)}
          className={`group grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-2.5 rounded-lg px-2 py-1 transition hover:bg-neon-cyan/[0.07] ${
            on ? 'bg-amber-300/[0.08]' : ''
          }`}
        >
          <input type="checkbox" checked={on} onChange={() => onToggle(cat)} className="h-3.5 w-3.5 accent-amber-400" />
          <span className="min-w-0">
            <span className="flex items-baseline justify-between gap-2">
              <span title={labels[cat]} className="text-sm leading-tight text-slate-200 group-hover:text-white lg:truncate">{labels[cat]}</span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-slate-400">{num(weight)}</span>
            </span>
            <span className="mt-0.5 block h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-amber-400 to-neon-cyan transition-[width] duration-500"
                style={{ width: `${total ? (weight / total) * 100 : 0}%` }}
              />
            </span>
            {sub && <span className="mt-0.5 block text-[11px] text-amber-200/80">{sub}</span>}
          </span>
          <span className="grid w-[7.5rem] grid-cols-3 gap-1 text-right font-mono text-xs tabular-nums sm:w-36">
            <span className="text-white">{total ? pct(weight / total) : '—'}</span>
            <span className="text-slate-500">{cumulative === null ? '' : pct(cumulative)}</span>
            <span className="text-neon-cyan">{eq === null ? '' : pct(eq)}</span>
          </span>
        </label>
      </li>
    );
  };

  const made = MADE_CATEGORIES.filter((c) => analysis.made[c].weight > 0);
  const cumulative = made.reduce<number[]>((list, c, i) => [...list, (list[i - 1] ?? 0) + analysis.made[c].weight], []);
  const draws = DRAW_CATEGORIES.filter((c) => analysis.draws[c].weight > 0);

  const header = (title: string, showCum: boolean) => (
    <div className="mb-1 flex items-end justify-between gap-2 px-2">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-300/90">{title}</h3>
      <span className="grid w-[7.5rem] grid-cols-3 gap-1 text-right font-mono text-[9px] uppercase tracking-wider text-slate-500 sm:w-36">
        <span>%</span>
        <span>{showCum ? t.cumulative : ''}</span>
        <span>{hasHero ? t.vs : ''}</span>
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div>
        {header(t.madeHands, true)}
        <ul>
          {made.map((c, i) => {
            const eq = hasHero ? (equity?.byMade[c]?.equity ?? null) : null;
            const sub =
              c === 'flush' && analysis.nutFlush > 0 ? `${num(analysis.nutFlush)} ${t.nutFlush}` : undefined;
            return row(c, analysis.made[c].weight, total ? cumulative[i] / total : 0, eq, sub);
          })}
        </ul>
      </div>

      {draws.length > 0 && (
        <div>
          {header(t.draws, false)}
          <ul>{draws.map((c) => row(c, analysis.draws[c].weight, null, null))}</ul>
        </div>
      )}

      <div className="sticky bottom-2 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#0a0c1c]/90 p-2 backdrop-blur">
        <span className="px-1 font-mono text-[11px] text-slate-400">
          {selected.size} {t.selected}
        </span>
        <button
          disabled={!selected.size}
          onClick={() => onFilter('keep')}
          className="rounded-lg border border-amber-300/50 bg-amber-300/15 px-3 py-1.5 text-sm font-semibold text-amber-100 transition enabled:hover:bg-amber-300/25 disabled:opacity-40"
        >
          {t.keep}
        </button>
        <button
          disabled={!selected.size}
          onClick={() => onFilter('remove')}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-200 transition enabled:hover:border-rose-400/60 disabled:opacity-40"
        >
          {t.remove}
        </button>
      </div>
    </div>
  );
}
