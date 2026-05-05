const fs = require('fs');

const tvPath = '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html';
const liteHtmlPath = '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html';
const litePwaPath = '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html';

function forceInject(p) {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    
    // 1. Inject toggleMirror if missing
    if (!content.includes('function toggleMirror(id)')) {
        content = content.replace(
            /function showProperties\(\) \{/,
            `function toggleMirror(id) {\n  const el = state.elements.find(e => String(e.id) === String(id));\n  if (el) {\n    el.mirror = !el.mirror;\n    renderAll();\n    autoSave();\n  }\n}\n\nfunction showProperties() {`
        );
    }
    
    // 2. Fix the box tool event listeners
    // Sometimes mousedown on canvas doesn't trigger if elements intercept it.
    // Let's add pointer-events: none to the drawing box.
    content = content.replace(/rect\.setAttribute\('stroke-dasharray', '5,5'\);/, `rect.setAttribute('stroke-dasharray', '5,5');\n    rect.setAttribute('pointer-events', 'none');`);
    
    // Why did Recuadro not work?
    // Maybe `addTextNoteCenter()` threw an error, breaking setTool? No.
    // Wait! Let's check `isDrawingBox`. If mousedown on SVG doesn't register?
    // The `<svg id="canvas">` has a `<rect class="canvas-bg">`.
    // The event listeners were added to `document.getElementById('canvas')`.
    // In handleCanvasMouseDown, if the user drags, the mousemove is on the document or canvas.
    // Wait, mousedown on canvas-bg triggers `handleCanvasMouseDown`. But maybe the user clicked, dragged, and released?
    // Let's add a console log to track. But we can't see console.
    
    fs.writeFileSync(p, content, 'utf8');
    console.log("Forced injection on " + p);
}

[liteHtmlPath, litePwaPath, tvPath].forEach(forceInject);
