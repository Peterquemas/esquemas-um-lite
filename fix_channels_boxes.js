const fs = require('fs');

const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

function processContent(content) {
    // 1. Add <g id="conn-labels"></g> if it doesn't exist
    if (!content.includes('id="conn-labels"')) {
        content = content.replace(
            /<g id="elements"><\/g>/,
            `<g id="elements"></g>\n      <g id="conn-labels"></g>`
        );
    }

    // 2. Clear conn-labels in renderConnections
    if (!content.includes("document.getElementById('conn-labels');")) {
        content = content.replace(
            /const g = document\.getElementById\('connections'\);\n\s*g\.innerHTML = '';/,
            `const g = document.getElementById('connections');\n  g.innerHTML = '';\n  const connLabelsGrp = document.getElementById('conn-labels');\n  if(connLabelsGrp) connLabelsGrp.innerHTML = '';`
        );
    }
    
    // 3. Update the hilo styling and appending logic
    content = content.replace(
        /hilo\.setAttribute\('stroke', '#000'\); hilo\.setAttribute\('stroke-width', '0\.5'\);\n\s*hilo\.setAttribute\('opacity', '0\.4'\);/,
        `hilo.setAttribute('stroke', '#000'); hilo.setAttribute('stroke-width', '1.5');\n      hilo.setAttribute('stroke-dasharray', '4,4');`
    );
    
    // Change g.appendChild to connLabelsGrp.appendChild for labels
    content = content.replace(/g\.appendChild\(lblBg\);/g, "if(connLabelsGrp) connLabelsGrp.appendChild(lblBg); else g.appendChild(lblBg);");
    content = content.replace(/g\.appendChild\(lbl\);/g, "if(connLabelsGrp) connLabelsGrp.appendChild(lbl); else g.appendChild(lbl);");
    content = content.replace(/g\.appendChild\(hilo\);/g, "if(connLabelsGrp) connLabelsGrp.appendChild(hilo); else g.appendChild(hilo);");
    content = content.replace(/g\.appendChild\(listGroup\);/g, "if(connLabelsGrp) connLabelsGrp.appendChild(listGroup); else g.appendChild(listGroup);");

    // 4. Add resize logic to renderBoxes
    if (!content.includes("resizeH.setAttribute")) {
        content = content.replace(
            /group\.appendChild\(hit\);\n\s*bg\.appendChild\(group\);/,
            `group.appendChild(hit);\n    if (isSelected) {\n      const resizeH = document.createElementNS('http://www.w3.org/2000/svg', 'rect');\n      resizeH.setAttribute('x', box.x + box.w - 8);\n      resizeH.setAttribute('y', box.y + box.h - 8);\n      resizeH.setAttribute('width', 16);\n      resizeH.setAttribute('height', 16);\n      resizeH.setAttribute('fill', '#cc0000');\n      resizeH.style.cursor = 'se-resize';\n      resizeH.addEventListener('mousedown', (e) => startBoxResize(e, box.id));\n      group.appendChild(resizeH);\n    }\n    bg.appendChild(group);`
        );
    }

    // 5. Add startBoxResize functions
    if (!content.includes("function startBoxResize")) {
        content = content.replace(
            /let boxDragData = null;/,
            `let boxResizeData = null;\nfunction startBoxResize(e, id) {\n  e.stopPropagation();\n  const box = state.boxes.find(b => b.id === id);\n  if (!box) return;\n  pushHistory();\n  const rect = document.getElementById('canvas').getBoundingClientRect();\n  boxResizeData = {\n    id,\n    startX: (e.clientX - rect.left) / state.zoom,\n    startY: (e.clientY - rect.top) / state.zoom,\n    startW: box.w,\n    startH: box.h\n  };\n  document.addEventListener('mousemove', onBoxResize);\n  document.addEventListener('mouseup', endBoxResize);\n}\nfunction onBoxResize(e) {\n  if (!boxResizeData) return;\n  const box = state.boxes.find(b => b.id === boxResizeData.id);\n  if (!box) return;\n  const rect = document.getElementById('canvas').getBoundingClientRect();\n  const mx = (e.clientX - rect.left) / state.zoom;\n  const my = (e.clientY - rect.top) / state.zoom;\n  box.w = Math.max(50, boxResizeData.startW + (mx - boxResizeData.startX));\n  box.h = Math.max(50, boxResizeData.startH + (my - boxResizeData.startY));\n  renderAll();\n}\nfunction endBoxResize() {\n  if (boxResizeData) autoSave();\n  boxResizeData = null;\n  document.removeEventListener('mousemove', onBoxResize);\n  document.removeEventListener('mouseup', endBoxResize);\n}\n\nlet boxDragData = null;`
        );
    }

    return content;
}

paths.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    content = processContent(content);
    fs.writeFileSync(p, content, 'utf8');
    console.log("Processed " + p);
});

