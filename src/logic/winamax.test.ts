import { describe, expect, it } from 'vitest';
import { cardsToString } from './cards';
import { HandParseError } from './hand-history';
import { fetchWinamaxHand, parseHandText, parseWinamaxJson, parseWinamaxText, winamaxHandUrl } from './winamax';

import JSON_HAND from './fixtures/winamax-hand.json';
import TEXT from './fixtures/winamax-hand.txt?raw';
const LINK =
  'https://www.winamax.es/replayer/replayer.html?2026-6c2b9b2fa03291e60ea3d8a3ad2b9e8a832edf7b39df3b74258e48bc1ea2486c&lang=es_ES';

describe('Winamax text', () => {
  const h = parseWinamaxText(TEXT);

  it('reads the header and table', () => {
    expect(h.handId).toBe('23153416-153079-1794055978');
    expect(h.table).toBe('Floride');
    expect(h.cash).toBe(true);
    expect([h.sb, h.bb, h.currency]).toEqual([0.05, 0.1, '€']);
    expect(h.maxSeats).toBe(6);
    expect(h.buttonSeat).toBe(6);
  });

  it('reads seats, hero and cards', () => {
    expect(h.players).toHaveLength(6);
    expect(h.players[3]).toEqual({ seat: 4, name: 'Player4', stack: 2.75 });
    expect(h.hero).toBe('Hero');
    expect(cardsToString(h.heroCards!)).toBe('5♥ 5♠');
  });

  it('reads actions with chips added and street totals', () => {
    const pre = h.actions.filter((a) => a.street === 'preflop');
    expect(pre.map((a) => `${a.player} ${a.type} ${a.amount} ${a.total}`)).toEqual([
      'Hero post_sb 0.05 0.05',
      'Player2 post_bb 0.1 0.1',
      'Player3 fold 0 0',
      'Player4 raise 0.25 0.25',
      'Player5 fold 0 0',
      'Player6 fold 0 0',
      'Hero raise 0.75 0.8',
      'Player2 fold 0 0.1',
      'Player4 raise 2.5 2.75',
      'Hero call 1.95 2.75',
    ]);
    expect(pre.find((a) => a.player === 'Player4' && a.total === 2.75)?.allIn).toBe(true);
    expect(pre.at(-1)?.allIn).toBe(false);
  });

  it('reads board, showdown, winners and rake', () => {
    expect(cardsToString(h.board)).toBe('6♣ A♦ Q♠ 5♦ 2♣');
    expect(h.showdown.map((s) => `${s.player} ${cardsToString(s.cards)}`)).toEqual(['Player4 T♥ T♦', 'Hero 5♥ 5♠']);
    expect(h.winners).toEqual([{ player: 'Hero', amount: 5.04 }]);
    expect(h.rake).toBe(0.56);
  });

  it('rejects tournaments and other formats', () => {
    expect(() => parseWinamaxText('Winamax Poker - Tournament "Freeroll" buyIn: 0€ - HandId: #1 - Holdem no limit (10/20)')).toThrow(
      HandParseError,
    );
    expect(() => parseWinamaxText('PokerStars Hand #1')).toThrow(/Not a Winamax/);
  });
});

describe('Winamax replayer JSON', () => {
  const j = parseWinamaxJson(JSON_HAND);
  const t = parseWinamaxText(TEXT);

  it('matches the text version', () => {
    expect([j.sb, j.bb]).toEqual([t.sb, t.bb]);
    expect(j.buttonSeat).toBe(t.buttonSeat);
    expect(j.players).toEqual(t.players);
    expect(j.hero).toBe(t.hero);
    expect(j.heroCards).toEqual(t.heroCards);
    expect(j.board).toEqual(t.board);
    expect(j.actions).toEqual(t.actions);
    expect(j.winners).toEqual(t.winners);
    expect(j.rake).toBe(t.rake);
    expect(j.showdown.map((s) => s.player).sort()).toEqual(t.showdown.map((s) => s.player).sort());
  });
});

describe('replayer links', () => {
  it('builds the JSON URL from the link', () => {
    expect(winamaxHandUrl(LINK)).toBe(
      'https://poker-assets.winamax.es/replayer/hand/2026/6c/2b/6c2b9b2fa03291e60ea3d8a3ad2b9e8a832edf7b39df3b74258e48bc1ea2486c',
    );
    expect(winamaxHandUrl('https://example.com')).toBeNull();
  });

  it('downloads and parses the hand', async () => {
    const fakeFetch = (async () => new Response(JSON.stringify(JSON_HAND))) as unknown as typeof fetch;
    const h = await fetchWinamaxHand(LINK, fakeFetch);
    expect(h.hero).toBe('Hero');
  });

  it('reports bad links and failed downloads', async () => {
    await expect(fetchWinamaxHand('hello')).rejects.toMatchObject({ code: 'bad_link' });
    const notFound = (async () => new Response('', { status: 404 })) as unknown as typeof fetch;
    await expect(fetchWinamaxHand(LINK, notFound)).rejects.toMatchObject({ code: 'fetch_failed' });
  });
});

describe('auto-detect', () => {
  it('accepts text or JSON', () => {
    expect(parseHandText(TEXT).hero).toBe('Hero');
    expect(parseHandText(JSON.stringify(JSON_HAND)).hero).toBe('Hero');
    expect(() => parseHandText('   ')).toThrow(HandParseError);
  });
});
