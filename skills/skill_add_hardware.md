# Skill: Añadir Nuevo Hardware (Equipos) al Esquema

**Objetivo:** Instruir a cualquier IA o desarrollador sobre cómo añadir correctamente un nuevo equipo a la librería SVG interactiva sin romper la lógica de escalado, espejado y etiquetado.

## 1. Modificar `ELEMENTS_LIBRARY`
Todos los equipos están definidos en la constante `ELEMENTS_LIBRARY` en `esquemas-um.html`. Para añadir uno nuevo, debes insertar un objeto JSON con esta estructura:

```json
{
  "tipo": "nombre_unico",
  "nombre": "Nombre Visible UI",
  "w": 120,
  "h": 100,
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 120 100\"> ... </svg>"
}
```

### Reglas Críticas del SVG:
1. **NO incluir `<text>` de nombre en el SVG:** El nombre del equipo SE RENDERIZA DINÁMICAMENTE por debajo del dibujo en la capa `<g id="labels">`. Si el SVG incluye un tag `<text>Nombre del Equipo</text>` en su base, **debes eliminarlo** para evitar textos duplicados y solapados.
2. **Atributos `w` y `h` obligatorios:** La caja delimitadora, la función de Espejo y las conexiones de los cables dependen estrictamente de que `w` (ancho) y `h` (alto) estén definidos explícitamente en el objeto JSON, coincidiendo con las proporciones del `viewBox` del SVG.

## 2. Compatibilidad con Función Espejo (Girar)
El sistema rota los elementos usando la transformación matemática `translate(w, 0) scale(-1, 1)`. 
Si añades una cámara o equipo direccional (asimétrico), asegúrate de que el punto `0,0` del SVG está correctamente alineado arriba a la izquierda. No uses `transform` fuertemente anidados en la raíz del SVG que puedan colisionar con esta matemática.

## 3. Comportamiento en Z-Index
El equipo se renderizará automáticamente en `<g id="elements">`. Su color de fondo debe ser opaco (ej: `fill="#ffffff"`) si quieres que oculte los cables que se conectan a él por detrás (creando el efecto de que el cable "entra" en el conector).
