import { type Card, rankLabel } from '../logic';
import { CARD_SIZES, type CardSize, SUIT_GLOW, SUIT_NAME, SUIT_TEXT } from './cardStyles';

export function PlayingCard({ card, delay = 0, size = 'md' }: { card: Card; delay?: number; size?: CardSize }) {
  const s = CARD_SIZES[size];
  return (
    <div className="[perspective:600px]">
      <div
        role="img"
        aria-label={`${rankLabel(card.rank)} de ${SUIT_NAME[card.suit]}`}
        style={{ animationDelay: `${delay}ms` }}
        className={`relative flex animate-deal select-none flex-col overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-200 ring-1 ring-white/70 ${s.box} ${SUIT_GLOW[card.suit]} ${SUIT_TEXT[card.suit]}`}
      >
        {/* reflejo */}
        <div className="pointer-events-none absolute -left-1/2 -top-1/2 h-full w-[200%] rotate-12 bg-gradient-to-b from-white/70 to-transparent opacity-60" />
        <div className={`absolute flex flex-col items-center font-mono leading-none ${s.corner}`}>
          <span className={`font-bold tracking-tighter ${s.rank}`}>{rankLabel(card.rank)}</span>
          <span className={s.cornerSuit}>{card.suit}</span>
        </div>
        <span className={`relative m-auto drop-shadow-sm ${s.center}`}>{card.suit}</span>
      </div>
    </div>
  );
}
