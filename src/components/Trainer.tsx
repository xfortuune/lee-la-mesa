// Piezas comunes de los entrenadores: opciones de respuesta, corrección, marcador y botón principal.
import type { ReactNode } from 'react';
import { type Score, hitRate } from '../lib/score';

interface OptionGroupProps<T extends string | number> {
  index: string;
  title: string;
  options: T[];
  labels?: Partial<Record<T, string>>;
  value: T | null;
  correct: T | null; // solo tras comprobar
  onChange: (v: T) => void;
  gridClass: string;
}

export function OptionGroup<T extends string | number>({
  index,
  title,
  options,
  labels,
  value,
  correct,
  onChange,
  gridClass,
}: OptionGroupProps<T>) {
  const checked = correct !== null;
  return (
    <fieldset>
      <legend className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        <span className="font-mono text-neon-cyan">{index}</span>
        {title}
      </legend>
      <div className={`grid gap-2 ${gridClass}`}>
        {options.map((opt) => {
          const selected = value === opt;
          let style =
            'border-white/10 bg-white/[0.04] text-slate-200 hover:border-neon-cyan/40 hover:bg-white/[0.08] hover:text-white';
          if (selected && !checked)
            style =
              'border-neon-cyan bg-neon-cyan/10 text-white shadow-[0_0_20px_-4px_var(--color-neon-cyan),inset_0_0_12px_-4px_var(--color-neon-cyan)]';
          if (checked) {
            if (opt === correct)
              style =
                'border-emerald-400 bg-emerald-400/15 text-emerald-100 shadow-[0_0_22px_-4px_rgba(52,211,153,0.9)]';
            else if (selected)
              style = 'border-rose-500 bg-rose-500/15 text-rose-100 shadow-[0_0_22px_-4px_rgba(244,63,94,0.9)]';
            else style = 'border-white/5 bg-white/[0.02] text-slate-500';
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={checked}
              aria-pressed={selected}
              onClick={() => onChange(opt)}
              className={`min-h-12 rounded-2xl border px-3 py-2 text-sm font-medium leading-tight backdrop-blur transition duration-200 active:scale-[0.97] sm:text-[15px] ${style}`}
            >
              {labels?.[opt] ?? opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Feedback({ ok, title, children, delay }: { ok: boolean; title: string; children: ReactNode; delay: number }) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`relative animate-rise overflow-hidden rounded-2xl border bg-white/[0.04] p-4 pl-5 text-sm leading-relaxed backdrop-blur ${
        ok ? 'border-emerald-400/30' : 'border-rose-500/30'
      }`}
    >
      <span
        className={`absolute inset-y-0 left-0 w-1 ${
          ok ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,1)]'
        }`}
      />
      <p className={`mb-1 flex items-center gap-2 font-semibold ${ok ? 'text-emerald-300' : 'text-rose-300'}`}>
        <span className="font-mono text-xs">{ok ? '[ OK ]' : '[ FALLO ]'}</span>
        {title}
      </p>
      <div className="text-slate-300">{children}</div>
    </div>
  );
}

function Stat({ label, value, accent, bar }: { label: string; value: string | number; accent: string; bar?: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-2.5 text-center backdrop-blur">
      <div className={`font-mono text-xl font-bold tabular-nums sm:text-2xl ${accent}`}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:text-[11px]">{label}</div>
      {bar !== undefined && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet transition-[width] duration-500"
            style={{ width: `${bar}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function Scoreboard({ score }: { score: Score }) {
  const pct = hitRate(score);
  return (
    <section aria-label="Marcador" className="grid grid-cols-4 gap-2">
      <Stat label="Aciertos" value={score.hits} accent="text-emerald-300" />
      <Stat label="Fallos" value={score.misses} accent="text-rose-300" />
      <Stat label="Acierto" value={`${pct}%`} accent="text-white" bar={pct} />
      <Stat label="Racha" value={score.streak} accent="text-neon-cyan" />
    </section>
  );
}

export function PrimaryButton({
  checked,
  disabled,
  onClick,
}: {
  checked: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-neon-cyan via-[#6aa8ff] to-neon-violet py-4 text-base font-bold uppercase tracking-[0.2em] text-void shadow-[0_0_40px_-8px_var(--color-neon-cyan)] transition hover:shadow-[0_0_50px_-6px_var(--color-neon-violet)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-none disabled:bg-white/[0.05] disabled:text-slate-500 disabled:shadow-none"
    >
      <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/40 opacity-0 blur-md transition-all duration-700 group-enabled:group-hover:left-full group-enabled:group-hover:opacity-100" />
      <span className="relative">{checked ? 'Siguiente mano →' : 'Comprobar'}</span>
    </button>
  );
}

export function ResetScoreButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      onClick={() => {
        if (window.confirm('¿Reiniciar el marcador?')) onReset();
      }}
      className="font-mono text-xs uppercase tracking-[0.15em] text-slate-500 transition hover:text-rose-300"
    >
      Reiniciar marcador
    </button>
  );
}

export function ShortcutHint() {
  return (
    <p className="mt-2 hidden font-mono text-[11px] text-slate-600 sm:block">
      ⏎ Enter / Espacio — comprobar · siguiente mano
    </p>
  );
}
