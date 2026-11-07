// Minimal hash router (#/route?param=value): works on GitHub Pages without server config.
import { useEffect, useState } from 'react';

/** Old Spanish routes, kept so shared links keep working. */
const LEGACY_ROUTES: Record<string, string> = {
  'lee-la-mesa': 'read-the-board',
  calculadora: 'calculator',
  diccionario: 'glossary',
};

function currentRoute(): string {
  return window.location.hash.replace(/^#\/?/, '').split('?')[0];
}

/** If the hash uses a legacy route, swaps it for the new one without adding a history entry. */
function redirectLegacyRoute(): void {
  const route = currentRoute();
  const target = LEGACY_ROUTES[route];
  if (!target) return;
  const query = window.location.hash.split('?')[1];
  const url = `${window.location.pathname}${window.location.search}#/${target}${query ? `?${query}` : ''}`;
  window.history.replaceState(null, '', url);
}

/** Parameters of the current route (whatever follows "?" in the hash). */
export function hashParams(): URLSearchParams {
  const q = window.location.hash.split('?')[1] ?? '';
  return new URLSearchParams(q);
}

/** Link to a route with parameters: routeHref('glossary', { q: 'bluff' }). */
export function routeHref(route: string, params?: Record<string, string>): string {
  const qs = params ? new URLSearchParams(params).toString() : '';
  return `#/${route}${qs ? `?${qs}` : ''}`;
}

/** Returns the current route without "#/" ("" is the home page). */
export function useHashRoute(): string {
  const [route, setRoute] = useState(() => {
    redirectLegacyRoute();
    return currentRoute();
  });
  useEffect(() => {
    const onChange = () => {
      redirectLegacyRoute();
      const next = currentRoute();
      setRoute((prev) => {
        if (prev !== next) window.scrollTo(0, 0);
        return next;
      });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
