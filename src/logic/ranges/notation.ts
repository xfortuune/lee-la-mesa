// Range text notation: "AA-TT, AKs-ATs, KQo, 76s, A5s+, 22+, AhKh, AKo:50".
import { type Suit, parseCard, rankChar } from '../cards';
import {
  ALL_HANDS,
  type ComboKey,
  type HandKey,
  RANKS_DESC,
  type Range,
  comboByKey,
  comboKey,
  combosOf,
  handRanks,
  handType,
  setCombos,
  setHand,
} from './combos';

export class RangeParseError extends Error {
  readonly token: string;
  constructor(token: string) {
    super(`Cannot read "${token}"`);
    this.token = token;
  }
}

const RANK_RE = '[2-9TJQKA]';
const HAND_RE = new RegExp(`^(${RANK_RE})(${RANK_RE})([so])?$`);
const COMBO_RE = new RegExp(`^(${RANK_RE}[shdc♠♥♦♣])(${RANK_RE}[shdc♠♥♦♣])$`);

/** Normalises "akS" → "AKs", "10" → "T" (suit letters in combos stay lowercase). */
function normalise(token: string): string {
  return token
    .replace(/10/g, 'T')
    .replace(/([2-9tjqka])/gi, (m) => m.toUpperCase())
    .replace(/([SO])$/, (m) => m.toLowerCase())
    .replace(/([2-9TJQKA])([SHDC])/g, (_, r, s) => r + s.toLowerCase());
}

/** Hand keys for "AK" (both), "AKs", "AKo", "QQ"; high card first. */
function handsOf(hand: string): HandKey[] {
  const m = hand.match(HAND_RE);
  if (!m) return [];
  const [, a, b, t] = m;
  const [hi, lo] = handRanks(`${a}${b}`)[0] >= handRanks(`${a}${b}`)[1] ? [a, b] : [b, a];
  if (hi === lo) return t ? [] : [`${hi}${lo}`];
  return t ? [`${hi}${lo}${t}`] : [`${hi}${lo}s`, `${hi}${lo}o`];
}

/** "TT+" → TT…AA; "A5s+" → A5s…AKs. */
function plusHands(base: HandKey): HandKey[] {
  const [hi, lo] = handRanks(base);
  const type = handType(base);
  if (type === 'pair') return RANKS_DESC.filter((r) => r >= hi).map((r) => `${rankChar(r)}${rankChar(r)}`);
  const suffix = type === 'suited' ? 's' : 'o';
  return RANKS_DESC.filter((r) => r >= lo && r < hi).map((r) => `${rankChar(hi)}${rankChar(r)}${suffix}`);
}

/** "AA-TT" or "AKs-ATs" (same high card and type). */
function dashHands(from: HandKey, to: HandKey): HandKey[] | null {
  const [h1, l1] = handRanks(from);
  const [h2, l2] = handRanks(to);
  const type = handType(from);
  if (type !== handType(to)) return null;
  if (type === 'pair') {
    const [top, bottom] = h1 >= h2 ? [h1, h2] : [h2, h1];
    return RANKS_DESC.filter((r) => r <= top && r >= bottom).map((r) => `${rankChar(r)}${rankChar(r)}`);
  }
  if (h1 !== h2) return null;
  const [top, bottom] = l1 >= l2 ? [l1, l2] : [l2, l1];
  const suffix = type === 'suited' ? 's' : 'o';
  return RANKS_DESC.filter((r) => r <= top && r >= bottom).map((r) => `${rankChar(h1)}${rankChar(r)}${suffix}`);
}

/** Parses range text. Throws RangeParseError naming the first token it cannot read. */
export function parseRange(text: string): Range {
  let range: Range = {};
  for (const raw of text.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean)) {
    const [body, weightText] = raw.split(':');
    let weight = 1;
    if (weightText !== undefined) {
      const w = Number(weightText.replace('%', ''));
      if (!Number.isFinite(w) || w < 0) throw new RangeParseError(raw);
      weight = w > 1 ? w / 100 : w;
    }
    const token = normalise(body);

    const combo = token.match(COMBO_RE);
    if (combo) {
      range = setCombos(range, [comboKey(parseCard(combo[1]), parseCard(combo[2]))], weight);
      continue;
    }

    let hands: HandKey[] | null = null;
    if (token.endsWith('+')) {
      const base = handsOf(token.slice(0, -1));
      hands = base.length ? base.flatMap(plusHands) : null;
    } else if (token.includes('-')) {
      const [a, b] = token.split('-');
      const from = handsOf(a);
      const to = handsOf(b);
      if (from.length === to.length && from.length > 0) {
        const parts = from.map((f, i) => dashHands(f, to[i]));
        hands = parts.every(Boolean) ? (parts.flat() as HandKey[]) : null;
      }
    } else {
      const h = handsOf(token);
      hands = h.length ? h : null;
    }
    if (!hands) throw new RangeParseError(raw);
    for (const h of hands) range = setHand(range, h, weight);
  }
  return range;
}

// ---------------------------------------------------------------------------
// Export

const SUIT_LETTER: Record<Suit, string> = { '♠': 's', '♥': 'h', '♦': 'd', '♣': 'c' };

function comboText(key: ComboKey): string {
  const c = comboByKey(key)!;
  return c.cards.map((x) => `${rankChar(x.rank)}${SUIT_LETTER[x.suit]}`).join('');
}

/** Groups consecutive runs of hands (already ordered from strongest) into notation. */
function runsToText(hands: HandKey[], all: HandKey[], plusTop: HandKey): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < hands.length) {
    let j = i;
    while (j + 1 < hands.length && all.indexOf(hands[j + 1]) === all.indexOf(hands[j]) + 1) j++;
    const first = hands[i];
    const last = hands[j];
    if (first === plusTop && j > i) out.push(`${last}+`);
    else if (j === i) out.push(first);
    else out.push(`${first}-${last}`);
    i = j + 1;
  }
  return out;
}

/** Formats a range as compact text. parseRange(formatRange(r)) gives back r. */
export function formatRange(range: Range): string {
  // Group combos by weight (rounded to whole percents).
  const byWeight = new Map<number, ComboKey[]>();
  for (const [key, w] of Object.entries(range)) {
    if (w <= 0) continue;
    const pct = Math.round(w * 100);
    byWeight.set(pct, [...(byWeight.get(pct) ?? []), key]);
  }

  const parts: string[] = [];
  for (const pct of [...byWeight.keys()].sort((a, b) => b - a)) {
    const keys = new Set(byWeight.get(pct));
    const suffix = pct === 100 ? '' : `:${pct}`;
    const full = ALL_HANDS.filter((h) => combosOf(h).every((c) => keys.has(c.key)));
    const fullSet = new Set(full);
    const tokens: string[] = [];

    const pairs = RANKS_DESC.map((r) => `${rankChar(r)}${rankChar(r)}`);
    tokens.push(...runsToText(pairs.filter((h) => fullSet.has(h)), pairs, 'AA'));

    for (const hi of RANKS_DESC) {
      for (const t of ['s', 'o']) {
        const line = RANKS_DESC.filter((r) => r < hi).map((r) => `${rankChar(hi)}${rankChar(r)}${t}`);
        tokens.push(...runsToText(line.filter((h) => fullSet.has(h)), line, line[0]));
      }
    }

    for (const h of ALL_HANDS) {
      if (fullSet.has(h)) continue;
      for (const c of combosOf(h)) if (keys.has(c.key)) tokens.push(comboText(c.key));
    }
    parts.push(...tokens.map((t) => t + suffix));
  }
  return parts.join(', ');
}
