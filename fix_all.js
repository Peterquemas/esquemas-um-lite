const fs = require('fs');

const tvPath = '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html';
const liteHtmlPath = '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html';
const litePwaPath = '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html';

function processContent(content) {
    // 1. Fix toggleMirror matching
    content = content.replace(
        /const el = state\.elements\.find\(e => e\.id === id\);/g,
        'const el = state.elements.find(e => String(e.id) === String(id));'
    );

    // 2. Add 'box' to state and toolbar
    if (!content.includes("boxes: []")) {
        content = content.replace(/notes: \[\],/, "notes: [],\n  boxes: [],");
    }
    
    // Replace text tool button and add box tool
    content = content.replace(
        /<button id="tool-text" onclick="setTool\('text'\)">Texto<\/button>/,
        `<button onclick="addTextNoteCenter()">Texto</button>\n      <button id="tool-box" onclick="setTool('box')">Recuadro</button>`
    );
    
    // 3. Add addTextNoteCenter function
    if (!content.includes("function addTextNoteCenter")) {
        content = content.replace(
            /function openTextModal/,
            `function addTextNoteCenter() {\n  const canvasRect = document.getElementById('canvas').getBoundingClientRect();\n  const centerX = Math.abs(canvasRect.x) + (window.innerWidth / 2) / state.zoom;\n  const centerY = Math.abs(canvasRect.y) + (window.innerHeight / 2) / state.zoom;\n  openTextModal(Math.round(centerX), Math.round(centerY));\n}\n\nfunction openTextModal`
        );
    }
    
    // Remove old text tool check from handleCanvasClick
    content = content.replace(
        /if \(state\.tool === 'text'\) \{[\s\S]*?return;\n  \}/,
        ''
    );

    // 4. Implement Box drawing logic
    // Add <g id="boxes"></g> to SVG
    if (!content.includes('<g id="boxes"></g>')) {
        content = content.replace(/<g id="grid"><\/g>/, '<g id="grid"></g>\n      <g id="boxes"></g>');
    }
    
    // In handleCanvasMouseMove, add drawing box
    if (!content.includes('isDrawingBox')) {
        content = content.replace(
            /let historyIndex = -1;/,
            `let historyIndex = -1;\nlet isDrawingBox = false;\nlet boxStart = {x: 0, y: 0};`
        );
        
        content = content.replace(
            /if \(state\.tool === 'connect'\) \{\n\s*drawConnectOverlay\(\);\n\s*\} else \{\n\s*clearOverlay\(\);\n\s*\}/,
            `if (state.tool === 'connect') {\n    drawConnectOverlay();\n  } else if (state.tool === 'box' && isDrawingBox) {\n    const overlay = document.getElementById('overlay');\n    overlay.innerHTML = '';\n    const bx = Math.min(boxStart.x, lastMousePos.x);\n    const by = Math.min(boxStart.y, lastMousePos.y);\n    const bw = Math.abs(lastMousePos.x - boxStart.x);\n    const bh = Math.abs(lastMousePos.y - boxStart.y);\n    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');\n    rect.setAttribute('x', bx); rect.setAttribute('y', by);\n    rect.setAttribute('width', bw); rect.setAttribute('height', bh);\n    rect.setAttribute('fill', 'rgba(0, 102, 204, 0.05)');\n    rect.setAttribute('stroke', '#0066cc');\n    rect.setAttribute('stroke-width', '2');\n    rect.setAttribute('stroke-dasharray', '5,5');\n    overlay.appendChild(rect);\n  } else {\n    clearOverlay();\n  }`
        );
    }
    
    // Add handleCanvasMouseDown and handleCanvasMouseUp
    if (!content.includes('handleCanvasMouseDown')) {
        content = content.replace(
            /document\.getElementById\('canvas'\)\.addEventListener\('click', handleCanvasClick\);/,
            `document.getElementById('canvas').addEventListener('mousedown', handleCanvasMouseDown);\n  document.getElementById('canvas').addEventListener('mouseup', handleCanvasMouseUp);\n  document.getElementById('canvas').addEventListener('click', handleCanvasClick);`
        );
        
        content = content.replace(
            /function handleCanvasClick\(e\) \{/,
            `function handleCanvasMouseDown(e) {\n  if (state.tool === 'box') {\n    const rect = document.getElementById('canvas').getBoundingClientRect();\n    boxStart.x = Math.round((e.clientX - rect.left) / state.zoom);\n    boxStart.y = Math.round((e.clientY - rect.top) / state.zoom);\n    isDrawingBox = true;\n  }\n}\n\nfunction handleCanvasMouseUp(e) {\n  if (state.tool === 'box' && isDrawingBox) {\n    const rect = document.getElementById('canvas').getBoundingClientRect();\n    const x = Math.round((e.clientX - rect.left) / state.zoom);\n    const y = Math.round((e.clientY - rect.top) / state.zoom);\n    isDrawingBox = false;\n    clearOverlay();\n    const bx = Math.min(boxStart.x, x);\n    const by = Math.min(boxStart.y, y);\n    const bw = Math.abs(x - boxStart.x);\n    const bh = Math.abs(y - boxStart.y);\n    if (bw > 20 && bh > 20) {\n      pushHistory();\n      state.boxes = state.boxes || [];\n      state.boxes.push({ id: state.nextId++, x: bx, y: by, w: bw, h: bh });\n      renderAll();\n      setTool('select');\n    }\n  }\n}\n\nfunction handleCanvasClick(e) {`
        );
    }
    
    // Add renderBoxes
    if (!content.includes('renderBoxes()')) {
        content = content.replace(
            /renderNotes\(\);\n\s*updateCounts\(\);/,
            `renderNotes();\n  renderBoxes();\n  updateCounts();`
        );
        
        content = content.replace(
            /function renderConnections\(\)/,
            `function selectBox(id) {\n  state.selectedId = id;\n  state.selectedType = 'box';\n  renderAll();\n  showProperties();\n}\n\nfunction renderBoxes() {\n  const bg = document.getElementById('boxes');\n  if (!bg) return;\n  bg.innerHTML = '';\n  (state.boxes || []).forEach(box => {\n    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');\n    const isSelected = state.selectedId === box.id && state.selectedType === 'box';\n    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');\n    rect.setAttribute('x', box.x);\n    rect.setAttribute('y', box.y);\n    rect.setAttribute('width', box.w);\n    rect.setAttribute('height', box.h);\n    rect.setAttribute('fill', 'rgba(0,100,200,0.03)');\n    rect.setAttribute('stroke', isSelected ? '#cc0000' : '#666');\n    rect.setAttribute('stroke-width', isSelected ? '4' : '2');\n    rect.setAttribute('stroke-dasharray', '8,4');\n    rect.setAttribute('rx', '10');\n    group.appendChild(rect);\n    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');\n    hit.setAttribute('x', box.x); hit.setAttribute('y', box.y);\n    hit.setAttribute('width', box.w); hit.setAttribute('height', box.h);\n    hit.setAttribute('fill', 'transparent');\n    hit.setAttribute('stroke', 'transparent');\n    hit.setAttribute('stroke-width', '15');\n    hit.style.cursor = 'move';\n    hit.addEventListener('mousedown', (e) => startBoxDrag(e, box.id));\n    hit.addEventListener('click', (e) => { e.stopPropagation(); selectBox(box.id); });\n    group.appendChild(hit);\n    bg.appendChild(group);\n  });\n}\n\nlet boxDragData = null;\nfunction startBoxDrag(e, id) {\n  if (state.tool !== 'select') return;\n  e.stopPropagation();\n  const box = state.boxes.find(b => b.id === id);\n  if (!box) return;\n  pushHistory();\n  const rect = document.getElementById('canvas').getBoundingClientRect();\n  boxDragData = {\n    id,\n    offsetX: (e.clientX - rect.left) / state.zoom - box.x,\n    offsetY: (e.clientY - rect.top) / state.zoom - box.y\n  };\n  document.addEventListener('mousemove', onBoxDrag);\n  document.addEventListener('mouseup', endBoxDrag);\n}\nfunction onBoxDrag(e) {\n  if (!boxDragData) return;\n  const box = state.boxes.find(b => b.id === boxDragData.id);\n  if (!box) return;\n  const rect = document.getElementById('canvas').getBoundingClientRect();\n  box.x = Math.round(((e.clientX - rect.left) / state.zoom - boxDragData.offsetX) / 10) * 10;\n  box.y = Math.round(((e.clientY - rect.top) / state.zoom - boxDragData.offsetY) / 10) * 10;\n  renderAll();\n}\nfunction endBoxDrag() {\n  if (boxDragData) autoSave();\n  boxDragData = null;\n  document.removeEventListener('mousemove', onBoxDrag);\n  document.removeEventListener('mouseup', endBoxDrag);\n}\n\nfunction renderConnections()`
        );
    }
    
    // Delete Box logic
    if (!content.includes("b => b.id !== state.selectedId")) {
        content = content.replace(
            /if \(state\.selectedType === 'note'\) \{\n\s*state\.notes = state\.notes\.filter\(n => n\.id !== state\.selectedId\);\n\s*\}/,
            `if (state.selectedType === 'note') {\n      state.notes = state.notes.filter(n => n.id !== state.selectedId);\n    } else if (state.selectedType === 'box') {\n      state.boxes = state.boxes.filter(b => b.id !== state.selectedId);\n    }`
        );
    }
    
    // AutoSave Box logic
    if (!content.includes("boxes: state.boxes")) {
        content = content.replace(
            /notes: state\.notes,/,
            `notes: state.notes,\n    boxes: state.boxes,`
        );
    }
    if (!content.includes("state.boxes = data.boxes")) {
        content = content.replace(
            /state\.notes = data\.notes \|\| \[\];/,
            `state.notes = data.notes || [];\n    state.boxes = data.boxes || [];`
        );
    }
    
    // Properties Panel for box
    if (!content.includes("selectedType === 'box'")) {
        content = content.replace(
            /\} else if \(state\.selectedType === 'note'\) \{/,
            `} else if (state.selectedType === 'box') {\n    const box = state.boxes.find(b => b.id === state.selectedId);\n    if (!box) return;\n    panel.innerHTML = \`\n      <h3>Recuadro de Área</h3>\n      <div class="field">\n        <label>Ancho / Alto</label>\n        <div style="display:flex; gap:4px;">\n          <input type="text" value="\${box.w}" oninput="updateBoxDim(\${box.id}, 'w', this.value)" style="width:50%;">\n          <input type="text" value="\${box.h}" oninput="updateBoxDim(\${box.id}, 'h', this.value)" style="width:50%;">\n        </div>\n      </div>\n      <button class="btn danger" onclick="deleteSelected()" style="width:100%; margin-top:10px;">Eliminar Recuadro</button>\n    \`;\n  } else if (state.selectedType === 'note') {`
        );
    }
    
    // Add updateBoxDim function
    if (!content.includes("function updateBoxDim")) {
        content = content.replace(
            /function updateElementPos/,
            `function updateBoxDim(id, prop, val) {\n  const box = state.boxes.find(b => b.id === id);\n  if (box && !isNaN(val)) {\n    box[prop] = parseInt(val, 10);\n    renderAll();\n    autoSave();\n  }\n}\n\nfunction updateElementPos`
        );
    }

    return content;
}

const paths = [tvPath, liteHtmlPath, litePwaPath];
paths.forEach(p => {
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        content = processContent(content);
        fs.writeFileSync(p, content, 'utf8');
        console.log("Processed " + p);
    }
});
