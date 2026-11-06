# Dudas sobre los criterios

Casos que las reglas no cubren de forma clara. Para cada uno se indica el ejemplo
y la decisión provisional implementada en `src/logic/`.

## 1. Pareja máxima en mesa emparejada: ¿cuenta el apoyo?

- **Ejemplo**: T♣9♦ en T♠4♥4♦.
- **Conflicto**: el test obligatorio dice "fuerte (pareja máxima con mejor apoyo)",
  pero según la definición de apoyo, en T-4 el mejor apoyo es A y el segundo K,
  así que el 9 sería "apoyo peor que el segundo mejor" → mano media.
- **Decisión provisional**: en mesa emparejada, la pareja máxima (pareja de la carta
  sin emparejar más alta) se trata como **fuerte** con cualquier apoyo. Así pasa el
  test obligatorio. La explicación al usuario lo indica como criterio provisional.
- Ej.: T♣2♦ en T♠4♥4♦ → fuerte.

## 2. Trío en la mesa (flop tipo 7-7-7)

- **Ejemplo**: A♣K♦ en 7♠7♥7♦.
- **Duda**: todo el mundo tiene "un trío". ¿Cuenta como "al menos un trío" → fuerte?
- **Decisión provisional**: el trío de la mesa se ignora (igual que la pareja de la mesa).
  Pareja en mano → full → muy fuerte; carta que liga el trío → póker → muy fuerte;
  si no, se aplica carta alta As / Rey con As en mesa / nada. A♣K♦ en 7♠7♥7♦ → débil.

## 3. Parejas bajas frente a "al menos carta alta As"

- **Ejemplo**: 6♣2♦ en K♠8♥6♦ (pareja baja sin As).
- **Duda**: la categoría débil dice "pero al menos carta alta As". Se interpreta en orden
  de jugadas: cualquier pareja es mejor que carta alta As.
- **Decisión provisional**: cualquier pareja por debajo de la categoría media (pareja baja,
  pareja media con mal apoyo, pareja en mano por debajo de la segunda carta) → **débil**,
  tenga o no un As. Igual en mesa coordinada para todo lo que está por debajo de pareja máxima.

## 4. Pareja en mano por debajo de la segunda carta en mesa emparejada

- **Ejemplo**: 3♣3♦ en T♠4♥4♦ (en realidad dobles parejas 4-4 y 3-3).
- **Decisión provisional**: se ignora la pareja de la mesa; las cartas distintas son T y 4,
  así que 33 es pareja en mano por debajo de la segunda carta → pareja baja → débil.

## 5. Extremadamente coordinada en el flop

- **Origen**: las reglas originales dicen que en el flop no puede darse (requiere 4 cartas).
  Se ha añadido a petición del usuario con un criterio propio.
- **Criterio**: el flop es monocolor **y** además alguna combinación válida de 2 cartas
  (sin contar las excepciones) forma escalera. Se evalúa antes que "coordinada".
  - Ej.: 6♠7♠8♠, K♥Q♥J♥, 9♦7♦5♦ → extremadamente coordinada.
  - K♠Q♠2♠ (sin escalera) y A♣2♣3♣ (solo 54, excepción) → coordinada.
- **Fuerza**: se evalúa con las reglas de mesa coordinada (monocolor): color o escalera
  de color → muy fuerte; escalera, trío o dobles → fuerte; pareja máxima u overpair → media…
- **Modo equilibrado**: sale el 10 % de las veces (30 % cada uno de los otros tres tipos).
- En el turn se podrá ampliar con la definición original (proyecto completado con UNA carta).

## 6. Proyectos (color/escalera) sin completar

- Las reglas de fuerza solo hablan de jugadas hechas; los proyectos no suben la categoría.
  Ej.: A♥2♥ en K♥8♥6♦ → carta alta As → débil.
