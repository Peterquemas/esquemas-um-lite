const fs = require('fs');

const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

paths.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    
    if (!content.includes('+ Importar Equipo')) {
        content = content.replace(
            /<h3 style="margin-top:20px">Plantillas<\/h3>/,
            `<button class="btn" onclick="openImportModal()" style="width:100%; margin-top:10px; margin-bottom:10px; background:#e8f0fe; color:#1a3a8f; border:1px dashed #1a3a8f; font-weight:bold;">+ Importar Equipo</button>\n    <h3 style="margin-top:20px">Plantillas</h3>`
        );
        fs.writeFileSync(p, content, 'utf8');
        console.log("Injected into " + p);
    } else {
        console.log("Already present in " + p);
    }
});
