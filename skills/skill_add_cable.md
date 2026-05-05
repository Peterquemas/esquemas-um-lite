# Skill: Añadir y Enrutar Nuevos Tipos de Cable

**Objetivo:** Instruir sobre cómo añadir un nuevo tipo de cable (ej. Fibra SMPTE, BNC de Video) y configurar su enrutamiento inteligente en la Unidad Móvil.

## 1. Modificar el Diccionario `CABLE_TYPES`
Busca el objeto `CABLE_TYPES` en `esquemas-um.html`. Añade tu nuevo cable:

```javascript
  fibra_smpte: { color: '#8800ff', grosor: 4.5, dashed: false, canales_max: 2, label: 'Fibra Óptica SMPTE' }
```
- `color`: Código HEX.
- `grosor`: En píxeles.
- `dashed`: `true` para línea de puntos, `false` para línea continua.
- `canales_max`: Número de campos que aparecerán en el panel derecho para esa manguera.
- `label`: El nombre legible en la interfaz de usuario.

## 2. Añadirlo a la UI (Panel Lateral)
En la función `showProperties()`, busca la cadena HTML `<select onchange="updateConnType(...)">` y añade un `<option>` correspondiente:
```html
<option value="fibra_smpte" ${conn.tipo==='fibra_smpte'?'selected':''}>Fibra SMPTE (morado)</option>
```

## 3. Lógica de Parcheo en el Camión (Motor de Enrutamiento)
El corazón del sistema es la función `truckPoint(el, tx, ty, cableTipo)`.
Esta función detecta si el cable conectado al camión va al techo, al rack digital o al rack analógico.

Para enrutar la Fibra SMPTE al Panel Digital (Derecho) del camión, añade la comprobación:
```javascript
function truckPoint(el, tx, ty, cableTipo) {
  const isDigital = cableTipo === 'cable_red' || cableTipo === 'fibra_smpte';
  ...
  } else if (isDigital) {
    // Parchea el cable matemáticamente en las coordenadas del panel derecho del camión
    return { x: el.x + (el.w || 420) * 0.72, y: el.y + (el.h || 160) * 0.55 };
  }
}
```

## 4. Renderizado del Listado de Canales
Si el cable transporta señales (canales), el listado se renderizará automáticamente en la capa `<g id="conn-labels">` siempre que esté por encima del fondo. No es necesaria ninguna lógica extra, ya que es agnóstico del tipo de cable y solo depende de `canales_max`.
