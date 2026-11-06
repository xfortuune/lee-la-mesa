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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 text-gray-800 shadow-xl sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="rules-title" className="text-xl font-bold">Reglas (método EducaPoker)</h2>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-2xl leading-none text-gray-500 hover:bg-gray-100"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 text-sm leading-relaxed [&_h3]:mb-1 [&_h3]:font-semibold [&_h3]:text-green-800 [&_li]:ml-5 [&_li]:list-disc">
          <section>
            <h3>1. Coordinación del flop</h3>
            <p className="mb-1 font-medium">Coordinada — con dos cartas en mano se puede tener un proyecto completado:</p>
            <ul>
              <li>Color: las 3 cartas son del mismo palo (monocolor).</li>
              <li>
                Escalera: alguna combinación de dos cartas hace escalera, sin contar estas excepciones:{' '}
                <span className="font-mono">{STRAIGHT_EXCEPTIONS.join(', ')}</span>.
              </li>
              <li>Una mesa emparejada nunca es coordinada en el flop.</li>
            </ul>
            <p className="mb-1 mt-2 font-medium">Semicoordinada — si no es coordinada:</p>
            <ul>
              <li>Se ignoran los 5, 4, 3 y 2 (y la pareja de la mesa). Si quedan menos de 2 cartas → seca.</li>
              <li>Se buscan las dos cartas más próximas y se cuentan los huecos entre ellas.</li>
              <li>Con proyecto de color (2 cartas del mismo palo): semicoordinada si hay 3 huecos o menos.</li>
              <li>Arcoíris (sin proyecto de color): semicoordinada si hay 2 huecos o menos.</li>
            </ul>
            <p className="mt-2 font-medium">Seca — todo lo demás.</p>
          </section>

          <section>
            <h3>2. Fuerza de la mano</h3>
            <ul>
              <li>Para la fuerza, una mesa semicoordinada se trata como seca.</li>
              <li>La pareja de la mesa se ignora (salvo en las reglas de mesa emparejada).</li>
              <li>
                Apoyo: el <b>mejor apoyo</b> es el rango más alto que no está en la mesa ni es el de tu pareja; el{' '}
                <b>segundo mejor</b> es el siguiente. Ej.: en K86, para pareja de 8 → A y Q.
              </li>
              <li>Overpair (pareja en mano mayor que la mesa) es mejor que pareja máxima.</li>
              <li>Pareja en mano entre la primera y la segunda carta → pareja media con el mejor apoyo; por debajo → pareja baja.</li>
            </ul>
          </section>

          <section>
            <h3>Mesa coordinada</h3>
            <ul>
              <li><b>Muy fuerte</b>: escalera (o color si la mesa es monocolor). Escalera de color siempre.</li>
              <li><b>Fuerte</b>: dobles parejas o mejor que no sea muy fuerte.</li>
              <li><b>Media</b>: pareja máxima u overpair.</li>
              <li><b>Débil</b>: por debajo de pareja máxima pero al menos carta alta As (o Rey con As en mesa).</li>
              <li><b>Nada</b>: el resto.</li>
            </ul>
          </section>

          <section>
            <h3>Mesa seca o semicoordinada</h3>
            <ul>
              <li><b>Muy fuerte</b>: las mejores dobles parejas (las dos cartas más altas) o mejor.</li>
              <li><b>Fuerte</b>: pareja máxima con el mejor o segundo mejor apoyo, overpair y otras dobles parejas.</li>
              <li><b>Media</b>: pareja máxima con peor apoyo; pareja media con el mejor o segundo mejor apoyo.</li>
              <li><b>Débil</b>: peor que eso, pero al menos carta alta As (o Rey con As en mesa).</li>
              <li><b>Nada</b>: el resto.</li>
            </ul>
            <p className="mb-1 mt-2 font-medium">Mesa emparejada:</p>
            <ul>
              <li><b>Muy fuerte</b>: full o póker.</li>
              <li><b>Fuerte</b>: trío.</li>
              <li>El resto, como mesa sin emparejar ignorando la pareja.</li>
            </ul>
          </section>

          <section>
            <h3>Atajos</h3>
            <ul>
              <li><kbd className="rounded border px-1">Enter</kbd> o <kbd className="rounded border px-1">Espacio</kbd>: comprobar / siguiente mano.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
