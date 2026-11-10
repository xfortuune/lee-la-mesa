import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { CardPicker } from '../../components/CardPicker';
import { CardSlot } from '../../components/CardSlot';
import { cardKey } from '../../components/cardStyles';
import { ToolHeader } from '../../components/ToolHeader';
import { useLang } from '../../i18n/lang';
import {
  ALL_HANDS,
  type Card,
  type Category,
  type ComboKey,
  GROUPS,
  type HandKey,
  type NextCardRow,
  PRESETS,
  type PresetId,
  type Range,
  RangeParseError,
  type RangeEquityResult,
  TOTAL_COMBOS,
  analyzeRange,
  combosOf,
  filterRange,
  formatRange,
  fullDeck,
  invertRange,
  liveCombos,
  parseRange,
  presetRange,
  rangeSize,
  setHand,
  shuffle,
  topPercent,
} from '../../logic';
import { toolById } from '../registry';
import { HandEditor } from './HandEditor';
import { type CellInfo, RangeGrid } from './RangeGrid';
import { StatsPanel } from './StatsPanel';
import { StreetTable } from './StreetTable';
import { Distribution, type Segment } from './Distribution';
import { GROUP_COLORS, GROUP_LABELS, PRESET_LABELS, T } from './texts';
import { useRangeTask } from './useRangeTask';

const TOOL = toolById('range-lab');
const SAVED_KEY = 'pokertoolbox:range-lab:saved';
const BOARD_LABELS = ['Flop', 'Flop', 'Flop', 'Turn', 'River'];
const MAX_HISTORY = 50;

type Tab = 'range' | 'board' | 'stats' | 'streets';
type ToolsTab = 'shortcuts' | 'text' | 'saved';
type Slot = { kind: 'board' | 'hero'; i: number };
interface Saved {
  name: string;
  text: string;
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const num = (x: number) => (Math.round(x * 10) / 10).toString();

function loadSaved(): Saved[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const list = raw ? (JSON.parse(raw) as Saved[]) : [];
    return Array.isArray(list) ? list.filter((s) => typeof s?.name === 'string' && typeof s?.text === 'string') : [];
  } catch {
    return [];
  }
}

function storeSaved(list: Saved[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  } catch {
    // Private mode or full storage: the list just won't persist.
  }
}

/** True from the lg breakpoint, where the page fits the screen and cards get smaller. */
function useWide() {
  const query = '(min-width: 1024px)';
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setWide(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return wide;
}

function Panel({
  title,
  eyebrow,
  children,
  className = '',
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur sm:p-4 ${className}`}>
      {(title || eyebrow) && (
        <div className="mb-3">
          {eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">{eyebrow}</p>}
          {title && <h2 className="text-base font-bold text-white">{title}</h2>}
        </div>
      )}
      {children}
    </section>
  );
}

const chip =
  'rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-amber-300/60 hover:text-white hover:shadow-[0_0_14px_-6px_#fbbf24]';

export default function RangeLab() {
  const { lang } = useLang();
  const t = T[lang];

  const [range, setRange] = useState<Range>(() => presetRange('co'));
  const [history, setHistory] = useState<Range[]>([]);
  const [mode, setMode] = useState<'paint' | 'edit'>('paint');
  const [paintWeight, setPaintWeight] = useState(1);
  const [topPct, setTopPct] = useState(20);
  const [board, setBoard] = useState<(Card | null)[]>([null, null, null, null, null]);
  const [hero, setHero] = useState<(Card | null)[]>([null, null]);
  const [picking, setPicking] = useState<Slot | null>(null);
  const [editHand, setEditHand] = useState<HandKey | null>(null);
  const [selected, setSelected] = useState<Set<Category>>(new Set());
  const [hover, setHover] = useState<Category | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<Saved[]>(loadSaved);
  const [saveName, setSaveName] = useState('');
  const [tab, setTab] = useState<Tab>('range');
  const [side, setSide] = useState<'stats' | 'streets'>('stats');
  const [toolsTab, setToolsTab] = useState<ToolsTab>('shortcuts');
  /** Null: open preflop, folded once there is a flop (to leave room for the stats). */
  const [toolsOpen, setToolsOpen] = useState<boolean | null>(null);
  const wide = useWide();

  // --- Range edits -------------------------------------------------------------------------
  const snapshot = useCallback(() => setHistory((h) => [...h.slice(-MAX_HISTORY + 1), range]), [range]);
  const commit = useCallback(
    (next: Range) => {
      snapshot();
      setRange(next);
      setDraft(null);
      setParseError(null);
      setSelected(new Set());
    },
    [snapshot],
  );
  const undo = useCallback(() => {
    if (!history.length) return;
    setRange(history[history.length - 1]);
    setHistory(history.slice(0, -1));
    setDraft(null);
  }, [history]);

  const addHands = (hands: HandKey[]) => commit(hands.reduce((r, h) => setHand(r, h, paintWeight), range));

  // --- Board and Hero ----------------------------------------------------------------------
  const boardCards = useMemo(() => board.filter((c): c is Card => !!c), [board]);
  const heroCards = useMemo(() => hero.filter((c): c is Card => !!c), [hero]);
  const hasHero = heroCards.length === 2;
  const dead = useMemo(() => [...boardCards, ...heroCards], [boardCards, heroCards]);
  const deadKeys = useMemo(() => new Set(dead.map(cardKey)), [dead]);

  const randomFlop = useCallback(() => {
    const heroKeys = new Set(hero.filter(Boolean).map((c) => cardKey(c!)));
    const deck = shuffle(fullDeck().filter((c) => !heroKeys.has(cardKey(c))));
    setBoard([deck[0], deck[1], deck[2], null, null]);
    setToolsOpen(null);
    setSelected(new Set());
  }, [hero]);

  const usedElsewhere = useMemo(() => {
    const set = new Set<string>();
    board.forEach((c, i) => c && !(picking?.kind === 'board' && picking.i === i) && set.add(cardKey(c)));
    hero.forEach((c, i) => c && !(picking?.kind === 'hero' && picking.i === i) && set.add(cardKey(c)));
    return set;
  }, [board, hero, picking]);

  const setSlot = (s: Slot, card: Card | null) => {
    const update = (arr: (Card | null)[]) => arr.map((c, i) => (i === s.i ? card : c));
    if (s.kind === 'board') setBoard(update);
    else setHero(update);
    setSelected(new Set());
  };

  const pick = (card: Card) => {
    if (!picking) return;
    setSlot(picking, card);
    let next: Slot | null = null;
    if (picking.kind === 'board') {
      const i = board.findIndex((c, idx) => idx > picking.i && idx < 3 && !c);
      if (i >= 0) next = { kind: 'board', i };
    } else if (!hero[1 - picking.i]) next = { kind: 'hero', i: 1 - picking.i };
    setPicking(next);
  };

  // --- Analysis ----------------------------------------------------------------------------
  const analysis = useMemo(
    () => (boardCards.length >= 3 ? analyzeRange(range, boardCards, heroCards) : null),
    [range, boardCards, heroCards],
  );
  const totalAll = useMemo(() => rangeSize(range), [range]);
  const live = analysis ? analysis.total : rangeSize(range, dead);
  const street = boardCards.length >= 5 ? 'River' : boardCards.length === 4 ? 'Turn' : 'Flop';

  /** Live combos split into pairs, suited and offsuit (shown before the flop). */
  const composition = useMemo(() => {
    const w = { pairs: 0, suited: 0, offsuit: 0 };
    for (const c of liveCombos(range, dead)) {
      const [a, b] = c.cards;
      w[a.rank === b.rank ? 'pairs' : a.suit === b.suit ? 'suited' : 'offsuit'] += c.weight;
    }
    return Object.entries(w) as ['pairs' | 'suited' | 'offsuit', number][];
  }, [range, dead]);

  const highlight = useMemo<Set<ComboKey> | null>(() => {
    if (!hover || !analysis) return null;
    const stat =
      (analysis.made as Record<string, { combos: ComboKey[] }>)[hover] ??
      (analysis.draws as Record<string, { combos: ComboKey[] }>)[hover];
    return new Set(stat?.combos ?? []);
  }, [hover, analysis]);

  const cells = useMemo(() => {
    const m = new Map<HandKey, CellInfo>();
    for (const hand of ALL_HANDS) {
      const combos = combosOf(hand);
      let inRange = 0;
      let liveN = 0;
      let w = 0;
      let hl = 0;
      for (const c of combos) {
        const cw = range[c.key];
        if (!cw) continue;
        inRange++;
        w += cw;
        if (!c.cards.some((x) => deadKeys.has(cardKey(x)))) liveN++;
        if (highlight?.has(c.key)) hl++;
      }
      m.set(hand, { total: combos.length, inRange, live: liveN, weight: inRange ? w / inRange : 0, highlighted: hl });
    }
    return m;
  }, [range, deadKeys, highlight]);

  // --- Worker tasks ------------------------------------------------------------------------
  const boardContiguous = board.slice(0, boardCards.length).every(Boolean);
  const equity = useRangeTask<RangeEquityResult>(
    live > 0 && boardContiguous ? { kind: 'equity', hero: hasHero ? heroCards : null, range, board: boardCards } : null,
  );
  const tableStreet =
    boardContiguous && boardCards.length === 3 ? 'turn' : boardContiguous && boardCards.length === 4 ? 'river' : null;
  const table = useRangeTask<NextCardRow[]>(
    tableStreet && live > 0 ? { kind: 'table', hero: hasHero ? heroCards : null, range, board: boardCards } : null,
  );

  // --- Filters -----------------------------------------------------------------------------
  const toggle = (c: Category) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });
  const applyFilter = (m: 'keep' | 'remove') => {
    if (!analysis || !selected.size) return;
    // Combos blocked by the board or Hero can't pass a filter, so they leave the range.
    commit(filterRange(analysis, [...selected], m));
  };

  // --- Text and saved ranges ---------------------------------------------------------------
  const text = draft ?? formatRange(range);
  const applyText = () => {
    try {
      commit(parseRange(text));
    } catch (e) {
      setParseError(e instanceof RangeParseError ? e.token : String(e));
    }
  };
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(formatRange(range));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the text is still selectable in the box.
    }
  };
  const save = () => {
    const name = saveName.trim();
    if (!name) return;
    const list = [...saved.filter((s) => s.name !== name), { name, text: formatRange(range) }];
    setSaved(list);
    storeSaved(list);
    setSaveName('');
  };
  const removeSaved = (name: string) => {
    const list = saved.filter((s) => s.name !== name);
    setSaved(list);
    storeSaved(list);
  };

  // --- Shortcuts ---------------------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || picking || editHand) return;
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, select')) return;
      const k = e.key.toLowerCase();
      if (k === 'r') randomFlop();
      else if (k === 'c') commit({});
      else if (k === 'z') undo();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [picking, editHand, randomFlop, commit, undo]);

  // --- Layout ------------------------------------------------------------------------------
  // Phones: one tab at a time. From lg the page fits the screen: grid on the left, board and
  // stats on the right (stats and turn/river share a column on lg, three columns from xl).
  const tabs: [Tab, string][] = [
    ['range', t.range],
    ['board', t.board],
    ['stats', t.stats],
    ['streets', t.streets],
  ];
  // The turn/river table only exists once there is a flop (or a turn) to deal from.
  const hasTable = !!tableStreet && live > 0;
  const shownTabs = hasTable ? tabs : tabs.filter(([id]) => id !== 'streets');
  const activeTab: Tab = tab === 'streets' && !hasTable ? 'stats' : tab;
  const activeSide = hasTable ? side : 'stats';
  const onTab = (x: Tab) => (activeTab === x ? 'flex' : 'hidden');
  const onSide = (x: 'stats' | 'streets') => `${onTab(x)} ${activeSide === x ? 'lg:flex' : 'lg:hidden'} xl:flex`;
  const cardSize = wide ? 'xs' : 'sm';

  const counter = (
    <div className="flex items-baseline gap-2 font-mono tabular-nums">
      <span className="text-lg font-bold text-amber-200 sm:text-xl">{num(live)}</span>
      <span className="text-xs text-slate-500">
        / {num(totalAll)} {t.combos}
      </span>
      <span className="text-xs text-slate-400">· {pct(totalAll / TOTAL_COMBOS)}</span>
    </div>
  );

  const toolsTabs: [ToolsTab, string][] = [
    ['shortcuts', t.shortcutsTab],
    ['text', t.text],
    ['saved', t.saved],
  ];

  // Shortcuts, text and saved ranges share one box: under the grid on phones, in the right
  // column from lg so the grid can use the full height.
  const toolsExpanded = toolsOpen ?? !analysis;
  const toolsBox = (
    <div
      className={`flex min-h-0 shrink-0 flex-col rounded-2xl border border-white/[0.07] bg-black/20 lg:rounded-3xl lg:bg-white/[0.03] ${toolsExpanded ? 'lg:h-[150px]' : ''}`}
    >
      <div
        role="tablist"
        className={`flex gap-1 px-2 pt-1.5 ${toolsExpanded ? 'border-b border-white/[0.06]' : 'pb-0.5'}`}
      >
        {toolsTabs.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={toolsExpanded && toolsTab === id}
            aria-expanded={toolsExpanded && toolsTab === id}
            onClick={() => {
              // Tapping the open tab folds the box; any other tab opens it.
              setToolsOpen(!(toolsExpanded && toolsTab === id));
              setToolsTab(id);
            }}
            className={`-mb-px border-b-2 px-2.5 pb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition ${
              toolsExpanded && toolsTab === id
                ? 'border-amber-300 text-amber-200'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {toolsExpanded && (
        <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
          {toolsTab === 'shortcuts' && (
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-3 text-sm">
                <span className="min-w-9 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                  {t.top}
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.5}
                  value={topPct}
                  onPointerDown={snapshot}
                  onKeyDown={snapshot}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setTopPct(v);
                    setRange(topPercent(v));
                    setDraft(null);
                    setSelected(new Set());
                  }}
                  className="min-w-0 flex-1 accent-amber-400"
                />
                <span className="w-12 text-right font-mono tabular-nums text-amber-200">{topPct}%</span>
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="min-w-9 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                  {t.groups}
                </span>
                <button onClick={() => addHands(GROUPS.pairs)} className={chip}>
                  {t.pairs}
                </button>
                <button onClick={() => addHands(GROUPS.suited)} className={chip}>
                  {t.suited}
                </button>
                <button onClick={() => addHands(GROUPS.broadways)} className={chip}>
                  {t.broadways}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5" title={t.presetsNote}>
                <span className="min-w-9 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                  6-max
                </span>
                {(Object.keys(PRESETS) as PresetId[]).map((id) => (
                  <button key={id} onClick={() => commit(presetRange(id))} className={chip}>
                    {PRESET_LABELS[id]}
                  </button>
                ))}
                <span className="text-[10px] text-slate-500">· {t.presetsNote}</span>
              </div>
            </div>
          )}

          {toolsTab === 'text' && (
            <div className="flex h-full gap-2">
              <textarea
                value={text}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setParseError(null);
                }}
                rows={4}
                spellCheck={false}
                aria-label={t.text}
                className="min-w-0 flex-1 resize-none rounded-xl border border-white/10 bg-black/30 p-2 font-mono text-xs text-slate-200 outline-none focus:border-amber-300/60"
              />
              <div className="flex w-24 shrink-0 flex-col gap-1.5">
                <button onClick={applyText} disabled={draft === null} className={`${chip} disabled:opacity-40`}>
                  {t.apply}
                </button>
                <button onClick={copyText} className={chip}>
                  {copied ? `✓ ${t.copied}` : t.copy}
                </button>
                {parseError && (
                  <p role="alert" className="text-[11px] leading-tight text-rose-300">
                    {t.parseError}: “{parseError}”
                  </p>
                )}
              </div>
            </div>
          )}

          {toolsTab === 'saved' && (
            <div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  save();
                }}
              >
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder={t.name}
                  aria-label={t.name}
                  maxLength={40}
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white outline-none focus:border-amber-300/60"
                />
                <button type="submit" disabled={!saveName.trim()} className={`${chip} disabled:opacity-40`}>
                  {t.save}
                </button>
              </form>
              {saved.length ? (
                <ul className="mt-1.5 flex flex-col">
                  {saved.map((s) => (
                    <li key={s.name} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/[0.03]">
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-200" title={s.text}>
                        {s.name}
                      </span>
                      <button
                        onClick={() => {
                          try {
                            commit(parseRange(s.text));
                          } catch {
                            // A broken entry is ignored.
                          }
                        }}
                        className="text-xs text-amber-200 hover:underline"
                      >
                        {t.load}
                      </button>
                      <button
                        onClick={() => removeSaved(s.name)}
                        aria-label={`${t.delete} ${s.name}`}
                        className="text-xs text-slate-500 hover:text-rose-300"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">{t.noSaved}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const rangePanel = (
    <Panel
      className={`${onTab('range')} flex-col gap-3 lg:flex lg:min-h-0 lg:w-[calc(min(46vw,100dvh_-_190px)_+_34px)] ${hasTable ? 'xl:w-[calc(min(36vw,100dvh_-_190px)_+_34px)]' : 'xl:w-[calc(min(46vw,100dvh_-_190px)_+_34px)]'}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label={t.paint} className="flex rounded-xl border border-white/10 p-0.5">
          {(['paint', 'edit'] as const).map((m) => (
            <button
              key={m}
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${mode === m ? 'bg-amber-300/20 text-amber-100' : 'text-slate-400 hover:text-white'}`}
            >
              {m === 'paint' ? t.paint : t.edit}
            </button>
          ))}
        </div>
        <label className="flex min-w-32 flex-1 items-center gap-2 text-xs text-slate-400">
          {t.weight}
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={Math.round(paintWeight * 100)}
            onChange={(e) => setPaintWeight(Number(e.target.value) / 100)}
            className="min-w-0 flex-1 accent-amber-400"
          />
          <span className="w-9 text-right font-mono text-amber-200">{Math.round(paintWeight * 100)}%</span>
        </label>
        <div className="flex gap-1.5">
          <button onClick={() => commit({})} className={chip}>
            {t.clear}
          </button>
          <button onClick={() => commit(invertRange(range))} className={chip}>
            {t.invert}
          </button>
          <button
            onClick={undo}
            disabled={!history.length}
            aria-label={t.undo}
            title={t.undo}
            className={`${chip} disabled:opacity-40`}
          >
            ↶
          </button>
        </div>
      </div>

      {/* The grid is as big as the screen height allows */}
      <div className="w-full">
        <RangeGrid
          cells={cells}
          mode={mode}
          paintWeight={paintWeight}
          hasHighlight={!!highlight}
          onStrokeStart={() => {
            snapshot();
            setDraft(null);
            setSelected(new Set());
          }}
          onPaint={(hand, add) => setRange((r) => setHand(r, hand, add ? paintWeight : 0))}
          onEdit={setEditHand}
        />
      </div>
      <p className="-mt-1 text-[11px] text-slate-500 lg:hidden">{t.paintHint}</p>

      <div className="lg:hidden">{toolsBox}</div>
    </Panel>
  );

  const eq = equity.result;
  const boardPanel = (
    <section
      aria-label={t.table}
      className={`${onTab('board')} relative shrink-0 flex-col gap-3 overflow-hidden rounded-3xl border border-amber-300/20 bg-[radial-gradient(ellipse_at_center,_#2a2210_0%,_#14110a_50%,_#070918_100%)] p-3 shadow-[0_0_60px_-24px_#fbbf24,inset_0_0_60px_rgba(0,0,0,0.6)] sm:p-4 lg:flex`}
    >
      <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-3">
        <div className="flex gap-1.5">
          {board.map((c, i) => (
            <div key={i} className={`flex flex-col items-center gap-1 ${i === 3 || i === 4 ? 'ml-0.5' : ''}`}>
              <CardSlot
                card={c}
                size={cardSize}
                label={`${t.card} ${i + 1} ${t.ofBoard}`}
                active={picking?.kind === 'board' && picking.i === i}
                onClick={() => setPicking({ kind: 'board', i })}
              />
              <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-slate-500">{BOARD_LABELS[i]}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 border-l border-white/10 pl-4">
          {hero.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <CardSlot
                card={c}
                size={cardSize}
                label={`${t.heroCard} ${i + 1}`}
                active={picking?.kind === 'hero' && picking.i === i}
                onClick={() => setPicking({ kind: 'hero', i })}
              />
              <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-amber-300/80">{t.hero}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 self-center">
          <button onClick={randomFlop} className={chip} title={t.randomBoard}>
            ⟳ <span className="lg:hidden 2xl:inline">{t.randomBoard}</span>
          </button>
          <button
            onClick={() => {
              setBoard([null, null, null, null, null]);
              setHero([null, null]);
            }}
            className={chip}
            title={t.clearBoard}
          >
            ✕ <span className="lg:hidden 2xl:inline">{t.clearBoard}</span>
          </button>
        </div>
      </div>

      {/* Equity, in one line */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/30 px-3 py-2">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-300/80">{t.equity}</p>
          <p className="truncate text-xs text-slate-300">{hasHero ? t.heroVsRange : t.rangeVsRandom}</p>
        </div>
        <span className="font-mono text-2xl font-bold tabular-nums text-white">
          {live > 0 && eq ? pct(eq.equity) : '—'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-neon-cyan transition-[width] duration-500"
              style={{ width: live > 0 && eq ? `${eq.equity * 100}%` : '0%' }}
            />
          </div>
          <p className="mt-1 truncate text-right font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">
            {equity.busy
              ? t.calculating
              : eq
                ? `${eq.method === 'exact' ? t.exact : t.monteCarlo} · ${eq.samples.toLocaleString(t.locale)}`
                : ''}
          </p>
        </div>
      </div>
    </section>
  );

  // On a flop: strong / medium / draws / air. Preflop: what the range is made of.
  const segments: Segment[] = analysis
    ? (['strong', 'medium', 'draws', 'air'] as const).map((g) => ({
        key: g,
        label: GROUP_LABELS[lang][g],
        color: GROUP_COLORS[g],
        weight: analysis.groups[g],
      }))
    : composition.map(([key, weight], i) => ({
        key,
        label: key === 'pairs' ? t.pairs : key === 'suited' ? t.suited : t.offsuit,
        color: ['#fbbf24', '#22e4ff', '#a855f7'][i],
        weight,
      }));
  const distribution = (
    <Distribution
      className={`${onTab('stats')} lg:flex`}
      eyebrow={analysis ? `${t.distribution} · ${street}` : `${t.composition} · Preflop`}
      title={`${num(live)} ${t.combos}`}
      segments={segments}
      empty={t.emptyRange}
    />
  );

  const statsPanel = analysis && live > 0 && (
    <Panel className={`${onSide('stats')} min-h-0 flex-1 flex-col lg:overflow-y-auto`}>
      <StatsPanel
        analysis={analysis}
        equity={equity.busy ? null : eq}
        hasHero={hasHero}
        selected={selected}
        onToggle={toggle}
        onHover={setHover}
        onFilter={applyFilter}
      />
    </Panel>
  );

  const streetsPanel = hasTable && (
    <Panel className={`${onSide('streets')} min-h-0 flex-1 flex-col`}>
      {table.result ? (
        <StreetTable
          rows={table.result}
          street={tableStreet}
          busy={table.busy}
          onPick={(card) => setSlot({ kind: 'board', i: boardCards.length }, card)}
        />
      ) : (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-2 w-2 animate-ping rounded-full bg-amber-300" />
          {t.calculating}
        </p>
      )}
    </Panel>
  );

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[1700px] flex-col gap-3 px-4 py-4 sm:px-6 lg:h-dvh lg:overflow-hidden lg:py-3">
      <ToolHeader title={TOOL.text[lang].name} index="05" actions={<div className="hidden lg:block">{counter}</div>} />

      {/* Phones and tablets: sticky combo counter and tabs */}
      <div className="sticky top-0 z-30 -mx-4 flex flex-col gap-2 border-b border-white/[0.06] bg-void/85 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        {counter}
        <div role="tablist" className={`grid gap-1 ${hasTable ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {shownTabs.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setTab(id)}
              className={`rounded-lg px-1 py-1.5 text-xs font-semibold transition ${
                activeTab === id ? 'bg-amber-300/20 text-amber-100 shadow-[0_0_14px_-6px_#fbbf24]' : 'text-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`flex flex-col gap-3 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[auto_minmax(0,1fr)] ${hasTable ? 'xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,0.85fr)]' : ''}`}
      >
        {rangePanel}
        <div className="flex min-h-0 flex-col gap-3">
          {boardPanel}
          {distribution}
          <div className="hidden lg:contents">{toolsBox}</div>
          {/* lg only: stats and turn/river take turns in this column */}
          <div
            role="tablist"
            className={`hidden shrink-0 grid-cols-2 gap-1 rounded-xl border border-white/10 p-0.5 xl:hidden ${hasTable ? 'lg:grid' : ''}`}
          >
            {(['stats', 'streets'] as const).map((id) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeSide === id}
                onClick={() => setSide(id)}
                className={`rounded-lg py-1 text-xs font-semibold transition ${activeSide === id ? 'bg-amber-300/20 text-amber-100' : 'text-slate-400 hover:text-white'}`}
              >
                {id === 'stats' ? t.stats : t.streets}
              </button>
            ))}
          </div>
          {statsPanel}
          <div className="contents xl:hidden">{streetsPanel}</div>
        </div>
        {hasTable && <div className="hidden min-h-0 flex-col xl:flex">{streetsPanel}</div>}
      </div>

      <p className="hidden shrink-0 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-slate-600 lg:block">
        {t.shortcuts} · {t.paintHint}
      </p>

      {picking && (
        <CardPicker
          title={
            picking.kind === 'board'
              ? `${t.table} · ${BOARD_LABELS[picking.i]}`
              : `${t.hero} · ${t.card} ${picking.i + 1}`
          }
          current={(picking.kind === 'board' ? board : hero)[picking.i]}
          used={usedElsewhere}
          onPick={pick}
          onClear={() => {
            setSlot(picking, null);
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      )}
      {editHand && (
        <HandEditor
          hand={editHand}
          range={range}
          dead={deadKeys}
          paintWeight={paintWeight}
          onChange={(next) => {
            snapshot();
            setRange(next);
            setDraft(null);
          }}
          onClose={() => setEditHand(null)}
        />
      )}
    </div>
  );
}
