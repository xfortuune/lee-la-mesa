// Objective numbers for a hand history: positions, pot and pot odds at each of Hero's decisions,
// stack depth and equity. No AI involved; this feeds both the UI and the AI prompt.
import type { Lang } from '../i18n/lang';
import { type Card, cardsToString } from './cards';
import { calculateEquity } from './equity';
import { type HandAction, type HandHistory, STREETS, type Street, money } from './hand-history';

export type Position = 'BTN' | 'SB' | 'BB' | 'UTG' | 'UTG+1' | 'MP' | 'LJ' | 'HJ' | 'CO';

/** Position of each player, from the button and the seating order. */
export function positions(hand: HandHistory): Map<string, Position> {
  const seats = [...hand.players].sort((a, b) => a.seat - b.seat);
  const n = seats.length;
  // The button player, or the last one before an empty button seat.
  let start = seats.findIndex((p) => p.seat === hand.buttonSeat);
  if (start < 0) {
    const before = seats.filter((p) => p.seat < hand.buttonSeat);
    start = before.length ? seats.indexOf(before[before.length - 1]) : n - 1;
  }
  const order = [...seats.slice(start), ...seats.slice(0, start)].map((p) => p.name);
  const result = new Map<string, Position>();
  if (n === 2) {
    // Heads-up: the button posts the small blind.
    result.set(order[0], 'BTN');
    result.set(order[1], 'BB');
    return result;
  }
  const middle: Position[] = (['UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO'] as Position[]).slice(-(n - 3) || 6);
  if (n - 3 > 0) middle[0] = 'UTG';
  const labels: Position[] = ['BTN', 'SB', 'BB', ...(n > 3 ? middle : [])];
  order.forEach((name, i) => result.set(name, labels[i]));
  return result;
}

/** Number of board cards visible on each street. */
const BOARD_SIZE: Record<Street, number> = { preflop: 0, flop: 3, turn: 4, river: 5 };

/** Board cards visible on a street. */
export function boardOn(hand: HandHistory, street: Street): Card[] {
  return hand.board.slice(0, BOARD_SIZE[street]);
}

export interface Decision {
  /** Index of the action in hand.actions. */
  index: number;
  action: HandAction;
  street: Street;
  board: Card[];
  /** Pot before Hero acts (all streets so far), in chips. */
  pot: number;
  /** Chips Hero had to put in to call (0 if checking was possible). */
  toCall: number;
  /** Share of the final pot Hero would pay to call: toCall / (pot + toCall). Only for calls and folds. */
  potOdds: number | null;
  /** Hero's stack before acting, in chips. */
  stack: number;
  /** Smaller of Hero's stack and the biggest active opponent stack, in chips. */
  effectiveStack: number;
  /** Stack-to-pot ratio (effective stack / pot), postflop only. */
  spr: number | null;
  /** Opponents still in the hand. */
  opponents: string[];
  /** Hero's equity against random hands for each active opponent (0..1). */
  equityVsRandom: number | null;
  /** Hero's equity against the cards the opponents showed, if all of them showed (0..1). */
  equityVsShown: number | null;
}

export interface HandAnalysis {
  positions: Map<string, Position>;
  heroPosition: Position | null;
  /** Hero's stack at the start of the hand, in big blinds. */
  heroStackBB: number;
  decisions: Decision[];
  /** Pot before each street (in chips), for display. */
  potByStreet: Record<Street, number>;
  /** Streets that were actually played. */
  streets: Street[];
  heroInvested: number;
  heroWon: number;
  /** Hero's profit or loss in chips. */
  heroNet: number;
}

const EQUITY_SAMPLES = 6_000;

function equityOf(hero: Card[], opponents: (Card[] | null)[], board: Card[]): number {
  const r = calculateEquity(
    { players: [hero, ...opponents.map((c) => c ?? [null, null])], board },
    { samples: EQUITY_SAMPLES },
  );
  return r.players[0].equity;
}

export function analyzeHand(hand: HandHistory, options: { equity?: boolean } = {}): HandAnalysis {
  const withEquity = options.equity ?? true;
  const pos = positions(hand);
  const hero = hand.hero;
  const stacks = new Map(hand.players.map((p) => [p.name, p.stack]));
  const folded = new Set<string>();
  const shown = new Map(hand.showdown.map((s) => [s.player, s.cards]));
  const decisions: Decision[] = [];

  let pot = 0;
  let street: Street | null = null;
  let streetBets = new Map<string, number>();

  hand.actions.forEach((a, index) => {
    if (a.street !== street) {
      street = a.street;
      streetBets = new Map();
    }
    const isPost = a.type.startsWith('post');
    if (hero && a.player === hero && !isPost && hand.heroCards) {
      const maxBet = Math.max(0, ...streetBets.values());
      const mine = streetBets.get(hero) ?? 0;
      const stack = stacks.get(hero) ?? 0;
      const toCall = money(Math.min(Math.max(0, maxBet - mine), stack));
      const opponents = hand.players
        .map((p) => p.name)
        .filter((n) => n !== hero && !folded.has(n) && hand.actions.some((x) => x.player === n));
      const oppStacks = opponents.map((n) => (stacks.get(n) ?? 0) + (streetBets.get(n) ?? 0) - mine);
      const effectiveStack = money(Math.min(stack, Math.max(0, ...oppStacks)));
      const board = boardOn(hand, a.street);
      const allShown = opponents.length > 0 && opponents.every((n) => shown.has(n));
      decisions.push({
        index,
        action: a,
        street: a.street,
        board,
        pot: money(pot),
        toCall,
        potOdds: toCall > 0 && (a.type === 'call' || a.type === 'fold') ? toCall / (pot + toCall) : null,
        stack: money(stack),
        effectiveStack,
        spr: a.street === 'preflop' ? null : effectiveStack / Math.max(pot, 0.0001),
        opponents,
        equityVsRandom:
          withEquity && opponents.length > 0
            ? equityOf(
                hand.heroCards,
                opponents.map(() => null),
                board,
              )
            : null,
        equityVsShown:
          withEquity && allShown
            ? equityOf(
                hand.heroCards,
                opponents.map((n) => shown.get(n)!),
                board,
              )
            : null,
      });
    }
    if (a.type === 'fold') folded.add(a.player);
    pot = money(pot + a.amount);
    stacks.set(a.player, money((stacks.get(a.player) ?? 0) - a.amount));
    if (a.type !== 'post_ante') streetBets.set(a.player, a.total);
  });

  const streets = STREETS.filter((s) => hand.board.length >= BOARD_SIZE[s]);
  // Pot at the start of each street: everything put in on the earlier streets.
  const potByStreet = Object.fromEntries(
    STREETS.map((s, i) => [
      s,
      money(hand.actions.filter((a) => STREETS.indexOf(a.street) < i).reduce((sum, a) => sum + a.amount, 0)),
    ]),
  ) as Record<Street, number>;
  const heroStack = hand.players.find((p) => p.name === hero)?.stack ?? 0;
  const heroInvested = money(hand.actions.filter((a) => a.player === hero).reduce((s, a) => s + a.amount, 0));
  const heroWon = money(hand.winners.filter((w) => w.player === hero).reduce((s, w) => s + w.amount, 0));

  return {
    positions: pos,
    heroPosition: hero ? (pos.get(hero) ?? null) : null,
    heroStackBB: money(heroStack / hand.bb),
    decisions,
    potByStreet,
    streets,
    heroInvested,
    heroWon,
    heroNet: money(heroWon - heroInvested),
  };
}

// ---------------------------------------------------------------------------
// Text helpers (shared by the UI and the AI prompt)

/** Amount in big blinds with at most one decimal: "27.5 BB". */
export function inBB(chips: number, bb: number, lang: Lang = 'en'): string {
  const v = Math.round((chips / bb) * 10) / 10;
  const s = Number.isInteger(v) ? String(v) : v.toFixed(1);
  return `${lang === 'es' ? s.replace('.', ',') : s} BB`;
}

export function pct(x: number, lang: Lang = 'en'): string {
  const s = (x * 100).toFixed(1);
  return lang === 'es' ? `${s.replace('.', ',')} %` : `${s}%`;
}

/** "HJ raises to 2.5 BB (all-in)". `label` gives the name to show for each player. */
export function describeAction(a: HandAction, bb: number, label: (player: string) => string, lang: Lang = 'en'): string {
  const who = label(a.player);
  const amt = inBB(a.amount, bb, lang);
  const to = inBB(a.total, bb, lang);
  const allIn = a.allIn ? (lang === 'en' ? ' (all-in)' : ' (all-in)') : '';
  const en: Record<HandAction['type'], string> = {
    post_sb: `${who} posts the small blind ${amt}`,
    post_bb: `${who} posts the big blind ${amt}`,
    post_ante: `${who} posts an ante ${amt}`,
    post: `${who} posts ${amt}`,
    fold: `${who} folds`,
    check: `${who} checks`,
    call: `${who} calls ${amt}`,
    bet: `${who} bets ${amt}`,
    raise: `${who} raises to ${to}`,
  };
  const es: Record<HandAction['type'], string> = {
    post_sb: `${who} pone la ciega pequeña ${amt}`,
    post_bb: `${who} pone la ciega grande ${amt}`,
    post_ante: `${who} pone un ante ${amt}`,
    post: `${who} pone ${amt}`,
    fold: `${who} se retira`,
    check: `${who} pasa`,
    call: `${who} paga ${amt}`,
    bet: `${who} apuesta ${amt}`,
    raise: `${who} sube a ${to}`,
  };
  return (lang === 'en' ? en : es)[a.type] + allIn;
}

export const STREET_LABELS: Record<Lang, Record<Street, string>> = {
  en: { preflop: 'Preflop', flop: 'Flop', turn: 'Turn', river: 'River' },
  es: { preflop: 'Preflop', flop: 'Flop', turn: 'Turn', river: 'River' },
};

// ---------------------------------------------------------------------------
// AI prompt

/**
 * Builds a ready-to-paste prompt for an AI coach. Player names are replaced by positions
 * (Hero stays "Hero") so no screen names leave the site.
 */
export function buildReviewPrompt(hand: HandHistory, analysis: HandAnalysis, lang: Lang): string {
  const en = lang === 'en';
  const hero = hand.hero;
  const label = (p: string) => (p === hero ? `Hero (${analysis.positions.get(p) ?? '?'})` : (analysis.positions.get(p) ?? '?'));
  const bb = (c: number) => inBB(c, hand.bb, lang);
  const stakes = `${hand.sb}${hand.currency}/${hand.bb}${hand.currency}`;
  const lines: string[] = [];

  lines.push(
    en
      ? "You are an experienced No-Limit Hold'em cash game coach. Review this hand and tell me whether Hero played it well."
      : 'Eres un entrenador experto de cash games de No-Limit Hold\'em. Revisa esta mano y dime si Hero la jugó bien.',
    '',
  );
  lines.push(
    en
      ? `Game: NL Hold'em cash game, blinds ${stakes}, ${hand.players.length} players dealt in (${hand.maxSeats}-max table).`
      : `Juego: cash game de NL Hold'em, ciegas ${stakes}, ${hand.players.length} jugadores en la mano (mesa ${hand.maxSeats}-max).`,
  );
  if (hero && hand.heroCards)
    lines.push(
      en
        ? `Hero: ${analysis.heroPosition} with ${cardsToString(hand.heroCards)}, stack ${bb(analysis.heroStackBB * hand.bb)}.`
        : `Hero: ${analysis.heroPosition} con ${cardsToString(hand.heroCards)}, stack ${bb(analysis.heroStackBB * hand.bb)}.`,
    );
  lines.push(
    `${en ? 'Stacks' : 'Stacks'}: ${hand.players.map((p) => `${label(p.name)} ${bb(p.stack)}`).join(', ')}.`,
    '',
  );

  for (const street of analysis.streets) {
    const acts = hand.actions.filter((a) => a.street === street && !a.type.startsWith('post'));
    const board = boardOn(hand, street);
    const header = `${STREET_LABELS[lang][street]}${board.length ? ` [${cardsToString(board)}]` : ''} (${en ? 'pot' : 'bote'} ${bb(street === 'preflop' ? hand.sb + hand.bb : analysis.potByStreet[street])})`;
    lines.push(
      `${header}: ${acts.length ? acts.map((a) => describeAction(a, hand.bb, label, lang)).join(', ') : en ? 'no action (players all-in)' : 'sin acción (jugadores all-in)'}.`,
    );
  }

  if (hand.showdown.length) {
    lines.push(
      `${en ? 'Showdown' : 'Showdown'}: ${hand.showdown.map((s) => `${label(s.player)} ${en ? 'shows' : 'enseña'} ${cardsToString(s.cards)}`).join(', ')}.`,
    );
  }
  if (hand.winners.length) {
    lines.push(
      `${en ? 'Result' : 'Resultado'}: ${hand.winners.map((w) => `${label(w.player)} ${en ? 'wins' : 'gana'} ${bb(w.amount)}`).join(', ')}.`,
    );
  }

  if (analysis.decisions.length) {
    lines.push('', en ? "Numbers computed for Hero's decisions:" : 'Números calculados para las decisiones de Hero:');
    for (const d of analysis.decisions) {
      const parts = [
        `${STREET_LABELS[lang][d.street]}, ${describeAction(d.action, hand.bb, label, lang)}`,
        `${en ? 'pot before acting' : 'bote antes de actuar'} ${bb(d.pot)}`,
      ];
      if (d.potOdds !== null)
        parts.push(
          en
            ? `to call ${bb(d.toCall)}, pot odds ${pct(d.potOdds, lang)} (equity needed to call)`
            : `para pagar ${bb(d.toCall)}, pot odds ${pct(d.potOdds, lang)} (equity necesaria para pagar)`,
        );
      if (d.spr !== null) parts.push(`SPR ${d.spr.toFixed(1)}`);
      if (d.equityVsRandom !== null)
        parts.push(
          en
            ? `equity vs ${d.opponents.length} random hand${d.opponents.length > 1 ? 's' : ''} ${pct(d.equityVsRandom, lang)}`
            : `equity contra ${d.opponents.length} mano${d.opponents.length > 1 ? 's' : ''} al azar ${pct(d.equityVsRandom, lang)}`,
        );
      if (d.equityVsShown !== null)
        parts.push(
          en
            ? `equity vs the cards shown at showdown ${pct(d.equityVsShown, lang)}`
            : `equity contra las cartas enseñadas ${pct(d.equityVsShown, lang)}`,
        );
      lines.push(`- ${parts.join('; ')}.`);
    }
  }

  lines.push(
    '',
    en ? 'Please:' : 'Por favor:',
    en
      ? "1. Grade each of Hero's decisions (good / questionable / mistake) and explain why, street by street."
      : '1. Califica cada decisión de Hero (buena / dudosa / error) y explica por qué, calle por calle.',
    en
      ? '2. Say what you would do instead, with bet sizes, and estimate the opponents’ likely ranges.'
      : '2. Di qué harías tú en su lugar, con tamaños de apuesta, y estima los rangos probables de los rivales.',
    en
      ? '3. Judge the decisions, not the result (ignore the cards revealed at showdown when grading).'
      : '3. Juzga las decisiones, no el resultado (no uses las cartas enseñadas en el showdown para calificar).',
    en ? '4. Finish with a one-line verdict and a score from 1 to 10.' : '4. Termina con un veredicto en una línea y una nota del 1 al 10.',
    en
      ? 'Answer in English, clearly and concisely, for a beginner-to-intermediate player.'
      : 'Responde en español, de forma clara y concisa, para un jugador de nivel principiante-intermedio.',
  );
  return lines.join('\n');
}
