// One-off migration of localStorage keys from the old Spanish names, so existing
// scores and preferences survive the rename. Safe to call on every start-up.

const RENAMED_KEYS: [oldKey: string, newKey: string][] = [
  ['lee-la-mesa:marcador', 'pokertoolbox:score:read-the-board'],
  ['outs:marcador', 'pokertoolbox:score:outs'],
  ['lee-la-mesa:equilibrado', 'pokertoolbox:read-the-board:balanced'],
];

export function migrateStorageKeys(): void {
  try {
    for (const [oldKey, newKey] of RENAMED_KEYS) {
      const value = localStorage.getItem(oldKey);
      if (value === null) continue;
      if (localStorage.getItem(newKey) === null) localStorage.setItem(newKey, value);
      localStorage.removeItem(oldKey);
    }
  } catch {
    // storage unavailable: nothing to migrate
  }
}
