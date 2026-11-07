// Fetches the AI review of a hand from the review API, streaming the text as it arrives.
import { useEffect, useState } from 'react';
import type { Lang } from '../../i18n/lang';
import type { HandAnalysis, HandHistory } from '../../logic';

/** Review API base URL, set at build time (empty = AI review not configured). */
const API_URL = (import.meta.env.VITE_REVIEW_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export type ReviewStatus = 'unconfigured' | 'loading' | 'streaming' | 'done' | 'rate_limited' | 'refused' | 'error';

export interface ReviewState {
  status: ReviewStatus;
  text: string;
}

const cacheKey = (hand: HandHistory, lang: Lang) => `pokertoolbox:review:${lang}:${hand.handId}`;

function loadCached(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveCached(key: string, text: string): void {
  try {
    localStorage.setItem(key, text);
  } catch {
    // no storage: the review is simply fetched again next time
  }
}

type KeyedState = ReviewState & { key: string };

/** Starting state for a hand: cached review, a pending request, or no API configured. */
function initialState(key: string, handId: string): KeyedState {
  if (!API_URL) return { key, status: 'unconfigured', text: '' };
  const cached = handId ? loadCached(key) : null;
  return cached ? { key, status: 'done', text: cached } : { key, status: 'loading', text: '' };
}

export function useReview(hand: HandHistory, analysis: HandAnalysis, lang: Lang): ReviewState {
  const key = cacheKey(hand, lang);
  const [state, setState] = useState<KeyedState>(() => initialState(key, hand.handId));

  // Reset when the hand or the language changes (adjusting state during render).
  if (state.key !== key) setState(initialState(key, hand.handId));

  // True from the first render of a new hand until its review finishes; it must not flip
  // between 'loading' and 'streaming', or the effect would cancel its own request.
  const active = state.key === key && (state.status === 'loading' || state.status === 'streaming');

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const update = (s: ReviewState) => setState((prev) => (prev.key === key ? { ...s, key } : prev));

    (async () => {
      let res: Response;
      try {
        res = await fetch(`${API_URL}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hand,
            lang,
            equities: analysis.decisions.map((d) => ({ vsRandom: d.equityVsRandom, vsShown: d.equityVsShown })),
          }),
          signal: controller.signal,
        });
      } catch {
        if (!controller.signal.aborted) update({ status: 'error', text: '' });
        return;
      }
      if (res.status === 429) return update({ status: 'rate_limited', text: '' });
      if (!res.ok || !res.body) return update({ status: 'error', text: '' });

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let text = '';
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          text += value;
          update({ status: 'streaming', text });
        }
      } catch {
        if (!controller.signal.aborted) update({ status: 'error', text });
        return;
      }
      // The API appends a marker when the model declined or the call failed mid-way.
      if (text.includes('[[refusal]]')) return update({ status: 'refused', text: text.replace('[[refusal]]', '').trim() });
      if (text.includes('[[error]]') || !text.trim()) return update({ status: 'error', text: text.replace('[[error]]', '').trim() });
      if (hand.handId) saveCached(key, text);
      update({ status: 'done', text });
    })();

    return () => controller.abort();
  }, [active, key, hand, analysis, lang]);

  return { status: state.status, text: state.text };
}
