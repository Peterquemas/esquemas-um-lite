const fs = require('fs');

const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

paths.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    // Replace the connection creation in selectElement
    if (!content.includes('const isMicrocasco = srcEl.tipo === \\'microcasco\\' || tgtEl.tipo === \\'microcasco\\';')) {
        content = content.replace(
            /const connId = state\.nextId\+\+;\n\s*state\.connections\.push\(\{\n\s*id: connId,\n\s*de: state\.pendingConnection,\n\s*a: id,\n\s*tipo: tipo,\n\s*etiqueta: '',\n\s*canales: \[\]\n\s*\}\);/,
            `const isMicrocasco = srcEl.tipo === 'microcasco' || tgtEl.tipo === 'microcasco';
      const connId = state.nextId++;
      state.connections.push({
        id: connId,
        de: state.pendingConnection,
        a: id,
        tipo: tipo,
        etiqueta: isMicrocasco ? 'Micrófono' : '',
        canales: []
      });
      if (isMicrocasco) {
        state.connections.push({
          id: state.nextId++,
          de: state.pendingConnection,
          a: id,
          tipo: tipo,
          etiqueta: 'Cascos',
          canales: []
        });
      }`
        );
        fs.writeFileSync(p, content, 'utf8');
        console.log("Patched " + p);
    } else {
        console.log("Already patched " + p);
    }
});
