import { useState } from 'react';
import { ToolHeader } from '../../components/ToolHeader';
import { useLang } from '../../i18n/lang';
import EXAMPLE_HAND from '../../logic/fixtures/winamax-hand.txt?raw';
import { type HandHistory, HandParseError, fetchWinamaxHand, parseHandText } from '../../logic';
import { toolById } from '../registry';
import { HandView } from './HandView';
import { ERRORS, T } from './texts';

const TOOL = toolById('hand-review');

type Source = 'link' | 'text';

export default function HandReview() {
  const { lang } = useLang();
  const t = T[lang];
  const [source, setSource] = useState<Source>('link');
  const [link, setLink] = useState('');
  const [text, setText] = useState('');
  const [hand, setHand] = useState<HandHistory | null>(null);
  const [error, setError] = useState<HandParseError['code'] | 'other' | null>(null);
  const [loading, setLoading] = useState(false);

  const fail = (e: unknown) => setError(e instanceof HandParseError ? e.code : 'other');

  const analyze = async () => {
    setError(null);
    setHand(null);
    if (source === 'text') {
      try {
        setHand(parseHandText(text));
      } catch (e) {
        fail(e);
      }
      return;
    }
    setLoading(true);
    try {
      setHand(await fetchWinamaxHand(link.trim()));
    } catch (e) {
      fail(e);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setSource('text');
    setText(EXAMPLE_HAND);
    setError(null);
    setHand(parseHandText(EXAMPLE_HAND));
  };

  const reset = () => {
    setHand(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tab = (s: Source, label: string) => (
    <button
      type="button"
      onClick={() => setSource(s)}
      aria-pressed={source === s}
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
        source === s
          ? 'bg-neon-lime/15 text-white shadow-[inset_0_0_0_1px_var(--color-neon-lime)]'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  const canAnalyze = !loading && (source === 'link' ? link.trim() !== '' : text.trim() !== '');

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8">
      <ToolHeader title={TOOL.text[lang].name} index="04" />

      {!hand && (
        <section className="neon-border animate-rise rounded-3xl bg-white/[0.03] p-4 backdrop-blur sm:p-6">
          <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1" role="group">
            {tab('link', t.linkTab)}
            {tab('text', t.textTab)}
          </div>

          <form
            className="mt-5 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (canAnalyze) void analyze();
            }}
          >
            {source === 'link' ? (
              <label className="flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">{t.linkLabel}</span>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder={t.linkPlaceholder}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-neon-lime/60 focus:outline-none"
                />
                <span className="text-xs text-slate-500">{t.linkHelp}</span>
              </label>
            ) : (
              <label className="flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">{t.textLabel}</span>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t.textPlaceholder}
                  rows={9}
                  spellCheck={false}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-xs leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-neon-lime/60 focus:outline-none"
                />
                <span className="text-xs text-slate-500">{t.textHelp}</span>
              </label>
            )}

            {error && (
              <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error === 'other' ? ERRORS[lang].invalid : ERRORS[lang][error]}
              </p>
            )}

            <button
              type="submit"
              disabled={!canAnalyze}
              className="rounded-2xl bg-gradient-to-r from-neon-lime to-neon-cyan py-3.5 text-base font-bold uppercase tracking-[0.18em] text-void shadow-[0_0_40px_-10px_var(--color-neon-lime)] transition hover:shadow-[0_0_50px_-6px_var(--color-neon-cyan)] disabled:cursor-not-allowed disabled:bg-none disabled:bg-white/[0.05] disabled:text-slate-500 disabled:shadow-none"
            >
              {loading ? t.loading : t.analyze}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>{t.scope}</span>
            <button onClick={loadExample} className="font-medium text-neon-lime underline-offset-2 hover:underline">
              {t.example}
            </button>
          </div>
        </section>
      )}

      {hand && (
        <>
          <HandView hand={hand} />
          <button
            onClick={reset}
            className="self-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-neon-lime/60 hover:text-white"
          >
            ← {t.newHand}
          </button>
        </>
      )}
    </div>
  );
}
