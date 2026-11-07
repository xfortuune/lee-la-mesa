// Read the Board preferences in localStorage (always wrapped in try/catch).

const BALANCED_KEY = 'pokertoolbox:read-the-board:balanced';

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
    // ignore
  }
}
