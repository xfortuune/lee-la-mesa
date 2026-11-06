import { type Card, type Suit, rankLabel } from '../logic';

// Baraja de 4 colores: ♠ negro, ♥ rojo, ♦ azul, ♣ verde.
const SUIT_STYLE: Record<Suit, { text: string; glow: string }> = {
  '♠': { text: 'text-slate-900', glow: 'shadow-[0_0_24px_-4px_rgba(148,163,184,0.55)]' },
  '♥': { text: 'text-rose-600', glow: 'shadow-[0_0_24px_-4px_rgba(244,63,94,0.6)]' },
  '♦': { text: 'text-blue-600', glow: 'shadow-[0_0_24px_-4px_rgba(59,130,246,0.65)]' },
  '♣': { text: 'text-emerald-600', glow: 'shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)]' },
};

const SUIT_NAME: Record<Suit, string> = {
  '♠': 'picas',
  '♥': 'corazones',
  '♦': 'diamantes',
  '♣': 'tréboles',
};

export function PlayingCard({ card, delay = 0 }: { card: Card; delay?: number }) {
  const { text, glow } = SUIT_STYLE[card.suit];
  return (
    <div className="[perspective:600px]">
      <div
        role="img"
        aria-label={`${rankLabel(card.rank)} de ${SUIT_NAME[card.suit]}`}
        style={{ animationDelay: `${delay}ms` }}
        className={`relative flex h-[5.75rem] w-16 animate-deal select-none flex-col overflow-hidden rounded-xl bg-gradient-to-br from-white via-slate-50 to-slate-200 ring-1 ring-white/70 sm:h-32 sm:w-[5.5rem] ${glow} ${text}`}
      >
        {/* reflejo */}
        <div className="pointer-events-none absolute -left-1/2 -top-1/2 h-full w-[200%] rotate-12 bg-gradient-to-b from-white/70 to-transparent opacity-60" />
        <div className="absolute left-1.5 top-1 flex flex-col items-center font-mono leading-none sm:left-2 sm:top-1.5">
          <span className="text-lg font-bold tracking-tighter sm:text-2xl">{rankLabel(card.rank)}</span>
          <span className="text-sm sm:text-lg">{card.suit}</span>
        </div>
        <span className="relative m-auto pt-4 text-4xl drop-shadow-sm sm:text-5xl">{card.suit}</span>
      </div>
    </div>
  );
}
