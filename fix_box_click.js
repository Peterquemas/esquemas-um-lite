const fs = require('fs');
const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

paths.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    
    // Add default box creation on single click
    content = content.replace(
        /if \(bw > 20 && bh > 20\) \{/,
        `if (bw <= 20 || bh <= 20) {\n      bx = x - 200; by = y - 150;\n      bw = 400; bh = 300;\n    }\n    if (bw > 0 && bh > 0) {`
    );
    
    // Make sure we change 'const bx = Math.min...' to 'let bx = Math.min...'
    content = content.replace(/const bx = Math\.min/, 'let bx = Math.min');
    content = content.replace(/const by = Math\.min/, 'let by = Math.min');
    content = content.replace(/const bw = Math\.abs/, 'let bw = Math.abs');
    content = content.replace(/const bh = Math\.abs/, 'let bh = Math.abs');

    fs.writeFileSync(p, content, 'utf8');
});
