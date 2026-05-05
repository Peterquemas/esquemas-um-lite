const fs = require('fs');

const tvPath = '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html';
const liteHtmlPath = '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html';
const litePwaPath = '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html';

const tvContent = fs.readFileSync(tvPath, 'utf8');

// Find the line that starts with const ELEMENTS_LIBRARY =
let match = tvContent.match(/const ELEMENTS_LIBRARY = (\[.*\]);/);
if (!match) {
    console.error("Could not find ELEMENTS_LIBRARY in original TVE SONIDO file");
    process.exit(1);
}

let library;
try {
    library = JSON.parse(match[1]);
} catch(e) {
    console.error("Failed to parse library JSON:", e);
    process.exit(1);
}

// 1. Find camara_tv and modify it to include a mic
let camaraTvIndex = library.findIndex(e => e.tipo === 'camara_tv');
if (camaraTvIndex !== -1) {
    let svg = library[camaraTvIndex].svg;
    // Add microphone if not already present
    if (!svg.includes('Microphone')) {
        svg = svg.replace('</svg>', '  <!-- Microphone -->\n  <rect x="40" y="12" width="25" height="6" rx="3" fill="#333" stroke="black" stroke-width="1"/>\n</svg>');
        library[camaraTvIndex].svg = svg;
    }
} else {
    console.log("camara_tv not found");
}

// 2. Add camara_eng right after camion_um
const camaraEng = {
    tipo: "camara_eng", 
    nombre: "Cámara ENG Link", 
    w: 120, 
    h: 110, 
    svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 120 110\">\n  <rect x=\"30\" y=\"35\" width=\"55\" height=\"30\" rx=\"2\" fill=\"white\" stroke=\"black\" stroke-width=\"2\"/>\n  <rect x=\"15\" y=\"40\" width=\"15\" height=\"20\" rx=\"1\" fill=\"white\" stroke=\"black\" stroke-width=\"1.5\"/>\n  <path d=\"M85 35 L85 15 M80 15 L90 15\" stroke=\"black\" stroke-width=\"2\"/>\n  <circle cx=\"85\" cy=\"15\" r=\"3\" fill=\"black\"/>\n  <rect x=\"35\" y=\"25\" width=\"25\" height=\"6\" rx=\"3\" fill=\"#333\" stroke=\"black\" stroke-width=\"1\"/>\n  <path d=\"M30 50 L10 50 L10 90\" fill=\"none\" stroke=\"black\" stroke-width=\"1\" stroke-dasharray=\"2,1\"/>\n  <text x=\"60\" y=\"105\" text-anchor=\"middle\" font-size=\"8\" font-family=\"Arial,sans-serif\" fill=\"black\">ENG Link</text>\n</svg>\n"
};

let engIndex = library.findIndex(e => e.tipo === 'camara_eng');
if (engIndex === -1) {
    library.splice(1, 0, camaraEng);
}

const newLibString = JSON.stringify(library);
const replacementLine = `const ELEMENTS_LIBRARY = ${newLibString};`;

// Also fix the mirror logic in TVE SONIDO
let newTvContent = tvContent.replace(match[0], replacementLine);

// Fix toggleMirror in properties panel
if (!newTvContent.includes('toggleMirror')) {
    newTvContent = newTvContent.replace(
        /<div class="field">\s*<label>Etiqueta<\/label>\s*<input type="text" value="\$\{el\.label\}" onfocus="pushHistory\(\)" oninput="updateElementLabel\(\$\{el\.id\}, this\.value\)">\s*<\/div>/,
        `<div class="field">\n        <label>Etiqueta</label>\n        <input type="text" value="\${el.label}" onfocus="pushHistory()" oninput="updateElementLabel(\${el.id}, this.value)">\n      </div>\n      <div class="field">\n        <button class="btn success" onclick="toggleMirror(\${el.id})" style="width:100%; font-weight:bold;">↔ GIRAR (ESPEJO)</button>\n      </div>`
    );
}

// Add toggleMirror function
if (!newTvContent.includes('function toggleMirror')) {
    newTvContent = newTvContent.replace(
        /function showProperties\(\) \{/,
        `function toggleMirror(id) {\n  const el = state.elements.find(e => e.id === id);\n  if (el) {\n    el.mirror = !el.mirror;\n    renderAll();\n  }\n}\n\nfunction showProperties() {`
    );
}

// Add mirror: false to addElement
newTvContent = newTvContent.replace(
    /label: label !== undefined \? label : meta\.nombre\s*\};/,
    `label: label !== undefined ? label : meta.nombre,\n    mirror: false\n  };`
);

// Add transform to renderElements
newTvContent = newTvContent.replace(
    /group\.setAttribute\('transform', \`translate\(\$\{el\.x\}, \$\{el\.y\}\)\`\);/,
    `// Transformación con Espejo\n    let transform = \`translate(\${el.x}, \${el.y})\`;\n    if (el.mirror) transform += \` translate(\${el.w}, 0) scale(-1, 1)\`;\n    group.setAttribute('transform', transform);`
);

fs.writeFileSync(tvPath, newTvContent, 'utf8');
console.log("Fixed TVE SONIDO original file.");

// Now fix the liteHtmlPath (which I corrupted earlier)
let liteHtmlContent = fs.readFileSync(liteHtmlPath, 'utf8');
// It might be corrupted with my bad replacement. I will replace the bad ELEMENTS_LIBRARY with the good one.
let badMatch = liteHtmlContent.match(/const ELEMENTS_LIBRARY = (\[.*\]);/);
if (badMatch) {
    liteHtmlContent = liteHtmlContent.replace(badMatch[0], replacementLine);
    fs.writeFileSync(liteHtmlPath, liteHtmlContent, 'utf8');
    console.log("Fixed LITE fallback file.");
} else {
    console.log("Could not find ELEMENTS_LIBRARY in LITE fallback file.");
}

// Now fix the PWA file
let pwaContent = fs.readFileSync(litePwaPath, 'utf8');
let pwaMatch = pwaContent.match(/const ELEMENTS_LIBRARY = (\[[\s\S]*?\]);\s*const CABLE_TYPES/);
if (pwaMatch) {
    // The PWA file uses backticks in SVG, so I need to stringify differently or just use the JSON string.
    pwaContent = pwaContent.replace(pwaMatch[1], newLibString);
    fs.writeFileSync(litePwaPath, pwaContent, 'utf8');
    console.log("Fixed PWA file.");
} else {
    console.log("Could not find ELEMENTS_LIBRARY in PWA file.");
}

