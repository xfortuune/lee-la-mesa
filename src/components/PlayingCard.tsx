import { type Card, type Suit, rankLabel } from '../logic';

// Baraja de 4 colores: ♠ negro, ♥ rojo, ♦ azul, ♣ verde.
const SUIT_COLOR: Record<Suit, string> = {
  '♠': 'text-gray-900',
  '♥': 'text-red-600',
  '♦': 'text-blue-600',
  '♣': 'text-green-700',
};

const SUIT_NAME: Record<Suit, string> = {
  '♠': 'picas',
  '♥': 'corazones',
  '♦': 'diamantes',
  '♣': 'tréboles',
};

export function PlayingCard({ card }: { card: Card }) {
  const color = SUIT_COLOR[card.suit];
  return (
    <div
      role="img"
      aria-label={`${rankLabel(card.rank)} de ${SUIT_NAME[card.suit]}`}
      className={`relative flex h-24 w-16 select-none flex-col rounded-lg border border-gray-300 bg-white shadow-lg sm:h-32 sm:w-22 ${color}`}
    >
      <div className="absolute left-1.5 top-1 flex flex-col items-center leading-none">
        <span className="text-lg font-bold sm:text-2xl">{rankLabel(card.rank)}</span>
        <span className="text-sm sm:text-lg">{card.suit}</span>
      </div>
      <span className="m-auto pt-4 text-4xl sm:text-5xl">{card.suit}</span>
    </div>
  );
}
