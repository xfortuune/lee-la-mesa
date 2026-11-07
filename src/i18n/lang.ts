// Interface language. English by default; the choice is stored in localStorage.
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
    // no storage: the language only lives for this session
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

/** Picks the text for the current language: pick(lang, { en: '…', es: '…' }). */
export function pick<T>(lang: Lang, texts: Record<Lang, T>): T {
  return texts[lang];
}
