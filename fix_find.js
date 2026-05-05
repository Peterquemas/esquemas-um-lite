const fs = require('fs');

const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

paths.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace in addElement
    content = content.replace(
        /const meta = ELEMENTS_LIBRARY\.find\(e => e\.tipo === tipo\);/g,
        `const allLib = ELEMENTS_LIBRARY.concat(state.customLibrary || []);\n  const meta = allLib.find(e => e.tipo === tipo);`
    );

    // Replace in renderElements
    content = content.replace(
        /const meta = ELEMENTS_LIBRARY\.find\(m => m\.tipo === el\.tipo\);/g,
        `const allLib = ELEMENTS_LIBRARY.concat(state.customLibrary || []);\n    const meta = allLib.find(m => m.tipo === el.tipo);`
    );

    fs.writeFileSync(p, content, 'utf8');
    console.log("Fixed " + p);
});
