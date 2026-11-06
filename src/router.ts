// Enrutado mínimo por hash (#/ruta?param=valor): funciona en GitHub Pages sin configurar el servidor.
import { useEffect, useState } from 'react';

function currentRoute(): string {
  return window.location.hash.replace(/^#\/?/, '').split('?')[0];
}

/** Parámetros de la ruta actual (lo que va tras "?" en el hash). */
export function hashParams(): URLSearchParams {
  const q = window.location.hash.split('?')[1] ?? '';
  return new URLSearchParams(q);
}

/** Enlace a una ruta con parámetros: routeHref('diccionario', { q: 'farol' }). */
export function routeHref(route: string, params?: Record<string, string>): string {
  const qs = params ? new URLSearchParams(params).toString() : '';
  return `#/${route}${qs ? `?${qs}` : ''}`;
}

/** Devuelve la ruta actual sin "#/" ("" es la home). */
export function useHashRoute(): string {
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const onChange = () => {
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
