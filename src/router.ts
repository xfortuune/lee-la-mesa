// Enrutado mínimo por hash (#/ruta): funciona en GitHub Pages sin configurar el servidor.
import { useEffect, useState } from 'react';

function currentRoute(): string {
  return window.location.hash.replace(/^#\/?/, '').split('?')[0];
}

/** Devuelve la ruta actual sin "#/" ("" es la home). */
export function useHashRoute(): string {
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const onChange = () => {
      setRoute(currentRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
