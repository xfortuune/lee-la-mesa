// Preferencias de Lee la mesa en localStorage (siempre envuelto en try/catch).

const BALANCED_KEY = 'lee-la-mesa:equilibrado';

export function loadBalanced(): boolean {
  try {
    return localStorage.getItem(BALANCED_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveBalanced(value: boolean): void {
  try {
    localStorage.setItem(BALANCED_KEY, value ? '1' : '0');
  } catch {
    // ignorar
  }
}
