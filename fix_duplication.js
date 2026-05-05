const fs = require('fs');

const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

function patch(content) {
    // 1. Move canvas listeners to init() and remove from buildElementList
    if (content.includes("const canvas = document.getElementById('canvas-container');") && content.includes("function buildElementList()")) {
        
        // Extract the drop logic
        const dropLogicMatch = content.match(/canvas\.addEventListener\('drop', \(e\) => \{([\s\S]*?)\}\);/);
        const dropLogic = dropLogicMatch ? dropLogicMatch[0] : "";
        const dragOverLogic = "canvas.addEventListener('dragover', (e) => e.preventDefault());";

        // Remove from buildElementList
        content = content.replace(/const canvas = document\.getElementById\('canvas-container'\);[\s\S]*?\}\);/m, "");

        // Add to init()
        if (!content.includes("canvas.addEventListener('dragover'")) {
            content = content.replace(
                /document\.addEventListener\('keydown', handleKeyDown\);/,
                `document.addEventListener('keydown', handleKeyDown);\n\n  const canvas = document.getElementById('canvas-container');\n  ${dragOverLogic}\n  ${dropLogic}`
            );
        }
    }

    // 2. Clear list in buildElementList
    if (!content.includes("list.innerHTML = '';")) {
        content = content.replace(
            /const list = document\.getElementById\('element-list'\);/,
            "const list = document.getElementById('element-list');\n  list.innerHTML = '';"
        );
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
