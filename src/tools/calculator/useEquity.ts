import { useEffect, useRef, useState } from 'react';
import type { EquityInput, EquityResult } from '../../logic';

interface Response {
  id: number;
  result?: EquityResult;
  error?: string;
}

/** Recalculates equity in a Web Worker whenever the input changes (with a short debounce). */
export function useEquity(input: EquityInput) {
  const key = JSON.stringify(input);
  const [state, setState] = useState<{ key: string; result: EquityResult | null; error: string | null }>({
    key: '',
    result: null,
    error: null,
  });
  const workerRef = useRef<Worker | null>(null);
  const pending = useRef({ id: 0, key: '' });

  useEffect(() => {
    const worker = new Worker(new URL('./equity.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<Response>) => {
      if (e.data.id !== pending.current.id) return; // respuesta antigua
      const doneKey = pending.current.key;
      setState((s) =>
        e.data.result
          ? { key: doneKey, result: e.data.result, error: null }
          : { key: doneKey, result: s.result, error: e.data.error ?? 'Error al calcular.' },
      );
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      pending.current = { id: pending.current.id + 1, key };
      workerRef.current?.postMessage({ id: pending.current.id, input: JSON.parse(key) });
    }, 120);
    return () => clearTimeout(t);
  }, [key]);

  return { result: state.result, error: state.error, busy: state.key !== key };
}
