import { InfoModal } from '../../components/InfoModal';
import { useLang } from '../../i18n/lang';
import { STRAIGHT_EXCEPTIONS } from '../../logic';

const sub = 'mb-1 mt-3 font-medium text-neon-pink';
const kbd = 'rounded-md border border-white/20 bg-white/5 px-1.5 font-mono text-xs';
const exceptions = <span className="font-mono text-slate-200">{STRAIGHT_EXCEPTIONS.join(' · ')}</span>;

function RulesEs() {
  return (
    <>
      <section>
        <h3>01 · Coordinación del flop</h3>
        <p className="mb-1 font-medium text-neon-pink">Extremadamente coordinada</p>
        <ul>
          <li>Monocolor (3 cartas del mismo palo) <b>y</b> además con escalera posible (sin contar excepciones). Ej.: 6♠7♠8♠.</li>
        </ul>
        <p className={sub}>Coordinada — con dos cartas en mano se puede tener un proyecto completado</p>
        <ul>
          <li>Color: las 3 cartas son del mismo palo (monocolor).</li>
          <li>Escalera: alguna combinación de dos cartas hace escalera, sin contar estas excepciones: {exceptions}</li>
          <li>Una mesa emparejada nunca es coordinada en el flop.</li>
        </ul>
        <p className={sub}>Semicoordinada — si no es coordinada</p>
        <ul>
          <li>Se ignoran los 5, 4, 3 y 2 (y la pareja de la mesa). Si quedan menos de 2 cartas → seca.</li>
          <li>Se buscan las dos cartas más próximas y se cuentan los huecos entre ellas.</li>
          <li>Con proyecto de color (2 del mismo palo): semicoordinada con 3 huecos o menos.</li>
          <li>Arcoíris (sin proyecto de color): semicoordinada con 2 huecos o menos.</li>
        </ul>
        <p className="mt-3 font-medium text-neon-pink">Seca — todo lo demás</p>
      </section>
      <section>
        <h3>02 · Fuerza de la mano</h3>
        <ul>
          <li>Extremadamente coordinada se evalúa como coordinada; semicoordinada, como seca.</li>
          <li>La pareja de la mesa se ignora (salvo en las reglas de mesa emparejada).</li>
          <li>
            <b>Mejor apoyo</b>: el rango más alto que no está en la mesa ni es el de tu pareja; <b>segundo mejor</b>: el
            siguiente. Ej.: en K86, para pareja de 8 → A y Q.
          </li>
          <li>Overpair (pareja en mano mayor que la mesa) es mejor que pareja máxima.</li>
          <li>Pareja en mano entre la 1.ª y la 2.ª carta → pareja media con el mejor apoyo; por debajo → pareja baja.</li>
        </ul>
      </section>
      <section>
        <h3>03 · Mesa coordinada</h3>
        <ul>
          <li><b>Muy fuerte</b>: escalera (o color si la mesa es monocolor). Escalera de color siempre.</li>
          <li><b>Fuerte</b>: dobles parejas o mejor que no sea muy fuerte.</li>
          <li><b>Media</b>: pareja máxima u overpair.</li>
          <li><b>Débil</b>: por debajo de pareja máxima pero al menos carta alta As (o Rey con As en mesa).</li>
          <li><b>Nada</b>: el resto.</li>
        </ul>
      </section>
      <section>
        <h3>04 · Mesa seca o semicoordinada</h3>
        <ul>
          <li><b>Muy fuerte</b>: las mejores dobles parejas (las dos cartas más altas) o mejor.</li>
          <li><b>Fuerte</b>: pareja máxima con el mejor o segundo mejor apoyo, overpair y otras dobles parejas.</li>
          <li><b>Media</b>: pareja máxima con peor apoyo; pareja media con el mejor o segundo mejor apoyo.</li>
          <li><b>Débil</b>: peor que eso, pero al menos carta alta As (o Rey con As en mesa).</li>
          <li><b>Nada</b>: el resto.</li>
        </ul>
        <p className={sub}>Mesa emparejada</p>
        <ul>
          <li><b>Muy fuerte</b>: full o póker.</li>
          <li><b>Fuerte</b>: trío.</li>
          <li>El resto, como mesa sin emparejar ignorando la pareja.</li>
        </ul>
      </section>
      <section>
        <h3>05 · Atajos</h3>
        <ul>
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
        <h3>01 · Flop texture</h3>
        <p className="mb-1 font-medium text-neon-pink">Extremely coordinated</p>
        <ul>
          <li>Monotone (all 3 cards of one suit) <b>and</b> a straight is also possible (not counting exceptions). E.g. 6♠7♠8♠.</li>
        </ul>
        <p className={sub}>Coordinated — two hole cards can already make a completed draw</p>
        <ul>
          <li>Flush: all 3 cards share a suit (monotone).</li>
          <li>Straight: some two-card combination makes a straight, not counting these exceptions: {exceptions}</li>
          <li>A paired board is never coordinated on the flop.</li>
        </ul>
        <p className={sub}>Semi-coordinated — if it is not coordinated</p>
        <ul>
          <li>Ignore 5s, 4s, 3s and 2s (and the board pair). If fewer than 2 cards remain → dry.</li>
          <li>Take the two closest remaining cards and count the gaps between them.</li>
          <li>With a flush draw (2 cards of one suit): semi-coordinated with 3 gaps or fewer.</li>
          <li>Rainbow (no flush draw): semi-coordinated with 2 gaps or fewer.</li>
        </ul>
        <p className="mt-3 font-medium text-neon-pink">Dry — everything else</p>
      </section>
      <section>
        <h3>02 · Hand strength</h3>
        <ul>
          <li>An extremely coordinated board is evaluated as coordinated; a semi-coordinated one, as dry.</li>
          <li>The board pair is ignored (except in the paired-board rules).</li>
          <li>
            <b>Best kicker</b>: the highest rank that is neither on the board nor your pair; <b>second best</b>: the
            next one. E.g. on K86, for a pair of 8s → A and Q.
          </li>
          <li>An overpair (pocket pair above the whole board) beats top pair.</li>
          <li>A pocket pair between the 1st and 2nd board card → middle pair with the best kicker; below that → bottom pair.</li>
        </ul>
      </section>
      <section>
        <h3>03 · Coordinated board</h3>
        <ul>
          <li><b>Very strong</b>: a straight (or a flush on a monotone board). A straight flush always.</li>
          <li><b>Strong</b>: two pair or better that is not very strong.</li>
          <li><b>Medium</b>: top pair or an overpair.</li>
          <li><b>Weak</b>: below top pair but at least ace high (or king high with an ace on the board).</li>
          <li><b>Nothing</b>: everything else.</li>
        </ul>
      </section>
      <section>
        <h3>04 · Dry or semi-coordinated board</h3>
        <ul>
          <li><b>Very strong</b>: the best two pair (the two highest board cards) or better.</li>
          <li><b>Strong</b>: top pair with the best or second-best kicker, an overpair and other two pairs.</li>
          <li><b>Medium</b>: top pair with a worse kicker; middle pair with the best or second-best kicker.</li>
          <li><b>Weak</b>: worse than that, but at least ace high (or king high with an ace on the board).</li>
          <li><b>Nothing</b>: everything else.</li>
        </ul>
        <p className={sub}>Paired board</p>
        <ul>
          <li><b>Very strong</b>: a full house or four of a kind.</li>
          <li><b>Strong</b>: three of a kind.</li>
          <li>Everything else, as an unpaired board ignoring the pair.</li>
        </ul>
      </section>
      <section>
        <h3>05 · Shortcuts</h3>
        <ul>
          <li>
            <kbd className={kbd}>Enter</kbd> or <kbd className={kbd}>Space</kbd>: check / next hand.
          </li>
        </ul>
      </section>
    </>
  );
}

export function RulesModal({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  return lang === 'en' ? (
    <InfoModal eyebrow="EducaPoker method" title="Rules" onClose={onClose}>
      <RulesEn />
    </InfoModal>
  ) : (
    <InfoModal eyebrow="Método EducaPoker" title="Reglas" onClose={onClose}>
      <RulesEs />
    </InfoModal>
  );
}
