import type { ReactNode } from 'react';
import { useLang } from '../i18n/lang';
import { APP_NAME } from '../tools/registry';
import { LangSwitch } from './LangSwitch';

/** Cabecera común de las herramientas: volver al hub, título y acciones a la derecha. */
export function ToolHeader({
  title,
  index,
  subtitle,
  actions,
}: {
  title: string;
  index?: string;
  /** Sustituye a "PokerToolBox · Tool NN". */
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { lang } = useLang();
  const back = lang === 'en' ? 'Back to home' : 'Volver al inicio';
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <a
          href="#/"
          aria-label={back}
          title={back}
          className="neon-border grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-xl text-neon-cyan shadow-[0_0_24px_-6px_var(--color-neon-cyan)] transition hover:bg-neon-cyan/10 hover:shadow-[0_0_28px_-4px_var(--color-neon-cyan)]"
        >
          ←
        </a>
        <div className="min-w-0">
          <h1 className="truncate bg-gradient-to-r from-white via-neon-cyan to-neon-violet bg-clip-text text-base font-bold uppercase tracking-[0.06em] text-transparent sm:text-2xl sm:tracking-[0.12em]">
            {title}
          </h1>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:text-[11px] sm:tracking-[0.25em]">
            {subtitle ?? `${APP_NAME} · ${lang === 'en' ? 'Tool' : 'Herramienta'} ${index}`}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <LangSwitch />
      </div>
    </header>
  );
}

export const headerButtonClass =
  'rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-slate-200 backdrop-blur transition hover:border-neon-violet/60 hover:text-white hover:shadow-[0_0_20px_-6px_var(--color-neon-violet)]';
