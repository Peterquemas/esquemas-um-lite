# Skill: Algoritmos de Punto de Anclaje y Z-Index

**Objetivo:** Comprender las mecánicas de renderizado Z-Index y anclaje de cables para resolver problemas visuales sin romper la arquitectura del proyecto Esquemas UM Lite.

## 1. Topología del Z-Index (Dominio SVG)
El proyecto utiliza grupos `<g>` anidados en el archivo principal HTML para simular el apilamiento Z-Index. El orden es estricto de fondo a superficie:

1. `<rect class="canvas-bg">` (Fondo blanco absoluto)
2. `<g id="grid">` (Rejilla de fondo opcional)
3. `<g id="boxes">` (Recuadros/Zonas translúcidas)
4. `<g id="connections">` (Los cables, paths de SVG)
5. `<g id="elements">` (Los dibujos SVG del equipamiento. Son opacos, ocultan el origen del cable)
6. `<g id="conn-labels">` (Las listas de canales, forzadas por encima de los elementos para no quedar ocultas)
7. `<g id="labels">` (Las etiquetas dinámicas de texto bajo los equipos)
8. `<g id="notes">` (Herramienta Texto del usuario)
9. `<g id="overlay">` (UI temporal de creación)

*Nota IA: Jamás inyectes elementos interactivos fuera de su capa correspondiente, o los eventos de ratón fallarán.*

## 2. El Algoritmo `edgePoint`
Por defecto, la función `edgePoint(el, tx, ty)` calcula la intersección del cable con la "caja delimitadora" imaginaria de un equipo. Esto significa que los cables nunca atraviesan el icono del equipo, sino que se detienen en su borde matemático, dando un aspecto limpio.

Si cambias la caja `w` y `h` de un equipo en la librería, `edgePoint` se ajustará automáticamente.

## 3. Auto-Selección Inteligente
En la función `selectElement(id)` se encuentra la lógica que "adivina" qué cable quieres usar cuando conectas dos equipos.
Si la IA necesita cambiar la predicción de cables (ej. añadir un parche para micrófonos), debe modificar esta sección:

```javascript
// Si uno es cámara, usar Triax
if (tA === 'camara_tv' || tB === 'camara_tv') selectedCableType = 'cable_triax';
// Si uno es ENG Link, también usar Triax (o fibra en un futuro)
else if (tA === 'eng_link' || tB === 'eng_link') selectedCableType = 'cable_triax';
```
