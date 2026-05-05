# Skill: Importación de Hardware y SVG Personalizado

## Contexto
A partir de la v1.9, los usuarios pueden añadir sus propios SVG (p.ej. Yamaha Rio) directamente desde la interfaz. Esto significa que la biblioteca de equipos ya no es estática (`ELEMENTS_LIBRARY`), sino un híbrido dinámico.

## Instrucciones de Modificación:

1. **Unificación de Librerías (`allLib`)**
   Cualquier función que requiera buscar información de un equipo (`w`, `h`, `svg`, `nombre`) DEBE buscar en la biblioteca combinada, NUNCA solo en `ELEMENTS_LIBRARY`.
   - **Forma correcta:** `const allLib = ELEMENTS_LIBRARY.concat(state.customLibrary || []);`
   - Luego, aplica el `.find(e => e.tipo === tipo)` sobre `allLib`.
   - Las funciones que requieren esto incluyen: `addElement`, `renderElements`, y `buildElementList`.

2. **Atributo `customConnType`**
   Los equipos importados carecen del tratamiento "hardcoded" de la v1.8 (ej. `e1.type === 'camion_um'`). En su lugar, el sistema de auto-conexión (`autoConnect`) debe tener en cuenta el `customConnType` definido al importar:
   - `digital`: Fibras, Dante, Red. (Tratar como `panel_hydra`).
   - `analog_box`: Cajetín XLR (Tratar como `caja_conexion` y usar Mangueras).
   - `analog_mic`: Equipos sueltos (Tratar como `micro_mano` y usar cable Audio individual).
   - *Consideración futura:* Si añades un nuevo tipo de cable (ej. `cable_audio_doble` para microcascos), actualiza también `autoConnect` y el inspector de `CABLE_TYPES`.

3. **Restauración de Eventos en la Barra Lateral**
   Cada vez que se llama a `saveImportedElement()`, la UI debe redibujarse. Para ello, se invoca `buildElementList()`. Asegúrate de que `buildElementList` solo reconstruye la vista y regenera el atributo `draggable=true` y el evento `dragstart` por cada ítem. NUNCA coloques en esta función eventos del canvas global (como `dragover` o `drop`), ya que se multiplicarían.
