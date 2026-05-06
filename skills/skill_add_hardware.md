# Skill: Añadir Nuevo Hardware (Equipos) al Esquema

**Objetivo:** Instruir a cualquier IA o desarrollador sobre cómo añadir correctamente un nuevo equipo a la librería SVG interactiva.

## 1. Modificar `ELEMENTS_LIBRARY`
Todos los equipos están definidos en la constante `ELEMENTS_LIBRARY` en `index.html`. Para añadir uno nuevo, debes insertar un objeto JSON con esta estructura:

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
1. **NO incluir `<text>` de nombre en el SVG:** El nombre se renderiza dinámicamente en `<g id="labels">`. Texto duplicado en el SVG causa solapado.
2. **Atributos `w` y `h` obligatorios:** La caja delimitadora, la función Espejo y `edgePoint()` dependen de que coincidan con el `viewBox`.

## 2. Añadir Reglas de Conexión en `ELEMENT_RULES`
**Siempre** añade una entrada en `ELEMENT_RULES` junto con el nuevo equipo. Opciones:

```javascript
nuevo_equipo: { force: 'cable_xlr' }           // Fuerza un tipo de cable concreto
nuevo_equipo: { analog_only: true }             // Solo mangueras analógicas
nuevo_equipo: { no_connect: true }              // Bloquea cualquier conexión
nuevo_equipo: { multi: ['A','B'] }              // Genera N cables al conectar (ver microcasco)
nuevo_equipo: { dual: ['Tag-1','Tag-2'] }       // 1er intento=Tag-1, 2º=Tag-2, max 2 (ver iem_dual)
```

Si el equipo no tiene regla especial, puedes omitirlo (inferCableType devuelve `manguera_8` por defecto).

## 3. Actualizar Dirección de Señal (XLR)
Si el equipo es fuente o sumidero de señal XLR, actualiza los sets en `SIGNAL_OUT` / `SIGNAL_IN`:

```javascript
const SIGNAL_OUT = new Set(['micro_mano', 'micro_inalambrico', 'telefono_movil']);
const SIGNAL_IN  = new Set(['unidad_pinganillo', 'iem_dual', 'monitor', 'cascos_simples']);
```
- **SIGNAL_OUT**: el elemento EMITE señal → flecha apunta al destino.
- **SIGNAL_IN**: el elemento RECIBE señal → flecha apunta hacia él.
- Si un equipo es bidireccional (intercom), no se añade a ninguno → sin flecha.

## 4. Equipos Actuales (v1.9+)

| tipo               | nombre               | w   | h   | Regla                              |
|--------------------|----------------------|-----|-----|------------------------------------|
| camion_um          | Camión UM            | 420 | 160 | patch_analog + patch_digital       |
| panel_analogico    | Panel Analógico 16   | 200 | 90  | analog_only                        |
| panel_hydra_brio   | Panel Hydra Br.IO    | 220 | 130 | force: cable_red                   |
| patch_panel        | Patch Panel 16       | 200 | 70  | analog_only                        |
| caja_conexion      | Caja de Conexión     | 100 | 80  | analog_only                        |
| micro_mano         | Micro Mano           | 60  | 95  | force: cable_xlr · SIGNAL_OUT      |
| micro_inalambrico  | Micro Inalámbrico    | 70  | 100 | force: cable_xlr · SIGNAL_OUT      |
| microcasco         | Microcasco           | 110 | 90  | force: cable_xlr · multi (2 cables)|
| unidad_pinganillo  | IEM Receptor         | 60  | 95  | force: cable_xlr · SIGNAL_IN       |
| iem_dual           | Pinganillo           | 140 | 90  | force: cable_xlr · dual · SIGNAL_IN|
| telefono_movil     | Teléfono Móvil       | 50  | 85  | force: cable_xlr · SIGNAL_OUT      |
| camara_tv          | Cámara TV            | 120 | 100 | force: cable_triax                 |
| monitor            | Monitor              | 110 | 90  | force: cable_xlr · SIGNAL_IN       |
| intercom           | Intercom / Beltpack  | 70  | 90  | force: cable_xlr                   |
| mesa_sonido        | Mesa de Sonido       | 250 | 140 | analog_only                        |
| cascos_simples     | Cascos Monitor       | 110 | 80  | force: cable_xlr · SIGNAL_IN       |
| camara_eng         | Cámara ENG Enlace    | 120 | 90  | no_connect: true                   |

## 5. Compatibilidad con Función Espejo
El sistema rota con `translate(w, 0) scale(-1, 1)`. El punto `0,0` del SVG debe estar arriba a la izquierda. No uses `transform` en la raíz del SVG.
