import { PlayingCard } from './PlayingCard';
import { CARD_SIZES, type CardSize } from './cardStyles';
import { useLang } from '../i18n/lang';
import type { Card } from '../logic';

/** A card, or an empty dashed slot, that opens the card picker when tapped. */
export function CardSlot({
  card,
  size,
  label,
  active,
  onClick,
}: {
  card: Card | null;
  size: CardSize;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const { lang } = useLang();
  const verb = card ? (lang === 'en' ? 'Change' : 'Cambiar') : lang === 'en' ? 'Pick' : 'Elegir';
  const box = CARD_SIZES[size].box;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${verb} ${label}`}
      className={`relative shrink-0 rounded-xl transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan ${
        active ? 'ring-2 ring-neon-cyan ring-offset-2 ring-offset-void' : ''
      }`}
    >
      {card ? (
        <PlayingCard card={card} size={size} />
      ) : (
        <div
          className={`grid place-items-center border border-dashed border-neon-cyan/30 bg-neon-cyan/[0.03] text-neon-cyan/60 transition hover:border-neon-cyan/70 hover:bg-neon-cyan/10 hover:text-neon-cyan hover:shadow-[0_0_20px_-6px_var(--color-neon-cyan)] ${box}`}
        >
          <span className={size === 'sm' ? 'text-lg' : 'text-2xl'}>+</span>
        </div>
      )}
    </button>
  );
}
