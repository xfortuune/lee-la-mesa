// Range shortcuts: "top X %", quick groups and indicative preset ranges.
import { ALL_HANDS, type HandKey, type Range, TOTAL_COMBOS, combosOf, handRanks, handType, rangeFromHands } from './combos';
import { parseRange } from './notation';
import { HAND_RANKING } from './ranking';

/** The best hands adding up to `percent` of all 1326 combos (by the preflop ranking). */
export function topPercent(percent: number): Range {
  const target = (Math.max(0, Math.min(100, percent)) / 100) * TOTAL_COMBOS;
  const hands: HandKey[] = [];
  let combos = 0;
  for (const [hand] of HAND_RANKING) {
    if (combos >= target - 1e-9) break;
    hands.push(hand);
    combos += combosOf(hand).length;
  }
  return rangeFromHands(hands);
}

export const GROUPS = {
  pairs: ALL_HANDS.filter((h) => handType(h) === 'pair'),
  suited: ALL_HANDS.filter((h) => handType(h) === 'suited'),
  broadways: ALL_HANDS.filter((h) => handRanks(h).every((r) => r >= 10)),
} satisfies Record<string, HandKey[]>;

export type PresetId = 'utg' | 'hj' | 'co' | 'btn' | 'sb' | 'threebet';

/** Indicative 6-max opening ranges (and a typical 3-bet range). Not solver output. */
export const PRESETS: Record<PresetId, string> = {
  utg: '22+, ATs+, A5s-A4s, KTs+, QTs+, JTs, T9s, 98s, AJo+, KQo',
  hj: '22+, A8s+, A5s-A3s, K9s+, Q9s+, J9s+, T9s, 98s, 87s, ATo+, KJo+, QJo',
  co: '22+, A2s+, K7s+, Q8s+, J8s+, T8s+, 97s+, 86s+, 76s, 65s, A9o+, KTo+, QTo+, JTo',
  btn: '22+, A2s+, K2s+, Q5s+, J7s+, T7s+, 96s+, 85s+, 74s+, 64s+, 53s+, 43s, A2o+, K8o+, Q9o+, J9o+, T8o+, 98o',
  sb: '22+, A2s+, K4s+, Q7s+, J7s+, T7s+, 97s+, 86s+, 75s+, 65s, 54s, A2o+, K9o+, QTo+, JTo, T9o',
  threebet: 'TT+, AQs+, AKo, A5s-A4s, KQs',
};

export function presetRange(id: PresetId): Range {
  return parseRange(PRESETS[id]);
}
