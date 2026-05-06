# Skill: Cables, Enrutado y Reglas de Conexión

**Objetivo:** Documentar el sistema de cables (tipos, enrutado, flechas, etiquetas) para no romper la lógica visual al añadir o modificar conexiones.

## 1. Diccionario `CABLE_TYPES`

```javascript
const CABLE_TYPES = {
  cable_triax: { nombre: "Triax de Cámara",       canales_max: 2,  color: "#444444", grosor: 3.5, doble: false, categoria: "video"    },
  manguera_8:  { nombre: "Manguera Analógica 8",  canales_max: 8,  color: "#cc3300", grosor: 4,   doble: true,  categoria: "analogico" },
  manguera_16: { nombre: "Manguera Analógica 16", canales_max: 16, color: "#0066cc", grosor: 5,   doble: true,  categoria: "analogico" },
  cable_xlr:   { nombre: "Cable XLR Audio",        canales_max: 2,  color: "#111111", grosor: 2,   doble: false, categoria: "analogico" },
  cable_red:   { nombre: "Cable Red / Fibra",      canales_max: 16, color: "#228b22", grosor: 3,   doble: false, categoria: "digital"   },
};
```

- `doble: true` → el cable se dibuja como dos líneas paralelas muy próximas (look manguera gruesa).
- `categoria` → determina a qué patch del camión va: `analogico`=izquierdo, `digital`=derecho, `video`=techo.

## 2. Reglas de Conexión por Elemento (`ELEMENT_RULES`)
La función `inferCableType(srcTipo, tgtTipo)` busca primero `force`, luego `analog_only`, y por defecto devuelve `manguera_8`.

La función `smartConnect(srcId, tgtId)` aplica las reglas especiales **antes** que el tipo de cable:
- `no_connect`: bloquea la conexión completamente (ej. camara_eng).
- `multi: ['A','B']`: genera 2 conexiones simultáneas (ej. microcasco → Micro + IEM).
- `dual: ['X','Y']`: 1ª llamada crea X, 2ª crea Y, 3ª es rechazada (ej. iem_dual).

## 3. Dirección de Señal y Flechas XLR
Los cables `cable_xlr` llevan punta de flecha según la dirección de la señal. No tienen etiqueta de texto ni lista de canales (solo las líneas).

```javascript
const SIGNAL_OUT = new Set(['micro_mano', 'micro_inalambrico', 'telefono_movil']);
const SIGNAL_IN  = new Set(['unidad_pinganillo', 'iem_dual', 'monitor', 'cascos_simples']);
```

- Si el `de` (origen de la conexión) es SIGNAL_OUT → `arrowEnd: 'target'` → flecha en tp.
- Si el `de` es SIGNAL_IN → `arrowEnd: 'source'` → path dibujado al revés → flecha en sp.
- Para microcasco: cable Micro (idx=0) → `arrowEnd: 'target'`; cable IEM (idx=1) → `arrowEnd: 'source'`.
- Para iem_dual: siempre `arrowEnd: 'source'`.

El marker SVG está definido en `<defs>` dentro del `<svg id="canvas">`:
```html
<marker id="xlr-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
  <polygon points="0 0, 7 3.5, 0 7" fill="#111111"/>
</marker>
```

## 4. Enrutado Visual

### Cables con enrutado en L (Manhattan)
Todos los cables usan enrutado ortogonal (tramos verticales + horizontal central).

### Cables paralelos entre el mismo par de elementos
Cuando 2+ cables comparten los mismos endpoints (ej. microcasco genera 2 cables), se calcula un `parallelOff` para cada uno:

```javascript
const PARALLEL_STEP = 9;
const parallelOff = gCount > 1 ? gIdx * PARALLEL_STEP - ((gCount-1) * PARALLEL_STEP) / 2 : 0;
```

Para XLR, el offset se aplica en X (legs verticales) Y en Y×0.5 (tramo horizontal), dando dos L-shapes completamente separadas:
```javascript
const midY_adj = midY_base + parallelOff * 0.5;
const ax = sp.x + parallelOff, bx = tp.x + parallelOff;
// forward: M ax sp.y L ax midY_adj L bx midY_adj L bx tp.y
// reversed: M bx tp.y L bx midY_adj L ax midY_adj L ax sp.y
```

### Cables `doble` (mangueras)
Se dibujan como dos paths con offset ±1.5px en x e y simultáneamente para dar aspecto de cable grueso.

### Enrutado al Camión UM (`truckPoint`)
- `categoria: 'analogico'` → patch izquierdo: `x = el.x + el.w * 0.28`
- `categoria: 'digital'`   → patch derecho: `x = el.x + el.w * 0.72`
- `cable_triax`            → techo: `x = el.x + el.w * 0.6, y = el.y + 20`

## 5. Etiquetas y Listas de Canales
- **cable_xlr**: sin etiqueta ni lista de canales. Solo la línea + flecha.
- **Todos los demás**: etiqueta centrada en el tramo horizontal + lista de canales arrastrable (capa `conn-labels`).

Si añades un nuevo tipo de cable, actualiza `renderConnections` para decidir si va en el grupo XLR (sin etiqueta) o en el grupo normal (con etiqueta + canales).
