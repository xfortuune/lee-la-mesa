import { describe, expect, it } from 'vitest';
import { classifyBoard, computeOuts, dealRandom, evaluateHand, parseCards, ruleText } from './index';

const c = parseCards;

describe('explicaciones en inglés', () => {
  it('coordinación', () => {
    expect(classifyBoard(c('K♠8♥6♦'), 'en').reason).toBe(
      'Semi-coordinated board: no straight is possible with two cards; between 8 and 6 there is 1 gap (7), and without a flush draw up to 2 gaps are allowed.',
    );
    expect(classifyBoard(c('6♠7♠8♠'), 'en').reason).toMatch(/^Extremely coordinated board/);
  });

  it('fuerza', () => {
    expect(evaluateHand(c('A♣8♦'), c('K♠8♥6♦'), 'en').reason).toBe(
      'You have middle pair (8s) with the best kicker (A) on a semi-coordinated board (evaluated as dry) → medium hand.',
    );
    expect(evaluateHand(c('K♣J♦'), c('Q♠9♥4♦'), 'en').reason).toMatch(/→ nothing\.$/);
  });

  it('la categoría no depende del idioma', () => {
    for (let i = 0; i < 300; i++) {
      const { hole, flop } = dealRandom();
      expect(evaluateHand(hole, flop, 'en').strength).toBe(evaluateHand(hole, flop, 'es').strength);
    }
  });

  it('outs', () => {
    const r = computeOuts(c('6♥5♥'), c('K♥9♥2♣'), 'en');
    expect(r.reason).toMatch(/^You currently have high card\. 9 cards improve you: flush \(9 outs/);
    expect(ruleText(r, 'en')).toBe('Rule of 4: 9 outs × 4 = 36%');
  });

  it('sin palabras en español en inglés', () => {
    for (let i = 0; i < 300; i++) {
      const { hole, flop } = dealRandom();
      const text = evaluateHand(hole, flop, 'en').reason + classifyBoard(flop, 'en').reason;
      expect(text).not.toMatch(/\b(mesa|pareja|tienes|huecos|apoyo|seca)\b/i);
    }
  });
});
