const fs = require('fs');

const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

function patch(content) {
    // 1. Fix CABLE_TYPES
    if (!content.includes('cable_audio_doble')) {
        content = content.replace(
            /cable_audio: \{ nombre: "Cable Audio \(XLR\)",\s*canales_max: 1,\s*color: "#000000", grosor: 1\.5, doble: false \}/,
            `cable_audio: { nombre: "Cable Audio (XLR)",   canales_max: 1,  color: "#000000", grosor: 1.5, doble: false },
  cable_audio_doble: { nombre: "2x Cable Audio (XLR)", canales_max: 2, color: "#000000", grosor: 1.5, doble: true }`
        );
    }

    // 2. Fix autoSave (add customLibrary and boxes)
    if (!content.includes('customLibrary: state.customLibrary')) {
        content = content.replace(
            /notes: state\.notes,\s*nextId: state\.nextId/,
            `notes: state.notes,\n    boxes: state.boxes,\n    customLibrary: state.customLibrary,\n    nextId: state.nextId`
        );
    }

    // 3. Fix Microcasco logic in selectElement
    // We want to find the whole block and replace it with the new one
    const startMarker = "const isMicrocasco = srcEl.tipo === 'microcasco' || tgtEl.tipo === 'microcasco';";
    if (content.includes(startMarker)) {
        const searchRegex = /const isMicrocasco = srcEl\.tipo === 'microcasco' \|\| tgtEl\.tipo === 'microcasco';[\s\S]*?autoSave\(\);/;
        content = content.replace(searchRegex, 
`const isMicrocasco = srcEl.tipo === 'microcasco' || tgtEl.tipo === 'microcasco';
      if (isMicrocasco) tipo = 'cable_audio_doble';

      const connId = state.nextId++;
      state.connections.push({
        id: connId,
        de: state.pendingConnection,
        a: id,
        tipo: tipo,
        etiqueta: isMicrocasco ? 'Mic+Casco' : '',
        canales: []
      });
      setTool('select');
      setStatus(\`Conexión creada: \${srcName} → \${tgtName} (\${CABLE_TYPES[tipo].nombre})\`);
      autoSave();`);
    }

    return content;
}

paths.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    content = patch(content);
    fs.writeFileSync(p, content, 'utf8');
    console.log("Patched " + p);
});
