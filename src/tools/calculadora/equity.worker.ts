// Calcula la equity fuera del hilo principal para no bloquear la interfaz.
import { type EquityInput, calculateEquity } from '../../logic';

self.onmessage = (e: MessageEvent<{ id: number; input: EquityInput }>) => {
  const { id, input } = e.data;
  try {
    const result = calculateEquity(input);
    self.postMessage({ id, result });
  } catch (err) {
    self.postMessage({ id, error: (err as Error).message });
  }
};
