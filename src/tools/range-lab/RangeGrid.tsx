import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n/lang';
import { type HandKey, gridHand } from '../../logic';
import { T } from './texts';

/** What a cell needs to draw itself. */
export interface CellInfo {
  /** Combos of the hand (6, 4 or 12). */
  total: number;
  /** Combos of the hand in the range. */
  inRange: number;
  /** Of those, how many are not blocked by the board or Hero. */
  live: number;
  /** Average weight of the combos in the range (0..1). */
  weight: number;
  /** Live combos in the highlighted category. */
  highlighted: number;
}

interface Props {
  cells: Map<HandKey, CellInfo>;
  mode: 'paint' | 'edit';
  /** Weight used when painting (0..1). */
  paintWeight: number;
  hasHighlight: boolean;
  onStrokeStart: () => void;
  onPaint: (hand: HandKey, add: boolean) => void;
  onEdit: (hand: HandKey) => void;
}

const SIZE = 13;

export function RangeGrid({ cells, mode, paintWeight, hasHighlight, onStrokeStart, onPaint, onEdit }: Props) {
  const { lang } = useLang();
  const t = T[lang];
  const [focus, setFocus] = useState(0);
  const stroke = useRef<{ add: boolean; done: Set<HandKey> } | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const end = () => (stroke.current = null);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, []);

  /** A cell counts as "on" when all its combos are in at the current paint weight. */
  const isOn = (hand: HandKey) => {
    const c = cells.get(hand)!;
    return c.inRange === c.total && Math.abs(c.weight - paintWeight) < 0.005;
  };

  const handAt = (x: number, y: number) =>
    (document.elementFromPoint(x, y) as HTMLElement | null)?.closest<HTMLElement>('[data-hand]')?.dataset.hand ?? null;

  const onPointerDown = (e: PointerEvent) => {
    const hand = (e.target as HTMLElement).closest<HTMLElement>('[data-hand]')?.dataset.hand;
    if (!hand || e.button !== 0) return;
    e.preventDefault();
    setFocus(Number((e.target as HTMLElement).closest<HTMLElement>('[data-index]')?.dataset.index ?? 0));
    if (mode === 'edit') {
      onEdit(hand);
      return;
    }
    const add = !isOn(hand);
    stroke.current = { add, done: new Set([hand]) };
    onStrokeStart();
    onPaint(hand, add);
  };

  const onPointerMove = (e: PointerEvent) => {
    const s = stroke.current;
    if (!s) return;
    const hand = handAt(e.clientX, e.clientY);
    if (!hand || s.done.has(hand)) return;
    s.done.add(hand);
    onPaint(hand, s.add);
  };

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const row = Math.floor(i / SIZE);
    const col = i % SIZE;
    const move = (r: number, c: number) => {
      const next = Math.max(0, Math.min(SIZE - 1, r)) * SIZE + Math.max(0, Math.min(SIZE - 1, c));
      setFocus(next);
      refs.current[next]?.focus();
    };
    const hand = gridHand(row, col);
    switch (e.key) {
      case 'ArrowUp':
        return (e.preventDefault(), move(row - 1, col));
      case 'ArrowDown':
        return (e.preventDefault(), move(row + 1, col));
      case 'ArrowLeft':
        return (e.preventDefault(), move(row, col - 1));
      case 'ArrowRight':
        return (e.preventDefault(), move(row, col + 1));
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (mode === 'edit') onEdit(hand);
        else {
          onStrokeStart();
          onPaint(hand, !isOn(hand));
        }
        return;
      case 'e':
      case 'E':
        e.preventDefault();
        onEdit(hand);
        e.stopPropagation();
    }
  };

  return (
    <div
      role="grid"
      aria-label={t.range}
      className="grid touch-none select-none grid-cols-13 gap-[2px] sm:gap-1"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onContextMenu={(e) => {
        const hand = (e.target as HTMLElement).closest<HTMLElement>('[data-hand]')?.dataset.hand;
        if (hand) {
          e.preventDefault();
          onEdit(hand);
        }
      }}
    >
      {Array.from({ length: SIZE }, (_, row) => (
        <div role="row" key={row} className="contents">
          {Array.from({ length: SIZE }, (_, col) => {
            const i = row * SIZE + col;
            const hand = gridHand(row, col);
            const c = cells.get(hand)!;
            const fill = c.inRange / c.total;
            const hl = hasHighlight && c.highlighted > 0;
            const dim = hasHighlight && !hl;
            const pair = row === col;
            const dark = fill >= 0.5 && c.weight >= 0.5;
            return (
              <button
                key={hand}
                role="gridcell"
                ref={(el) => {
                  refs.current[i] = el;
                }}
                data-hand={hand}
                data-index={i}
                tabIndex={i === focus ? 0 : -1}
                aria-selected={c.inRange > 0}
                aria-label={t.cellLabel(hand, c.live, c.weight)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`relative aspect-square overflow-hidden rounded-[4px] border font-mono leading-none transition-[opacity,box-shadow] duration-150 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-neon-cyan sm:rounded-md ${
                  hl
                    ? 'border-neon-cyan shadow-[0_0_12px_-2px_var(--color-neon-cyan)]'
                    : c.inRange
                      ? 'border-amber-300/50'
                      : pair
                        ? 'border-white/15'
                        : 'border-white/[0.07]'
                } ${dim ? 'opacity-35' : ''} ${pair ? 'bg-white/[0.06]' : 'bg-white/[0.03]'}`}
              >
                {/* Amber fill: height = share of combos selected, intensity = weight */}
                {fill > 0 && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-amber-400 to-amber-300"
                    style={{ height: `${fill * 100}%`, opacity: 0.25 + 0.75 * c.weight }}
                  />
                )}
                {hl && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 bg-neon-cyan/70 mix-blend-screen"
                    style={{ height: `${(c.highlighted / c.total) * 100}%` }}
                  />
                )}
                <span
                  className={`relative block text-[8px] font-bold min-[400px]:text-[9px] sm:text-[11px] ${
                    dark ? 'text-[#1a1203]' : c.inRange ? 'text-amber-200' : 'text-slate-400'
                  }`}
                >
                  {hand}
                </span>
                {c.inRange > 0 && (
                  <span className={`relative hidden text-[8px] sm:block ${dark ? 'text-[#1a1203]/70' : 'text-amber-200/70'}`}>{c.live}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
