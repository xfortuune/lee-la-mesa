import { useLang } from '../i18n/lang';
import { type Card, rankLabel } from '../logic';
import { SUIT_TEXT, cardName } from './cardStyles';

/** Small inline card ("A♠") for text and lists. */
export function CardChip({ card }: { card: Card }) {
  const { lang } = useLang();
  return (
    <span
      role="img"
      aria-label={cardName(card, lang)}
      className={`inline-flex items-center rounded-md bg-gradient-to-br from-white to-slate-200 px-1.5 py-0.5 font-mono text-xs font-bold leading-none ${SUIT_TEXT[card.suit]}`}
    >
      {rankLabel(card.rank)}
      {card.suit}
    </span>
  );
}
