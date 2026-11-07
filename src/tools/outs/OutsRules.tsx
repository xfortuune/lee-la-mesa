import { InfoModal } from '../../components/InfoModal';
import { useLang } from '../../i18n/lang';

const kbd = 'rounded-md border border-white/20 bg-white/5 px-1.5 font-mono text-xs';

function RulesEs() {
  return (
    <>
      <section>
        <h3>01 · Qué es un out</h3>
        <p>
          Una carta que, si sale en la siguiente calle, <b>mejora tu jugada usando tus cartas</b>. Si la carta solo
          mejora la mesa (y por tanto a todos), no cuenta.
        </p>
      </section>
      <section>
        <h3>02 · Proyectos</h3>
        <ul>
          <li><b>Color</b>: 4 cartas del mismo palo → 9 outs.</li>
          <li><b>Escalera abierta</b>: 4 seguidas → 8 outs. <b>Gutshot</b> (falta una del medio) → 4 outs.</li>
          <li>Si tienes los dos, las cartas que cuentan doble se cuentan una sola vez (color + abierta = 15).</li>
        </ul>
      </section>
      <section>
        <h3>03 · Mejoras</h3>
        <ul>
          <li><b>Overcards</b>: cada carta tuya más alta que toda la mesa da 3 outs para pareja máxima.</li>
          <li><b>Pareja en mano → trío</b>: 2 outs.</li>
          <li><b>Pareja → dobles o trío</b>: 5 outs (3 de tu otra carta + 2 de la pareja).</li>
          <li><b>Dobles parejas → full</b>: 4 outs. <b>Trío → full o póker</b>: 7 outs en el flop.</li>
          <li>Emparejar una carta tuya por debajo de la más alta de la mesa no cuenta.</li>
        </ul>
      </section>
      <section>
        <h3>04 · Regla del 2 y del 4</h3>
        <ul>
          <li><b>En el flop</b> (quedan 2 cartas): outs × 4 ≈ % de ligar hasta el river.</li>
          <li><b>En el turn</b> (queda 1 carta): outs × 2 ≈ % de ligar en el river.</li>
          <li>Tras corregir verás también el % exacto para comparar.</li>
        </ul>
      </section>
      <section>
        <h3>05 · Repartos</h3>
        <ul>
          <li>Siempre hay al menos 2 outs; la mesa nunca está emparejada y nunca tienes ya escalera o mejor.</li>
          <li>
            <kbd className={kbd}>Enter</kbd> o <kbd className={kbd}>Espacio</kbd>: comprobar / siguiente mano.
          </li>
        </ul>
      </section>
    </>
  );
}

function RulesEn() {
  return (
    <>
      <section>
        <h3>01 · What an out is</h3>
        <p>
          A card that, if it comes on the next street, <b>improves your hand using your own cards</b>. If it only
          improves the board (and therefore everyone), it does not count.
        </p>
      </section>
      <section>
        <h3>02 · Draws</h3>
        <ul>
          <li><b>Flush draw</b>: 4 cards of one suit → 9 outs.</li>
          <li><b>Open-ended straight draw</b>: 4 in a row → 8 outs. <b>Gutshot</b> (missing a middle card) → 4 outs.</li>
          <li>If you have both, cards that count twice are counted once (flush + open-ended = 15).</li>
        </ul>
      </section>
      <section>
        <h3>03 · Improvements</h3>
        <ul>
          <li><b>Overcards</b>: each of your cards above the whole board gives 3 outs to top pair.</li>
          <li><b>Pocket pair → set</b>: 2 outs.</li>
          <li><b>Pair → two pair or trips</b>: 5 outs (3 for your other card + 2 for the pair).</li>
          <li><b>Two pair → full house</b>: 4 outs. <b>Set → full house or quads</b>: 7 outs on the flop.</li>
          <li>Pairing one of your cards that is below the highest board card does not count.</li>
        </ul>
      </section>
      <section>
        <h3>04 · Rule of 2 and 4</h3>
        <ul>
          <li><b>On the flop</b> (2 cards to come): outs × 4 ≈ % to hit by the river.</li>
          <li><b>On the turn</b> (1 card to come): outs × 2 ≈ % to hit on the river.</li>
          <li>After checking you also see the exact % to compare.</li>
        </ul>
      </section>
      <section>
        <h3>05 · Deals</h3>
        <ul>
          <li>There are always at least 2 outs; the board is never paired and you never already have a straight or better.</li>
          <li>
            <kbd className={kbd}>Enter</kbd> or <kbd className={kbd}>Space</kbd>: check / next hand.
          </li>
        </ul>
      </section>
    </>
  );
}

export function OutsRules({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  return lang === 'en' ? (
    <InfoModal eyebrow="How they are counted" title="Outs" onClose={onClose}>
      <RulesEn />
    </InfoModal>
  ) : (
    <InfoModal eyebrow="Cómo se cuentan" title="Outs" onClose={onClose}>
      <RulesEs />
    </InfoModal>
  );
}
