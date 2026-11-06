// Persistencia en localStorage (siempre envuelta en try/catch).

export interface Score {
  hits: number;
  misses: number;
  streak: number;
  bestStreak: number;
}

export const EMPTY_SCORE: Score = { hits: 0, misses: 0, streak: 0, bestStreak: 0 };

const SCORE_KEY = 'lee-la-mesa:marcador';
const BALANCED_KEY = 'lee-la-mesa:equilibrado';

export function loadScore(): Score {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    if (!raw) return EMPTY_SCORE;
    return { ...EMPTY_SCORE, ...JSON.parse(raw) };
  } catch {
    return EMPTY_SCORE;
  }
}

export function saveScore(score: Score): void {
  try {
    localStorage.setItem(SCORE_KEY, JSON.stringify(score));
  } catch {
    // sin almacenamiento disponible: el marcador vive solo en esta sesión
  }
}

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
