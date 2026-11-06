import { type ReactNode, useEffect } from 'react';

/** Ventana de información (reglas, ayuda) con el estilo del hub. Se cierra con Escape o tocando fuera. */
export function InfoModal({
  eyebrow,
  title,
  onClose,
  children,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
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
        aria-labelledby="info-title"
        className="neon-border max-h-[90dvh] w-full max-w-2xl animate-rise overflow-y-auto rounded-t-3xl bg-[#0a0c1c]/95 p-5 text-slate-300 shadow-[0_0_80px_-20px_rgba(168,85,247,0.6)] sm:rounded-3xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan/80">{eyebrow}</p>
            <h2 id="info-title" className="text-2xl font-bold text-white">
              {title}
            </h2>
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
          {children}
        </div>
      </div>
    </div>
  );
}
