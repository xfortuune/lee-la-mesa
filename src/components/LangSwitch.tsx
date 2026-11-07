import { LANGS, useLang } from '../i18n/lang';

/** EN / ES language switcher, at the top right of every page. */
export function LangSwitch() {
  const { lang, setLang } = useLang();
  const other = lang === 'en' ? 'es' : 'en';
  return (
    <>
      {/* Mobile: a single button that switches to the other language */}
      <button
        type="button"
        onClick={() => setLang(other)}
        title={other === 'en' ? 'Switch to English' : 'Cambiar a español'}
        aria-label={other === 'en' ? 'Switch to English' : 'Cambiar a español'}
        className="flex h-9 shrink-0 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur transition hover:border-neon-cyan/50 sm:hidden"
      >
        <span className="bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">{lang}</span>
        <span className="text-slate-500" aria-hidden="true">⇄</span>
      </button>

      {/* Tablet and up: EN | ES segmented control */}
      <div
        role="group"
        aria-label={lang === 'en' ? 'Language' : 'Idioma'}
        className="hidden shrink-0 rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur sm:flex"
      >
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            title={l === 'en' ? 'English' : 'Español'}
            className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.12em] transition ${
              lang === l
                ? 'bg-gradient-to-r from-neon-cyan to-neon-violet text-void shadow-[0_0_14px_-4px_var(--color-neon-cyan)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </>
  );
}
