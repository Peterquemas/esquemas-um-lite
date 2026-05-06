# Skill: Gestión de Estado e Inicialización (PWA Offline)

## Contexto
El generador de Esquemas UM TVE es una PWA 100% offline que persiste en `localStorage`. Un error crítico común al añadir funciones es desincronizar la carga del DOM y la inicialización de los eventos.

## Reglas Críticas

### 1. El Motor de Arranque (`window.onload`)
NUNCA invoques `init()` libremente al final del script.
- **CORRECTO:** `window.onload = init;`
- **INCORRECTO:** `init();` flotando al final del bloque `<script>`.

### 2. Eventos de Drag & Drop del Canvas
Los eventos `dragover`, `dragenter` y `drop` del contenedor `#canvas-container` deben registrarse **una sola vez**, dentro de `init()`. **NUNCA dentro de `buildElementList()`**.

`buildElementList()` se llama múltiples veces (al arrancar, al importar elementos custom). Si se registran listeners de drop dentro de ella, se acumulan → lag progresivo → el drop requiere espera o doble intento.

```javascript
function init() {
  buildElementList();
  setupTextInput();
  drawGrid();
  updateApiStatus();
  if (!loadAutoSave()) loadTemplate('vacio');
  else { pushHistory(); renderAll(); }
  // Canvas drop — registrar aquí, nunca en buildElementList
  const cc = document.getElementById('canvas-container');
  cc.addEventListener('dragover',  (e) => e.preventDefault());
  cc.addEventListener('dragenter', (e) => e.preventDefault());
  cc.addEventListener('drop', (e) => {
    e.preventDefault();
    const tipo = e.dataTransfer.getData('text/plain');
    if (!tipo) return;
    const rect = document.getElementById('canvas').getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.zoom - 50;
    const y = (e.clientY - rect.top)  / state.zoom - 50;
    pushHistory();
    addElement(tipo, x, y);
  });
}
```

### 3. `buildElementList()` — Solo UI
Esta función SOLO reconstruye el DOM de la barra lateral (items + dragstart). No debe contener:
- Eventos globales del canvas (`dragover`, `drop`)
- Lógica de negocio o estado

### 4. Autoguardado (`localStorage`)
`autoSave()` guarda en `umtve_autosave` con debounce de 1 segundo. Se llama automáticamente desde `renderAll()`.
`loadAutoSave()` restaura el estado al arrancar. Si no hay datos guardados, `init()` carga `loadTemplate('vacio')`.

Si añades un nuevo array al `state` global, inclúyelo en:
- El objeto devuelto por `autoSave()` (campo a persistir)
- La recuperación en `loadAutoSave()`
- La inicialización por defecto en `let state = { ... }`

Ejemplo: `state.customLibrary` aparece en los tres lugares.

```javascript
let autoSaveTimeout = null;
function autoSave() {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    const data = {
      titulo: document.getElementById('diagram-title')?.value || '',
      elementos: state.elements,
      conexiones: state.connections,
      notas: state.notes,
      customLibrary: state.customLibrary,
      nextId: state.nextId,
      timestamp: Date.now()
    };
    localStorage.setItem('umtve_autosave', JSON.stringify(data));
  }, 1000);
}

function loadAutoSave() {
  try {
    const raw = localStorage.getItem('umtve_autosave');
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.elementos)) return false;
    state.elements = data.elementos;
    state.connections = (data.conexiones || []).map(migrateConnection);
    state.notes = data.notas || [];
    state.customLibrary = data.customLibrary || [];
    state.nextId = data.nextId || (Math.max(0, ...state.elements.map(e => e.id), ...state.connections.map(c => c.id)) + 1);
    const titleEl = document.getElementById('diagram-title');
    if (titleEl && data.titulo) titleEl.value = data.titulo;
    return true;
  } catch (e) {
    return false;
  }
}
```

### 5. Estado Global

```javascript
let state = {
  elements: [],
  connections: [],      // Cada conexión: { id, de, a, tipo, arrowEnd, etiqueta, canales, canalesPos, escalaLista }
  notes: [],
  customLibrary: [],    // Elementos importados por el usuario
  selectedId: null,
  selectedType: null,
  tool: 'select',
  zoom: 1,
  pendingConnection: null,
  nextId: 1,
  history: [],          // Snapshots para undo/redo (no se persiste en autoSave)
  historyIndex: -1,
  aiProvider: '...',
  apiKey: '...',
  geminiKey: '...'
};
```

`history` e `historyIndex` viven dentro de `state` pero **no se incluyen en autoSave** — son estado de sesión transitorio.
