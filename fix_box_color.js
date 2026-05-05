const fs = require('fs');

const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

paths.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    
    // Change selected stroke color from red to a darker gray
    content = content.replace(/isSelected \? '#cc0000' : '#666'/g, "isSelected ? '#333333' : '#888888'");
    
    // Change resize handle color from red to gray
    content = content.replace(/resizeH\.setAttribute\('fill', '#cc0000'\);/g, "resizeH.setAttribute('fill', '#666666');");

    fs.writeFileSync(p, content, 'utf8');
    console.log("Processed " + p);
});
