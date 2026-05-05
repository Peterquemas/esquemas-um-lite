const fs = require('fs');

const tvPath = '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html';
const liteHtmlPath = '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html';
const litePwaPath = '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html';

function processContent(content) {
    // 1. Remove hardcoded names at the bottom of the SVGs
    let match = content.match(/const ELEMENTS_LIBRARY = (\[.*\]);/);
    if (!match) return content;
    
    let library = JSON.parse(match[1]);
    for (let el of library) {
        // We look for text tags near the bottom. 
        // We know the texts to remove are the exact ones representing the element name at the bottom.
        // Easiest is to use regex to remove <text...>NAME</text>
        let toRemove = [
            "Camión UM · Unidad Móvil",
            "ENG Link",
            "Cámara TV",
            "Caja de Conexión",
            "Micro Mano",
            "Micro Inalámbrico",
            "Microcasco",
            "IEM Receptor",
            "Base IEM Dual",
            "Teléfono",
            "Intercom",
            "Mesa de Sonido",
            "Panel Hydra \\(Calrec Br\\.IO\\)"
        ];
        for (let name of toRemove) {
            let regex = new RegExp(`<text[^>]*>${name}</text>\\n*`);
            el.svg = el.svg.replace(regex, '');
        }
        
        // Also remove specific known label tags just in case
        el.svg = el.svg.replace(/<text x="60" y="98"[^>]*>Cámara TV<\/text>\n*/, '');
    }
    
    let newLibString = JSON.stringify(library);
    content = content.replace(match[0], `const ELEMENTS_LIBRARY = ${newLibString};`);

    // 2. Fix the dynamic label CSS
    content = content.replace(
        /\.element-label \{ font-size: 10px; fill: #333; pointer-events: none; user-select: none; \}/,
        `.element-label { font-size: 14px; fill: #111; font-weight: bold; pointer-events: none; user-select: none; text-shadow: 1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff; }`
    );
    // There is also another CSS block for print or dark mode sometimes, let's replace globally
    content = content.replace(
        /\.element-label \{ font-size: 10px; fill: #333; font-family: sans-serif; \}/g,
        `.element-label { font-size: 14px; fill: #111; font-weight: bold; font-family: sans-serif; text-shadow: 1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff; }`
    );
    
    // 3. Position the dynamic label below the element
    content = content.replace(
        /label\.setAttribute\('y', el\.y \+ el\.h \+ 14\);/,
        `label.setAttribute('y', el.y + el.h + 20);`
    );

    // 4. Mirror Transform Fix
    // If the group has scale(-1, 1), we MUST specify transform-origin, OR we can use the translate technique.
    // The translate technique works, but maybe the user's browser (Safari?) is picky.
    // Let's use standard translate and scale, but ensure we do it on the inner wrapper!
    // If we do it on the group, the bounding box is mirrored too.
    // I will modify toggleMirror to be 100% sure it re-renders and autoSaves.
    content = content.replace(
        /function toggleMirror\(id\) \{\n  const el = state.elements.find\(e => e.id === id\);\n  if \(el\) \{\n    el.mirror = !el.mirror;\n    renderAll\(\);\n  \}\n\}/,
        `function toggleMirror(id) {\n  const el = state.elements.find(e => e.id === id);\n  if (el) {\n    el.mirror = !el.mirror;\n    renderAll();\n    autoSave();\n  }\n}`
    );

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

