import { describe, expect, it } from 'vitest';
import { analyzeHand, buildReviewPrompt, describeAction, inBB, positions } from './hand-analysis';
import type { HandHistory } from './hand-history';
import TEXT from './fixtures/winamax-hand.txt?raw';
import { parseWinamaxText } from './winamax';

const hand = parseWinamaxText(TEXT);
const analysis = analyzeHand(hand);

describe('positions', () => {
  it('names the 6-max seats from the button', () => {
    expect(Object.fromEntries(positions(hand))).toEqual({
      Player6: 'BTN',
      Hero: 'SB',
      Player2: 'BB',
      Player3: 'UTG',
      Player4: 'HJ',
      Player5: 'CO',
    });
  });

  it('heads-up: the button is the small blind', () => {
    const hu: HandHistory = {
      ...hand,
      buttonSeat: 2,
      players: [
        { seat: 1, name: 'A', stack: 10 },
        { seat: 2, name: 'B', stack: 10 },
      ],
    };
    expect(Object.fromEntries(positions(hu))).toEqual({ B: 'BTN', A: 'BB' });
  });

  it('works when the button seat is empty', () => {
    const p = positions({ ...hand, buttonSeat: 7 });
    expect(p.get('Player6')).toBe('BTN');
  });
});

describe('decisions', () => {
  it('finds Hero’s two preflop decisions', () => {
    expect(analysis.heroPosition).toBe('SB');
    expect(analysis.decisions.map((d) => `${d.street} ${d.action.type}`)).toEqual(['preflop raise', 'preflop call']);
  });

  it('computes the pot and pot odds of the call', () => {
    const call = analysis.decisions[1];
    // Pot before calling: 0.05 + 0.10 + 0.25 + 0.75 + 2.50 = 3.65; Hero has to put in 1.95.
    expect(call.pot).toBe(3.65);
    expect(call.toCall).toBe(1.95);
    expect(call.potOdds).toBeCloseTo(1.95 / 5.6, 5);
    expect(call.opponents).toEqual(['Player4']);
  });

  it('equity of 55 vs TT is about 18%, and vs a random hand much higher', () => {
    const call = analysis.decisions[1];
    expect(call.equityVsShown).toBeGreaterThan(0.16);
    expect(call.equityVsShown).toBeLessThan(0.21);
    expect(call.equityVsRandom).toBeGreaterThan(0.5);
  });

  it('the 3-bet: 0.20 to call and only BB and HJ still in', () => {
    const raise = analysis.decisions[0];
    expect(raise.toCall).toBe(0.2);
    expect(raise.potOdds).toBeNull(); // pot odds only make sense when calling
    expect(raise.opponents).toEqual(['Player2', 'Player4']);
  });

  it('summarises the result and stack depth', () => {
    expect(analysis.heroStackBB).toBe(100.5);
    // Against the HJ (the only player left) the effective stack is his 27.5 BB.
    expect(analysis.decisions[1].effectiveStack).toBe(1.95);
    expect(analysis.heroInvested).toBe(2.75);
    expect(analysis.heroWon).toBe(5.04);
    expect(analysis.heroNet).toBe(2.29);
    expect(analysis.streets).toEqual(['preflop', 'flop', 'turn', 'river']);
    // All-in preflop: the pot stays at 0.10 + 2.75 + 2.75 for the rest of the hand.
    expect(analysis.potByStreet).toEqual({ preflop: 0, flop: 5.6, turn: 5.6, river: 5.6 });
  });
});

describe('text', () => {
  it('formats amounts in big blinds', () => {
    expect(inBB(2.75, 0.1)).toBe('27.5 BB');
    expect(inBB(2.75, 0.1, 'es')).toBe('27,5 BB');
    expect(inBB(0.8, 0.1)).toBe('8 BB');
  });

  it('describes actions in both languages', () => {
    const allIn = hand.actions.find((a) => a.allIn)!;
    expect(describeAction(allIn, hand.bb, (p) => p)).toBe('Player4 raises to 27.5 BB (all-in)');
    expect(describeAction(allIn, hand.bb, (p) => p, 'es')).toBe('Player4 sube a 27,5 BB (all-in)');
  });

  it('the AI prompt uses positions instead of screen names', () => {
    const prompt = buildReviewPrompt(hand, analysis, 'en');
    for (const name of ['Player2', 'Player3', 'Player4', 'Player5', 'Player6']) expect(prompt).not.toContain(name);
    expect(prompt).toContain('Hero: SB with 5♥ 5♠');
    expect(prompt).toContain('HJ raises to 27.5 BB (all-in)');
    expect(prompt).toContain('pot odds 34.8%');
    expect(prompt).toContain('Answer in English');
  });

  it('the Spanish prompt asks for a Spanish answer', () => {
    const prompt = buildReviewPrompt(hand, analysis, 'es');
    expect(prompt).toContain('Hero (SB) sube a 8 BB');
    expect(prompt).toContain('Responde en español');
  });
});
