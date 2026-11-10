import { useState } from 'react';
import { SUIT_TEXT, cardName } from '../../components/cardStyles';
import { useLang } from '../../i18n/lang';
import { type Card, type NextCardRow, rankLabel } from '../../logic';
import { T } from './texts';

type SortKey = 'card' | 'topPairPlus' | 'draws' | 'equity';

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const delta = (x: number) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}`;

/** Every possible next card and how it changes the range. */
export function StreetTable({
  rows,
  street,
  busy,
  onPick,
}: {
  rows: NextCardRow[];
  street: 'turn' | 'river';
  busy: boolean;
  onPick: (card: Card) => void;
}) {
  const { lang } = useLang();
  const t = T[lang];
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({
    key: 'topPairPlus',
    desc: true,
  });
  const hasEquity = rows.some((r) => r.equity !== null);
  // There are no draws left once the river is dealt.
  const showDraws = street === 'turn';

  const value = (r: NextCardRow, k: SortKey) =>
    k === 'card' ? r.card.rank * 4 + '♣♦♥♠'.indexOf(r.card.suit) : k === 'equity' ? (r.equity ?? 0) : r[k];
  const sorted = [...rows].sort((a, b) =>
    sort.desc ? value(b, sort.key) - value(a, sort.key) : value(a, sort.key) - value(b, sort.key),
  );
  const max = Math.max(0.0001, ...rows.map((r) => r.topPairPlus));

  const th = (k: SortKey, label: string, className = '') => (
    <th
      scope="col"
      className={`px-2 py-2 font-normal ${className}`}
      aria-sort={sort.key === k ? (sort.desc ? 'descending' : 'ascending') : 'none'}
    >
      <button
        onClick={() => setSort((s) => ({ key: k, desc: s.key === k ? !s.desc : true }))}
        className={`font-mono text-[10px] uppercase tracking-wider transition hover:text-white ${sort.key === k ? 'text-amber-200' : 'text-slate-500'}`}
      >
        {label}
        {sort.key === k ? (sort.desc ? ' ↓' : ' ↑') : ''}
      </button>
    </th>
  );

  return (
    <div className={busy ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-bold text-white">{street === 'turn' ? t.turnTable : t.riverTable}</h3>
        <p className="text-xs text-slate-500">{t.tableHint}</p>
      </div>
      <div className="max-h-[32rem] overflow-y-auto rounded-2xl border border-white/10">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-[#0a0c1c]/95 backdrop-blur">
            <tr className="text-left">
              {th('card', street === 'turn' ? 'Turn' : 'River')}
              {th('topPairPlus', t.tpPlus)}
              {showDraws && th('draws', t.drawCol, 'text-right')}
              {hasEquity && th('equity', t.vs, 'text-right')}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={`${r.card.rank}${r.card.suit}`}
                className="border-t border-white/[0.05] transition hover:bg-amber-300/[0.06]"
              >
                <td className="px-2 py-1">
                  <button
                    onClick={() => onPick(r.card)}
                    aria-label={cardName(r.card, lang)}
                    className="rounded-md bg-white px-1.5 py-0.5 font-mono text-sm font-bold transition hover:shadow-[0_0_12px_-2px_#fbbf24]"
                  >
                    <span className={SUIT_TEXT[r.card.suit]}>
                      {rankLabel(r.card.rank)}
                      {r.card.suit}
                    </span>
                  </button>
                </td>
                <td className="px-2 py-1">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/[0.06] sm:w-20">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${(r.topPairPlus / max) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs tabular-nums text-white">{pct(r.topPairPlus)}</span>
                    <span
                      className={`font-mono text-[10px] tabular-nums ${r.deltaTopPairPlus > 0.0005 ? 'text-emerald-300' : r.deltaTopPairPlus < -0.0005 ? 'text-rose-300' : 'text-slate-500'}`}
                    >
                      {delta(r.deltaTopPairPlus)}
                    </span>
                  </div>
                </td>
                {showDraws && (
                  <td className="px-2 py-1 text-right font-mono text-xs tabular-nums">
                    <span className="text-slate-200">{pct(r.draws)}</span>{' '}
                    <span
                      className={`text-[10px] ${r.deltaDraws > 0.0005 ? 'text-emerald-300' : r.deltaDraws < -0.0005 ? 'text-rose-300' : 'text-slate-500'}`}
                    >
                      {delta(r.deltaDraws)}
                    </span>
                  </td>
                )}
                {hasEquity && (
                  <td className="px-2 py-1 text-right font-mono text-xs tabular-nums text-neon-cyan">
                    {r.equity === null ? '—' : pct(r.equity)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
