// Heavy Range Lab work off the main thread: equity vs the range and the turn/river table.
import { type Card, type Range, nextCardTable, rangeEquity } from '../../logic';

export type RangeTask =
  | { kind: 'equity'; hero: Card[] | null; range: Range; board: Card[] }
  | { kind: 'table'; hero: Card[] | null; range: Range; board: Card[] };

self.onmessage = (e: MessageEvent<{ id: number; task: RangeTask }>) => {
  const { id, task } = e.data;
  try {
    const result =
      task.kind === 'equity'
        ? rangeEquity({ hero: task.hero, range: task.range, board: task.board, samples: 30_000 })
        : nextCardTable(task.range, task.board, task.hero, { equitySamples: 1_500 });
    self.postMessage({ id, result });
  } catch (err) {
    self.postMessage({ id, error: (err as Error).message });
  }
};
