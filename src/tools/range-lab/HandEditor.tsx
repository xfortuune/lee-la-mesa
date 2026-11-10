import { InfoModal } from '../../components/InfoModal';
import { SUIT_TEXT, cardKey } from '../../components/cardStyles';
import { useLang } from '../../i18n/lang';
import { type HandKey, type Range, combosOf, rankLabel, setCombos } from '../../logic';
import { T } from './texts';

/** Per-hand editor: pick single combos (suits) and the hand's weight. */
export function HandEditor({
  hand,
  range,
  dead,
  paintWeight,
  onChange,
  onClose,
}: {
  hand: HandKey;
  range: Range;
  /** Keys (cardKey) of the board and Hero's cards. */
  dead: Set<string>;
  paintWeight: number;
  onChange: (range: Range) => void;
  onClose: () => void;
}) {
  const { lang } = useLang();
  const t = T[lang];
  const combos = combosOf(hand);
  const selected = combos.filter((c) => (range[c.key] ?? 0) > 0);
  const weight = selected.length ? selected.reduce((s, c) => s + range[c.key], 0) / selected.length : paintWeight;
  const keys = combos.map((c) => c.key);

  return (
    <InfoModal eyebrow={t.handEditor} title={hand} onClose={onClose}>
      <div className={`grid gap-2 ${combos.length === 12 ? 'grid-cols-3 sm:grid-cols-4' : combos.length === 6 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {combos.map((c) => {
          const on = (range[c.key] ?? 0) > 0;
          const isDead = c.cards.some((x) => dead.has(cardKey(x)));
          return (
            <button
              key={c.key}
              aria-pressed={on}
              onClick={() => onChange(setCombos(range, [c.key], on ? 0 : weight))}
              className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2.5 font-mono text-base font-bold transition ${
                on
                  ? 'border-amber-300/70 bg-amber-300/15 shadow-[0_0_16px_-6px_#fbbf24]'
                  : 'border-white/10 bg-white/[0.03] opacity-60 hover:opacity-100'
              }`}
            >
              {c.cards.map((x, i) => (
                <span key={i} className="rounded bg-white px-1 py-0.5">
                  <span className={SUIT_TEXT[x.suit]}>
                    {rankLabel(x.rank)}
                    {x.suit}
                  </span>
                </span>
              ))}
              {isDead && <span className="ml-1 text-[9px] font-normal uppercase text-rose-300">{t.dead}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex flex-1 items-center gap-3 text-sm">
          <span className="w-14 shrink-0 text-slate-400">{t.weightOf}</span>
          <input
            type="range"
            min={1}
            max={100}
            value={Math.round(weight * 100)}
            onChange={(e) =>
              onChange(
                setCombos(
                  range,
                  selected.map((c) => c.key),
                  Number(e.target.value) / 100,
                ),
              )
            }
            disabled={!selected.length}
            className="flex-1 accent-amber-400"
          />
          <span className="w-12 text-right font-mono tabular-nums text-amber-200">{Math.round(weight * 100)}%</span>
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={() => onChange(setCombos(range, keys, weight))}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-slate-200 transition hover:border-amber-300/60"
        >
          {t.all}
        </button>
        <button
          onClick={() => onChange(setCombos(range, keys, 0))}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-slate-200 transition hover:border-rose-400/60"
        >
          {t.none}
        </button>
        <button
          onClick={onClose}
          className="rounded-xl border border-amber-300/50 bg-amber-300/15 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/25"
        >
          {t.done}
        </button>
      </div>
    </InfoModal>
  );
}
