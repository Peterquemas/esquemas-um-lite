# Skill: Gestión de Estado e Inicialización (PWA Offline)

## Contexto
El generador de Esquemas UM TVE es una PWA 100% offline (sin dependencias de servidor) que basa su persistencia en el `localStorage` del navegador. Un error crítico común al añadir funciones es desincronizar la carga del DOM y la inicialización de los eventos.

## Reglas Críticas para Futuros Agentes:

1. **El Motor de Arranque (`window.onload`)**
   NUNCA invoques `init()` libremente al final del archivo HTML ni en el `<body>`. El `<script>` contiene llamadas a elementos DOM que podrían no haberse renderizado.
   - **CORRECTO:** `window.onload = init;` (Garantiza que el parser ha leído modales, canvas, inputs, etc.)
   - **INCORRECTO:** `init();` flotando al final del bloque `<script>`. Esto abortará silenciosamente la carga si choca con un elemento inexistente, rompiendo los eventos del lienzo.

2. **Gestión de Eventos del Lienzo (Drag & Drop)**
   El lienzo (`#canvas`) debe tener sus escuchadores adheridos a él directamente.
   - Utiliza una variable de bloqueo (`let eventsInitialized = false;`) para asegurar que el `addEventListener` no se asigne de forma redundante tras una recarga de plantilla o refresco del autoguardado.
   - **Eventos requeridos obligatoriamente** para el drop HTML5: `dragenter` (prevent default), `dragover` (prevent default) y `drop`.

3. **Autoguardado (`localStorage`)**
   La función `autoSave()` guarda el estado actual en `umtve_autosave`.
   Si añades un nuevo array al `state` global (por ejemplo `state.customLibrary`), DEBES incluirlo en:
   - El objeto devuelto por `autoSave()`.
   - La recuperación de datos en `loadAutoSave()`.
   - La inicialización por defecto en el bloque inicial `let state = { ... }`.
