# PokerToolBox ♠

Web: https://xfortuune.github.io/pokertoolbox/ · dominio previsto: **pokertoolbox.com**

Hub de herramientas de práctica para Texas Hold'em, en **inglés** (idioma por defecto) y **español**:
el botón EN/ES de arriba a la derecha cambia toda la web y la elección se recuerda. La página de inicio da acceso a
seis herramientas (las rutas usan hash: `#/lee-la-mesa`…). Se añaden en
`src/tools/registry.ts`.

| # | Herramienta | Estado |
|---|-------------|--------|
| 01 | Lee la mesa | Disponible |
| 02 | Calculadora | Disponible |
| 03 | Outs | Disponible |
| 04 | — | Próximamente |
| 05 | — | Próximamente |
| 06 | Diccionario | Disponible |

El **diccionario** (`#/diccionario`) reúne 380 términos de póker recopilados de los glosarios de
[Poker Red](https://www.poker-red.com/aprender-poker/diccionario-de-poker) y
[ZerosPoker](https://zerospoker.com/glosario/), sin duplicados y con definiciones propias.

## 01 · Lee la mesa

Entrenador de Texas Hold'em para principiantes. En cada ronda se reparten 2 cartas
y un flop, y respondes:

1. **Coordinación de la mesa**: Extremadamente coordinada / Coordinada / Semicoordinada / Seca
2. **Fuerza de tu mano**: Muy fuerte / Fuerte / Media / Débil / Nada

La app corrige cada respuesta y explica el porqué siguiendo los criterios del
método EducaPoker (ver el botón **Reglas** dentro de la app).

## 02 · Calculadora

Calculadora de equity para hasta 10 jugadores: eliges las cartas de cada jugador y de la
mesa (las que no elijas se reparten al azar) y muestra para cada uno la probabilidad de
ganar, de empatar y su equity, además de la probabilidad de terminar con cada jugada.
Cálculo exacto cuando hay pocas combinaciones (flop, turn) y Monte Carlo (40.000
simulaciones) en el resto, en un Web Worker para no bloquear la interfaz.

## 03 · Outs

Entrenador de outs: te reparte una mano con proyecto (o con overcards, pareja…) en el flop
o el turn y respondes cuántos outs tienes y qué probabilidad hay de ligar con la regla del
2 y del 4. Al corregir muestra los outs agrupados, un mapa de las 52 cartas y el % exacto.
Criterios en `DUDAS.md`.

## Características de Lee la mesa

- Baraja de 4 colores (♠ negro, ♥ rojo, ♦ azul, ♣ verde).
- Explicaciones generadas por la lógica (categoría + motivo).
- Marcador con aciertos, fallos, % y racha, guardado en `localStorage`.
- **Extremadamente coordinada** en el flop: monocolor y con escalera posible (p. ej. 6♠7♠8♠). Ver `DUDAS.md`.
- **Modo equilibrado**: reparte flops coordinados, semicoordinados y secos a partes iguales, y extremadamente coordinados un 10 % de las veces.
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
  - `equity.ts` — evaluador de manos y cálculo de equity.
  - `outs.ts` — conteo de outs, regla del 2 y del 4 y reparto de situaciones.
  - `*.test.ts` — tests.
- `src/pages/Home.tsx` — página de inicio (hub).
- `src/pages/Dictionary.tsx` — página del diccionario (herramienta 06).
- `src/dictionary/` — términos del diccionario, búsqueda y término del día (con test de duplicados).
- `src/router.ts` — enrutado mínimo por hash.
- `src/i18n/` — idioma (contexto, guardado en localStorage). Cada pantalla tiene sus textos `en`/`es`;
  la lógica recibe el idioma para redactar las explicaciones.
- `src/dictionary/terms-en-*.ts` — versión en inglés de los 380 términos.
- `src/tools/registry.ts` — lista de herramientas del hub.
- `src/tools/lee-la-mesa/` — interfaz de la herramienta 01.
- `src/tools/calculadora/` — interfaz de la herramienta 02 (con su Web Worker).
- `src/tools/outs/` — interfaz de la herramienta 03.
- `src/lib/score.ts` — marcador compartido de los entrenadores.
- `src/components/` — componentes compartidos (cartas, cabecera, piezas de los entrenadores).
- `DUDAS.md` — casos que las reglas no cubren de forma clara y la decisión provisional tomada.

Stack: Vite + React + TypeScript + Tailwind CSS. Sin backend.
