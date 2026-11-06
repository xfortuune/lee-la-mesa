// Marcador de los entrenadores, guardado en localStorage (siempre envuelto en try/catch).

export interface Score {
  hits: number;
  misses: number;
  streak: number;
  bestStreak: number;
}

export const EMPTY_SCORE: Score = { hits: 0, misses: 0, streak: 0, bestStreak: 0 };

export function loadScore(key: string): Score {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return EMPTY_SCORE;
    return { ...EMPTY_SCORE, ...JSON.parse(raw) };
  } catch {
    return EMPTY_SCORE;
  }
}

export function saveScore(key: string, score: Score): void {
  try {
    localStorage.setItem(key, JSON.stringify(score));
  } catch {
    // sin almacenamiento disponible: el marcador vive solo en esta sesión
  }
}

/** Suma el resultado de cada pregunta (true = acierto) al marcador. */
export function recordResults(score: Score, results: boolean[]): Score {
  let { hits, misses, streak, bestStreak } = score;
  for (const ok of results) {
    if (ok) {
      hits++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      misses++;
      streak = 0;
    }
  }
  return { hits, misses, streak, bestStreak };
}

export function hitRate(score: Score): number {
  const total = score.hits + score.misses;
  return total === 0 ? 0 : Math.round((score.hits / total) * 100);
}
