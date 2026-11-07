import { useEffect } from 'react';
import { SUIT_NAME, SUIT_TEXT, cardKey, cardName } from '../../components/cardStyles';
import { useLang } from '../../i18n/lang';
import { type Card, RANKS, SUITS, rankLabel } from '../../logic';

interface Props {
  title: string;
  current: Card | null;
  /** Cartas ocupadas en otras posiciones (clave "rango+palo"). */
  used: Set<string>;
  onPick: (card: Card) => void;
  onClear: () => void;
  onClose: () => void;
}

export function CardPicker({ title, current, used, onPick, onClear, onClose }: Props) {
  const { lang } = useLang();
  const en = lang === 'en';
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ranks = [...RANKS].reverse();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${en ? 'Pick a card' : 'Elegir carta'}: ${title}`}
        className="neon-border w-full max-w-3xl animate-rise rounded-t-3xl bg-[#0a0c1c]/95 p-4 shadow-[0_0_80px_-20px_rgba(34,228,255,0.5)] sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan/80">{en ? 'Pick a card' : 'Elegir carta'}</p>
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <div className="flex gap-2">
            {current && (
              <button
                onClick={onClear}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
              >
                {en ? 'Remove' : 'Quitar'}
              </button>
            )}
            <button
              onClick={onClose}
              aria-label={en ? 'Close' : 'Cerrar'}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-xl text-slate-300 transition hover:border-neon-cyan/50 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:gap-2">
          {SUITS.map((suit) => (
            <div key={suit} className="grid grid-cols-13 gap-1 sm:gap-1.5" aria-label={SUIT_NAME[lang][suit]}>
              {ranks.map((rank) => {
                const card = { rank, suit };
                const k = cardKey(card);
                const taken = used.has(k);
                const selected = current !== null && cardKey(current) === k;
                return (
                  <button
                    key={k}
                    disabled={taken}
                    onClick={() => onPick(card)}
                    aria-label={cardName(card, lang)}
                    className={`flex aspect-[5/7] flex-col items-center justify-center rounded-md font-mono leading-none transition sm:rounded-lg ${
                      taken
                        ? 'cursor-not-allowed bg-white/[0.06] text-slate-600 opacity-40'
                        : selected
                          ? `bg-white ring-2 ring-neon-cyan shadow-[0_0_16px_-2px_var(--color-neon-cyan)] ${SUIT_TEXT[suit]}`
                          : `bg-gradient-to-br from-white to-slate-200 hover:-translate-y-0.5 hover:shadow-[0_0_14px_-2px_var(--color-neon-cyan)] active:scale-95 ${SUIT_TEXT[suit]}`
                    }`}
                  >
                    <span className="text-[11px] font-bold sm:text-base">{rankLabel(rank)}</span>
                    <span className="text-[10px] sm:text-sm">{suit}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
