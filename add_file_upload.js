const fs = require('fs');

const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

paths.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    
    // 1. Modify the HTML modal to include file input
    if (!content.includes('id="import-file"')) {
        content = content.replace(
            /<label>Código SVG<\/label>\s*<textarea id="import-svg"/,
            `<label>Código SVG (Pégalo o carga un archivo)</label>\n      <input type="file" id="import-file" accept=".svg" onchange="handleSvgUpload(event)" style="margin-bottom:5px; width:100%;">\n      <textarea id="import-svg"`
        );
    }

    // 2. Add the JS handler
    if (!content.includes('function handleSvgUpload')) {
        content = content.replace(
            /function openImportModal\(\) \{/,
            `function handleSvgUpload(e) {\n  const file = e.target.files[0];\n  if (!file) return;\n  const reader = new FileReader();\n  reader.onload = function(evt) {\n    document.getElementById('import-svg').value = evt.target.result;\n    if (!document.getElementById('import-name').value) {\n      let name = file.name.replace(/\\.svg$/i, '').replace(/[_-]/g, ' ');\n      name = name.charAt(0).toUpperCase() + name.slice(1);\n      document.getElementById('import-name').value = name;\n    }\n  };\n  reader.readAsText(file);\n}\n\nfunction openImportModal() {`
        );
    }
    
    // Clear the file input when modal is opened
    content = content.replace(
        /document\.getElementById\('import-svg'\)\.value = '';/,
        `document.getElementById('import-svg').value = '';\n  const fileInput = document.getElementById('import-file');\n  if(fileInput) fileInput.value = '';`
    );

    fs.writeFileSync(p, content, 'utf8');
    console.log("Processed " + p);
});
