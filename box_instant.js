const fs = require('fs');

const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

function processContent(content) {
    // 1. Change the button
    content = content.replace(
        /<button id="tool-box" onclick="setTool\('box'\)">Recuadro<\/button>/,
        `<button onclick="addBoxCenter()">Recuadro</button>`
    );

    // 2. Add addBoxCenter function
    if (!content.includes('function addBoxCenter()')) {
        content = content.replace(
            /function addTextNoteCenter\(\) \{/,
            `function addBoxCenter() {\n  const canvasRect = document.getElementById('canvas').getBoundingClientRect();\n  const centerX = Math.round(Math.abs(canvasRect.x) + (window.innerWidth / 2) / state.zoom);\n  const centerY = Math.round(Math.abs(canvasRect.y) + (window.innerHeight / 2) / state.zoom);\n  pushHistory();\n  state.boxes = state.boxes || [];\n  const boxId = state.nextId++;\n  state.boxes.push({ id: boxId, x: centerX - 200, y: centerY - 150, w: 400, h: 300 });\n  state.selectedId = boxId;\n  state.selectedType = 'box';\n  setTool('select');\n  renderAll();\n  showProperties();\n}\n\nfunction addTextNoteCenter() {`
        );
    }
    
    // We can leave the old dragging logic in place, it won't hurt anything since setTool('box') is no longer reachable.

    return content;
}

paths.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    content = processContent(content);
    fs.writeFileSync(p, content, 'utf8');
    console.log("Processed " + p);
});
