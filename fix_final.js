const fs = require('fs');

const tvPath = '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html';
const liteHtmlPath = '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html';
const litePwaPath = '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html';

function processContent(content) {
    // 1. Unselect element after mirroring
    content = content.replace(
        /el\.mirror = !el\.mirror;\n\s*renderAll\(\);\n\s*autoSave\(\);/,
        `el.mirror = !el.mirror; state.selectedId = null; state.selectedType = null; document.getElementById('properties-panel').innerHTML = '<p style="font-size:11px;color:#888;padding:8px;background:#f9f9f9;border-radius:4px;">Selecciona un elemento o conexión.</p>'; renderAll(); autoSave();`
    );

    // 2. Fix the Box click bug (const -> let)
    content = content.replace(/const bx = Math\.min\(boxStart\.x, x\);/, 'let bx = Math.min(boxStart.x, x);');
    content = content.replace(/const by = Math\.min\(boxStart\.y, y\);/, 'let by = Math.min(boxStart.y, y);');
    content = content.replace(/const bw = Math\.abs\(x - boxStart\.x\);/, 'let bw = Math.abs(x - boxStart.x);');
    content = content.replace(/const bh = Math\.abs\(y - boxStart\.y\);/, 'let bh = Math.abs(y - boxStart.y);');
    
    // 3. Fix deleteSelected missing the box type
    if (!content.includes("deleteBox(")) {
        content = content.replace(
            /else if \(state\.selectedType === 'note'\) deleteNote\(state\.selectedId\);/,
            `else if (state.selectedType === 'note') deleteNote(state.selectedId);\n  else if (state.selectedType === 'box') deleteBox(state.selectedId);`
        );
        content += `\nfunction deleteBox(id) { pushHistory(); state.boxes = state.boxes.filter(b => b.id !== id); state.selectedId = null; state.selectedType = null; renderAll(); autoSave(); }`;
    }

    return content;
}

[liteHtmlPath, litePwaPath, tvPath].forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    content = processContent(content);
    fs.writeFileSync(p, content, 'utf8');
    console.log("Fixed " + p);
});
