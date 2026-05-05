const fs = require('fs');

const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

paths.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    
    const htmlEndIndex = content.lastIndexOf('</html>');
    if (htmlEndIndex === -1) return;
    
    let leakedCode = content.slice(htmlEndIndex + 7).trim();
    if (leakedCode) {
        console.log("Found leaked code in " + p + ": " + leakedCode.substring(0, 50) + "...");
        // Remove version comment if present in leaked code
        leakedCode = leakedCode.replace(/<!--.*?-->/g, '').trim();
        
        content = content.substring(0, htmlEndIndex + 7);
        // Find the last </script>
        const scriptEndIndex = content.lastIndexOf('</script>');
        if (scriptEndIndex !== -1) {
            content = content.substring(0, scriptEndIndex) + "\n" + leakedCode + "\n" + content.substring(scriptEndIndex);
        }
        fs.writeFileSync(p, content, 'utf8');
        console.log("Fixed structure of " + p);
    } else {
        console.log("No leak in " + p);
    }
});
