// Site-independent model of a played hand (hand history), plus helpers shared by the parsers.
import type { Card } from './cards';

export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river'];

export type ActionType = 'post_sb' | 'post_bb' | 'post_ante' | 'post' | 'fold' | 'check' | 'call' | 'bet' | 'raise';

export interface HandAction {
  /** Blinds and antes are recorded on the preflop street. */
  street: Street;
  player: string;
  type: ActionType;
  /** Chips this action puts into the pot. */
  amount: number;
  /** The player's total bet on this street after the action. */
  total: number;
  /** The player has no chips left after this action. */
  allIn: boolean;
}

export interface Seat {
  seat: number;
  name: string;
  /** Stack at the start of the hand. */
  stack: number;
}

export interface HandHistory {
  site: 'winamax';
  handId: string;
  table: string;
  /** Cash game (tournaments are not supported yet). */
  cash: boolean;
  sb: number;
  bb: number;
  currency: string;
  /** Table size (6 for 6-max). */
  maxSeats: number;
  buttonSeat: number;
  players: Seat[];
  hero: string | null;
  heroCards: Card[] | null;
  actions: HandAction[];
  /** Final board (0 to 5 cards). */
  board: Card[];
  showdown: { player: string; cards: Card[] }[];
  winners: { player: string; amount: number }[];
  rake: number | null;
}

/** Rounds to cents to avoid floating-point noise in money amounts. */
export function money(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Fills in `total` and `allIn` for each action from the amounts and the starting stacks.
 * Parsers only need to provide street, player, type and the chips put in by each action.
 */
export function completeActions(
  players: Seat[],
  raw: Omit<HandAction, 'total' | 'allIn'>[],
): HandAction[] {
  const left = new Map(players.map((p) => [p.name, p.stack]));
  const streetTotals = new Map<string, number>();
  let street: Street | null = null;
  return raw.map((a) => {
    if (a.street !== street) {
      street = a.street;
      streetTotals.clear();
    }
    // Antes are dead money: they do not count towards the street bet.
    const before = streetTotals.get(a.player) ?? 0;
    const total = a.type === 'post_ante' ? before : money(before + a.amount);
    streetTotals.set(a.player, total);
    const remaining = money((left.get(a.player) ?? 0) - a.amount);
    left.set(a.player, remaining);
    const allIn = a.amount > 0 && remaining <= 0;
    return { ...a, total, allIn };
  });
}

export class HandParseError extends Error {
  readonly code: 'empty' | 'unknown_format' | 'not_cash' | 'not_holdem' | 'invalid' | 'fetch_failed' | 'bad_link';

  constructor(code: HandParseError['code'], message: string) {
    super(message);
    this.code = code;
  }
}
