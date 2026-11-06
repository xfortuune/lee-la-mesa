import { useEffect } from 'react';
import { STRAIGHT_EXCEPTIONS } from '../logic';

export function RulesModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-title"
        className="neon-border max-h-[90dvh] w-full max-w-2xl animate-rise overflow-y-auto rounded-t-3xl bg-[#0a0c1c]/95 p-5 text-slate-300 shadow-[0_0_80px_-20px_rgba(168,85,247,0.6)] sm:rounded-3xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan/80">Método EducaPoker</p>
            <h2 id="rules-title" className="text-2xl font-bold text-white">Reglas</h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-xl text-slate-300 transition hover:border-neon-cyan/50 hover:text-white"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 text-sm leading-relaxed [&_b]:text-white [&_h3]:mb-2 [&_h3]:font-mono [&_h3]:text-xs [&_h3]:uppercase [&_h3]:tracking-[0.2em] [&_h3]:text-neon-cyan [&_li]:relative [&_li]:pl-4 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.6em] [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-neon-violet [&_ul]:space-y-1">
          <section>
            <h3>01 · Coordinación del flop</h3>
            <p className="mb-1 font-medium text-neon-pink">Extremadamente coordinada</p>
            <ul>
              <li>Monocolor (3 cartas del mismo palo) <b>y</b> además con escalera posible (sin contar excepciones). Ej.: 6♠7♠8♠.</li>
            </ul>
            <p className="mb-1 mt-3 font-medium text-neon-pink">Coordinada — con dos cartas en mano se puede tener un proyecto completado</p>
            <ul>
              <li>Color: las 3 cartas son del mismo palo (monocolor).</li>
              <li>
                Escalera: alguna combinación de dos cartas hace escalera, sin contar estas excepciones:{' '}
                <span className="font-mono text-slate-200">{STRAIGHT_EXCEPTIONS.join(' · ')}</span>
              </li>
              <li>Una mesa emparejada nunca es coordinada en el flop.</li>
            </ul>
            <p className="mb-1 mt-3 font-medium text-neon-pink">Semicoordinada — si no es coordinada</p>
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
                <b>Mejor apoyo</b>: el rango más alto que no está en la mesa ni es el de tu pareja;{' '}
                <b>segundo mejor</b>: el siguiente. Ej.: en K86, para pareja de 8 → A y Q.
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
            <p className="mb-1 mt-3 font-medium text-neon-pink">Mesa emparejada</p>
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
                <kbd className="rounded-md border border-white/20 bg-white/5 px-1.5 font-mono text-xs">Enter</kbd> o{' '}
                <kbd className="rounded-md border border-white/20 bg-white/5 px-1.5 font-mono text-xs">Espacio</kbd>: comprobar / siguiente mano.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
