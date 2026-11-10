import { useEffect, useRef, useState } from 'react';
import type { RangeTask } from './range.worker';

/** Runs a Range Lab task in its own Web Worker whenever it changes (debounced). Null skips it. */
export function useRangeTask<R>(task: RangeTask | null) {
  const key = task ? JSON.stringify(task) : '';
  const [state, setState] = useState<{ key: string; result: R | null; error: string | null }>({
    key: '',
    result: null,
    error: null,
  });
  const workerRef = useRef<Worker | null>(null);
  const pending = useRef({ id: 0, key: '' });

  useEffect(() => {
    const worker = new Worker(new URL('./range.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<{ id: number; result?: R; error?: string }>) => {
      if (e.data.id !== pending.current.id) return; // stale answer
      const doneKey = pending.current.key;
      setState(
        e.data.error ? { key: doneKey, result: null, error: e.data.error } : { key: doneKey, result: e.data.result ?? null, error: null },
      );
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    if (!key) return;
    const t = setTimeout(() => {
      pending.current = { id: pending.current.id + 1, key };
      workerRef.current?.postMessage({ id: pending.current.id, task: JSON.parse(key) });
    }, 200);
    return () => clearTimeout(t);
  }, [key]);

  const fresh = state.key === key;
  return { result: key && fresh ? state.result : null, error: fresh ? state.error : null, busy: !!key && !fresh };
}
