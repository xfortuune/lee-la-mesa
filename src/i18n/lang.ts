// Idioma de la interfaz. Inglés por defecto; la elección se guarda en localStorage.
import { createContext, useContext } from 'react';

export type Lang = 'en' | 'es';
export const LANGS: Lang[] = ['en', 'es'];
export const DEFAULT_LANG: Lang = 'en';

const KEY = 'pokertoolbox:lang';

export function loadLang(): Lang {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'es' || v === 'en' ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // sin almacenamiento: el idioma vive solo en esta sesión
  }
}

export interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const LangContext = createContext<LangState>({ lang: DEFAULT_LANG, setLang: () => {} });

export function useLang(): LangState {
  return useContext(LangContext);
}

/** Elige el texto del idioma actual: pick(lang, { en: '…', es: '…' }). */
export function pick<T>(lang: Lang, texts: Record<Lang, T>): T {
  return texts[lang];
}
