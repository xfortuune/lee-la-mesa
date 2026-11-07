// Minimal, safe Markdown renderer for the AI review (headings, lists, paragraphs, **bold**).
// Builds React elements directly; never injects HTML.
import type { ReactNode } from 'react';

const VERDICT_TONES: [RegExp, string][] = [
  [/^(mistake|error)\b/i, 'text-rose-300'],
  [/^(questionable|dudosa)\b/i, 'text-amber-200'],
  [/^(good|buena)\b/i, 'text-emerald-300'],
];

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (!part.startsWith('**') || !part.endsWith('**')) return part;
    const inner = part.slice(2, -2);
    const tone = VERDICT_TONES.find(([re]) => re.test(inner))?.[1] ?? 'text-white';
    return (
      <strong key={i} className={`font-semibold ${tone}`}>
        {inner}
      </strong>
    );
  });
}

export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) blocks.push(<p key={blocks.length}>{inline(para.join(' '))}</p>);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}>{inline(it)}</li>);
    blocks.push(
      list.ordered ? (
        <ol key={blocks.length} className="list-decimal space-y-1.5 pl-5 marker:text-slate-500">
          {items}
        </ol>
      ) : (
        <ul key={blocks.length} className="list-disc space-y-1.5 pl-5 marker:text-neon-violet">
          {items}
        </ul>
      ),
    );
    list = null;
  };

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (!line) {
      flushPara();
      flushList();
    } else if (heading) {
      flushPara();
      flushList();
      blocks.push(
        <h3 key={blocks.length} className="pt-2 font-mono text-xs uppercase tracking-[0.2em] text-neon-violet">
          {heading[1].replace(/\*\*/g, '')}
        </h3>,
      );
    } else if (bullet || numbered) {
      flushPara();
      const ordered = !!numbered;
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  return <div className="space-y-3 text-sm leading-relaxed text-slate-300">{blocks}</div>;
}
