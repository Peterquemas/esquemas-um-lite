const fs = require('fs');

const tvPath = '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html';
const liteHtmlPath = '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html';
const litePwaPath = '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html';

function processContent(content) {
    // Replace el.w with (el.w || meta.w) and el.h with (el.h || meta.h) in renderElements
    content = content.replace(/el\.w/g, "(el.w || meta.w)");
    content = content.replace(/el\.h/g, "(el.h || meta.h)");
    // But wait, el.w and el.h might be used outside of renderElements where meta is not defined!
    return content;
}

const paths = [tvPath, liteHtmlPath, litePwaPath];
paths.forEach(p => {
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        
        // I will do targeted replacements in renderElements and truckPoint/edgePoint where needed.
        // Actually, the best place to fix this is in loadAutoSave and templates loading, or just a small migration step in renderElements.
        // Let's just do targeted replacement inside renderElements:
        // ` translate(${el.w}, 0) scale(-1, 1)`; -> ` translate(${el.w || meta.w}, 0) scale(-1, 1)`;
        content = content.replace(/translate\(\$\{el\.w\}, 0\)/g, "translate(${el.w || meta.w}, 0)");
        
        // Bounding box
        content = content.replace(/width', el\.w \+ 4/g, "width', (el.w || meta.w) + 4");
        content = content.replace(/height', el\.h \+ 4/g, "height', (el.h || meta.h) + 4");
        
        // wrapper transform
        content = content.replace(/scale\(\$\{el\.w\/vw\}, \$\{el\.h\/vh\}\)/g, "scale(${(el.w || meta.w)/vw}, ${(el.h || meta.h)/vh})");
        
        // label placement
        content = content.replace(/x', el\.x \+ el\.w\/2/g, "x', el.x + (el.w || meta.w)/2");
        content = content.replace(/y', el\.y \+ el\.h \+ 20/g, "y', el.y + (el.h || meta.h) + 20");
        content = content.replace(/y', el\.y \+ el\.h \+ 14/g, "y', el.y + (el.h || meta.h) + 14"); // fallback

        // truckPoint and edgePoint
        content = content.replace(/el\.w \* 0\.28/g, "(el.w || 420) * 0.28");
        content = content.replace(/el\.h \* 0\.55/g, "(el.h || 160) * 0.55");
        content = content.replace(/el\.w \* 0\.72/g, "(el.w || 420) * 0.72");
        
        // edgePoint needs generic fix, but let's just make sure renderElements is safe.
        // Actually, if we just patch state.elements when they are loaded or added, it's globally safe!
        // Let's add a state sanitization function.
        
        fs.writeFileSync(p, content, 'utf8');
        console.log("Processed " + p);
    }
});

