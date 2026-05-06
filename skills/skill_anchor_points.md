# Skill: Algoritmos de Punto de Anclaje, Z-Index y Renderizado

**Objetivo:** Comprender las mecánicas de renderizado y anclaje de cables para resolver problemas visuales sin romper la arquitectura.

## 1. Topología del Z-Index (Dominio SVG)
Grupos `<g>` anidados en orden estricto de fondo a superficie:

1. `<rect class="canvas-bg">` — Fondo blanco absoluto
2. `<g id="grid">` — Rejilla opcional
3. `<g id="connections">` — Cables (paths SVG) + etiquetas de cable
4. `<g id="elements">` — Dibujos SVG de equipamiento (opacos, tapan el origen del cable)
5. `<g id="conn-labels">` — Listas de canales flotantes (arrastables, sobre los elementos)
6. `<g id="labels">` — Etiquetas de texto bajo los equipos
7. `<g id="notes">` — Herramienta Texto del usuario
8. `<g id="overlay">` — UI temporal de creación

**Regla crítica:** `renderConnections()` debe limpiar TANTO `connections` COMO `conn-labels` al inicio:
```javascript
function renderConnections() {
  document.getElementById('connections').innerHTML = '';
  document.getElementById('conn-labels').innerHTML = '';
  // ...
}
```
Si solo se limpia `connections`, las listas de canales se acumulan como fantasmas al mover elementos.

## 2. El Algoritmo `edgePoint(el, tx, ty)`
Calcula la intersección del cable con la caja delimitadora del equipo. Usado por cables no-XLR (mangueras, triax, red).

## 2b. `cardinalPoint(el, tx, ty)` — Solo XLR
Devuelve el **centro de la cara cardinal** más cercana al objetivo (no la intersección diagonal). Resultado: `{ x, y, horiz: true/false }`.
- `horiz: true` → cable sale por cara izquierda o derecha (offset de paralelo se aplica en Y)
- `horiz: false` → cable sale por cara superior o inferior (offset de paralelo se aplica en X)

El enrutado XLR usa la cara de salida para elegir el tipo de codo:
- Ambas caras verticales → midY horizontal central
- Ambas caras horizontales → midX vertical central
- Mixto → esquina simple (2 segmentos)

## 3. Enrutado de Cables al Camión (`truckPoint`)
Si el elemento destino/origen es `camion_um`, se usa `truckPoint` en lugar de `edgePoint` para anclar el cable en el patch correcto:
```javascript
function truckPoint(el, tx, ty, cableTipo) {
  const ct = CABLE_TYPES[cableTipo] || {};
  const cat = ct.categoria || '';
  if (cableTipo === 'cable_triax') return { x: el.x + el.w * 0.6,  y: el.y + 20 };           // techo
  if (cat === 'analogico')         return { x: el.x + el.w * 0.28, y: el.y + el.h * 0.55 };  // patch izq.
  if (cat === 'digital')           return { x: el.x + el.w * 0.72, y: el.y + el.h * 0.55 };  // patch der.
  return edgePoint(el, tx, ty);
}
```

## 4. Cables Paralelos (mismo par de elementos)
Cuando dos o más cables comparten los mismos endpoints (ej. microcasco genera 2 XLR), se calcula un offset para cada uno:

```javascript
// Pre-computar grupos por par de elementos
const pairGroups = {};
state.connections.forEach((conn, idx) => {
  const key = [Math.min(conn.de, conn.a), Math.max(conn.de, conn.a)].join('-');
  if (!pairGroups[key]) pairGroups[key] = [];
  pairGroups[key].push(idx);
});

// En el forEach de renderizado:
const parallelOff = gCount > 1
  ? gIdx * PARALLEL_STEP - ((gCount - 1) * PARALLEL_STEP) / 2
  : 0;
```

Para cables XLR el offset se aplica en X (legs verticales) y Y×0.5 (tramo horizontal), creando dos L-shapes completamente independientes sin efecto rectángulo.

## 5. Marcador de Flecha XLR
Definido en `<defs>` dentro de `<svg id="canvas">`:
```html
<defs>
  <marker id="xlr-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
    <polygon points="0 0, 7 3.5, 0 7" fill="#111111"/>
  </marker>
</defs>
```
Se asigna con `path.setAttribute('marker-end', 'url(#xlr-arrow)')`.
Para señal invertida (`arrowEnd: 'source'`), el path se dibuja al revés (de tp a sp) y sigue usando `marker-end`.

## 6. Auto-Selección de Cable (`selectElement` → `smartConnect`)
`smartConnect` aplica las reglas en este orden:
1. Comprueba `no_connect` → bloquea si algún elemento lo tiene
2. Comprueba `microcasco` → genera 2 cables en una sola llamada
3. Comprueba `iem_dual` → 1ª llamada IEM-A, 2ª IEM-B, 3ª rechazada
4. Caso general → `inferCableType` + `inferArrowEnd`
