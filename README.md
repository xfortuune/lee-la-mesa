# Lee la mesa ♠

Entrenador de Texas Hold'em para principiantes. En cada ronda se reparten 2 cartas
y un flop, y respondes:

1. **Coordinación de la mesa**: Coordinada / Semicoordinada / Seca
2. **Fuerza de tu mano**: Muy fuerte / Fuerte / Media / Débil / Nada

La app corrige cada respuesta y explica el porqué siguiendo los criterios del
método EducaPoker (ver el botón **Reglas** dentro de la app).

## Características

- Baraja de 4 colores (♠ negro, ♥ rojo, ♦ azul, ♣ verde).
- Explicaciones generadas por la lógica (categoría + motivo).
- Marcador con aciertos, fallos, % y racha, guardado en `localStorage`.
- **Modo equilibrado**: reparte flops coordinados, semicoordinados y secos en proporción parecida.
- Atajo: `Enter` o `Espacio` para comprobar / siguiente mano.
- Responsive, pensado para el móvil.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # tests de la lógica (Vitest)
npm run build    # build de producción en dist/
```

## Estructura

- `src/logic/` — lógica de póker pura, sin UI:
  - `cards.ts` — cartas, baraja, parseo.
  - `coordination.ts` — coordinación del flop (preparada para añadir el turn).
  - `strength.ts` — fuerza de la mano.
  - `deal.ts` — reparto normal y equilibrado.
  - `logic.test.ts` — tests.
- `src/components/` — componentes de la interfaz.
- `DUDAS.md` — casos que las reglas no cubren de forma clara y la decisión provisional tomada.

Stack: Vite + React + TypeScript + Tailwind CSS. Sin backend.
