// Winamax hand histories: plain-text format (as exported to PokerTracker) and the JSON
// served behind the web replayer links.
import { type Card, parseCard } from './cards';
import {
  type ActionType,
  type HandAction,
  type HandHistory,
  HandParseError,
  type Seat,
  type Street,
  completeActions,
  money,
} from './hand-history';

type RawAction = Omit<HandAction, 'total' | 'allIn'>;

const num = (s: string) => money(parseFloat(s));
const cards = (s: string): Card[] => s.trim().split(/\s+/).filter(Boolean).map(parseCard);

// ---------------------------------------------------------------------------
// Plain text

const SECTION = /^\*\*\* (ANTE\/BLINDS|PRE-FLOP|FLOP|TURN|RIVER|SHOW DOWN|SUMMARY) \*\*\*/;
const ACTION =
  /^(.+?) (posts small blind|posts big blind|posts ante|posts|folds|checks|calls|bets|raises)(?: ([\d.]+)\D*?)?(?: to ([\d.]+)\D*?)?( and is all-in)?$/;

export function parseWinamaxText(text: string): HandHistory {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) throw new HandParseError('empty', 'The hand history is empty.');
  const header = lines[0];
  if (!/^Winamax Poker/i.test(header)) throw new HandParseError('unknown_format', 'Not a Winamax hand history.');
  if (/tournament|tournoi|buy-?in/i.test(header)) throw new HandParseError('not_cash', 'Only cash games are supported for now.');
  if (!/holdem no limit/i.test(header)) throw new HandParseError('not_holdem', "Only No-Limit Hold'em is supported.");

  const stakes = header.match(/\(([\d.]+)(\D*)\/([\d.]+)\D*\)/);
  if (!stakes) throw new HandParseError('invalid', 'Blinds not found in the header.');
  const handId = header.match(/HandId: #(\S+)/)?.[1] ?? '';

  const tableLine = lines.find((l) => l.startsWith('Table:')) ?? '';
  const table = tableLine.match(/Table: '([^']*)'/)?.[1] ?? header.match(/"([^"]+)"/)?.[1] ?? '';
  const maxSeats = Number(tableLine.match(/(\d+)-max/)?.[1] ?? 0);
  const buttonSeat = Number(tableLine.match(/Seat #(\d+) is the button/)?.[1] ?? 0);

  const players: Seat[] = [];
  const raw: RawAction[] = [];
  const streetTotals = new Map<string, number>();
  const showdown: HandHistory['showdown'] = [];
  const winners: HandHistory['winners'] = [];
  let hero: string | null = null;
  let heroCards: Card[] | null = null;
  let board: Card[] = [];
  let rake: number | null = null;
  let section: string | null = null;
  let street: Street = 'preflop';

  for (const line of lines.slice(1)) {
    const sec = line.match(SECTION);
    if (sec) {
      section = sec[1];
      const nextStreet = ({ FLOP: 'flop', TURN: 'turn', RIVER: 'river' } as Record<string, Street>)[section];
      if (nextStreet) {
        street = nextStreet;
        streetTotals.clear();
        const bracketed = [...line.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]).join(' ');
        board = cards(bracketed);
      }
      continue;
    }

    if (section === null) {
      const seat = line.match(/^Seat (\d+): (.+) \(([\d.]+)\D*\)$/);
      if (seat) players.push({ seat: Number(seat[1]), name: seat[2], stack: num(seat[3]) });
      continue;
    }

    if (section === 'SUMMARY') {
      const pot = line.match(/Rake ([\d.]+)/);
      if (pot) rake = num(pot[1]);
      const b = line.match(/^Board: \[([^\]]*)\]/);
      if (b) board = cards(b[1]);
      continue;
    }

    const dealt = line.match(/^Dealt to (.+?) \[([^\]]+)\]$/);
    if (dealt) {
      hero = dealt[1];
      heroCards = cards(dealt[2]);
      continue;
    }

    const shows = line.match(/^(.+?) shows \[([^\]]+)\]/);
    if (shows) {
      showdown.push({ player: shows[1], cards: cards(shows[2]) });
      continue;
    }

    const collected = line.match(/^(.+?) collected ([\d.]+)\D* from/);
    if (collected) {
      winners.push({ player: collected[1], amount: num(collected[2]) });
      continue;
    }

    const act = line.match(ACTION);
    if (!act) continue;
    const [, player, verb, first, to] = act;
    const prev = streetTotals.get(player) ?? 0;
    let type: ActionType;
    let amount = first ? num(first) : 0;
    switch (verb) {
      case 'posts small blind':
        type = 'post_sb';
        break;
      case 'posts big blind':
        type = 'post_bb';
        break;
      case 'posts ante':
        type = 'post_ante';
        break;
      case 'posts':
        type = 'post';
        break;
      case 'folds':
        type = 'fold';
        break;
      case 'checks':
        type = 'check';
        break;
      case 'calls':
        type = 'call';
        break;
      case 'bets':
        type = 'bet';
        break;
      default:
        type = 'raise';
        // "raises X to Y": Y is the new street total, so the chips added are Y minus what was in.
        if (to) amount = money(num(to) - prev);
    }
    // Antes are dead money: they do not count towards the street bet.
    if (type !== 'post_ante') streetTotals.set(player, money(prev + amount));
    raw.push({ street, player, type, amount });
  }

  if (players.length < 2) throw new HandParseError('invalid', 'No seated players found.');

  return {
    site: 'winamax',
    handId,
    table,
    cash: true,
    sb: num(stakes[1]),
    bb: num(stakes[3]),
    currency: stakes[2].trim() || '€',
    maxSeats: maxSeats || players.length,
    buttonSeat,
    players,
    hero,
    heroCards,
    actions: completeActions(players, raw),
    board,
    showdown,
    winners,
    rake,
  };
}

// ---------------------------------------------------------------------------
// Replayer JSON

interface WamAction {
  ACTION: string;
  AMOUNT: string;
  LOGIN: string;
}
interface WamRound {
  ROUND: string;
  BOARD?: string[];
  ACTIONS?: WamAction[];
}
interface WamResultHand {
  LOGIN: string;
  HAND?: string[];
  AMOUNT?: string;
}
interface WamData {
  GAME: { BETTING: string; DEALER: string; PNAME?: string; NAME?: string; TYPE?: string; VARIANT?: string; MONEY?: string; TOURNAMENT_ID?: string };
  PLAYER_LOGIN?: string;
  POCKET_CARDS?: string[];
  SEATS: { SEAT_ID: string; PLAYER: { LOGIN: string; MONEY: string } }[];
  ROUNDS: WamRound[];
  RESULT?: { RAKE?: string; WINNERS?: WamResultHand[]; LOOSERS?: WamResultHand[] };
}

const ROUND_STREET: Record<string, Street> = {
  'ante/blinds': 'preflop',
  'pre-flop': 'preflop',
  preflop: 'preflop',
  flop: 'flop',
  turn: 'turn',
  river: 'river',
};

function wamActionType(action: string): ActionType | null {
  const a = action.toLowerCase();
  if (a.includes('ante')) return 'post_ante';
  if (a.includes('sb') || a.includes('small')) return 'post_sb';
  if (a.includes('bb') || a.includes('big')) return 'post_bb';
  if (a.startsWith('post')) return 'post';
  if (a.startsWith('fold')) return 'fold';
  if (a.startsWith('check')) return 'check';
  if (a.startsWith('call')) return 'call';
  if (a.startsWith('bet')) return 'bet';
  if (a.startsWith('raise') || a.includes('all')) return 'raise';
  return null;
}

export function parseWinamaxJson(json: unknown): HandHistory {
  const root = Array.isArray(json) ? json[0] : json;
  const cur = (root as { CUR?: { DATAS?: WamData; HAND_ID?: string } })?.CUR;
  const d = cur?.DATAS;
  if (!d?.GAME || !d.SEATS || !d.ROUNDS) throw new HandParseError('unknown_format', 'Not a Winamax replayer hand.');

  const g = d.GAME;
  if (g.VARIANT && g.VARIANT.toLowerCase() !== 'holdem') throw new HandParseError('not_holdem', "Only Hold'em is supported.");
  if (g.TOURNAMENT_ID || /tourn|sng|mtt|expresso/i.test(`${g.TYPE ?? ''} ${g.NAME ?? ''}`))
    throw new HandParseError('not_cash', 'Only cash games are supported for now.');
  const betting = g.BETTING.match(/^([\d.]+)-([\d.]+)-(.+)$/);
  if (!betting || !/no-?limit/i.test(betting[3])) throw new HandParseError('not_holdem', "Only No-Limit Hold'em is supported.");

  // SEAT_ID is 0-based; the text format numbers seats from 1.
  const players: Seat[] = d.SEATS.map((s) => ({
    seat: Number(s.SEAT_ID) + 1,
    name: s.PLAYER.LOGIN,
    stack: num(s.PLAYER.MONEY),
  })).sort((a, b) => a.seat - b.seat);

  const raw: RawAction[] = [];
  let board: Card[] = [];
  for (const round of d.ROUNDS) {
    const street = ROUND_STREET[round.ROUND.toLowerCase()];
    if (!street) continue;
    if (round.BOARD?.length) board = round.BOARD.map(parseCard);
    for (const a of round.ACTIONS ?? []) {
      const type = wamActionType(a.ACTION);
      if (type) raw.push({ street, player: a.LOGIN, type, amount: num(a.AMOUNT) });
    }
  }

  const showdown: HandHistory['showdown'] = [];
  for (const h of [...(d.RESULT?.WINNERS ?? []), ...(d.RESULT?.LOOSERS ?? [])]) {
    if (h.HAND?.length && !h.HAND.includes('X') && !showdown.some((s) => s.player === h.LOGIN))
      showdown.push({ player: h.LOGIN, cards: h.HAND.map(parseCard) });
  }

  return {
    site: 'winamax',
    handId: cur?.HAND_ID ?? '',
    table: g.PNAME ?? '',
    cash: true,
    sb: num(betting[1]),
    bb: num(betting[2]),
    currency: '€',
    maxSeats: players.length,
    buttonSeat: Number(g.DEALER) + 1,
    players,
    hero: d.PLAYER_LOGIN ?? null,
    heroCards: d.POCKET_CARDS?.length ? d.POCKET_CARDS.map(parseCard) : null,
    actions: completeActions(players, raw),
    board,
    showdown,
    winners: (d.RESULT?.WINNERS ?? []).map((w) => ({ player: w.LOGIN, amount: num(w.AMOUNT ?? '0') })),
    rake: d.RESULT?.RAKE ? num(d.RESULT.RAKE) : null,
  };
}

// ---------------------------------------------------------------------------
// Replayer links

/**
 * Turns a replayer link (…/replayer.html?2026-6c2b…&lang=es_ES) into the URL of its JSON,
 * or null if the text does not contain a hand id.
 */
export function winamaxHandUrl(link: string): string | null {
  const m = link.match(/(\d{4})-([0-9a-f]{64})/i);
  if (!m) return null;
  const [, year, id] = m;
  const hex = id.toLowerCase();
  return `https://poker-assets.winamax.es/replayer/hand/${year}/${hex.slice(0, 2)}/${hex.slice(2, 4)}/${hex}`;
}

/** Downloads and parses the hand behind a Winamax replayer link. */
export async function fetchWinamaxHand(link: string, fetchFn: typeof fetch = fetch): Promise<HandHistory> {
  const url = winamaxHandUrl(link);
  if (!url) throw new HandParseError('bad_link', 'This is not a Winamax replayer link.');
  let res: Response;
  try {
    res = await fetchFn(url);
  } catch {
    throw new HandParseError('fetch_failed', 'Could not reach Winamax.');
  }
  if (!res.ok) throw new HandParseError('fetch_failed', `Winamax answered ${res.status}.`);
  return parseWinamaxJson(await res.json());
}

/** Parses a pasted hand: Winamax text or replayer JSON. */
export function parseHandText(input: string): HandHistory {
  const text = input.trim();
  if (!text) throw new HandParseError('empty', 'The hand history is empty.');
  if (text.startsWith('[') || text.startsWith('{')) {
    try {
      return parseWinamaxJson(JSON.parse(text));
    } catch (e) {
      if (e instanceof HandParseError) throw e;
      throw new HandParseError('unknown_format', 'Invalid JSON.');
    }
  }
  return parseWinamaxText(text);
}
