const fs = require('fs');

const buildElementListCode = `
function buildElementList() {
  const list = document.getElementById('element-list');
  if (!list) return;
  list.innerHTML = '';
  
  const allLib = ELEMENTS_LIBRARY.concat(state.customLibrary || []);
  allLib.forEach(el => {
    const div = document.createElement('div');
    div.className = 'element-item';
    div.draggable = true;
    div.dataset.tipo = el.tipo;
    div.innerHTML = \`
      <div class="preview">\${el.svg}</div>
      <div class="name">\${el.nombre}</div>
    \`;
    div.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', el.tipo);
    });
    list.appendChild(div);
  });
}`;

const initFixCode = `
let eventsInitialized = false;

function init() {
  buildElementList();
  if (typeof setupTextInput === 'function') setupTextInput();
  if (typeof drawGrid === 'function') drawGrid();
  if (typeof updateApiStatus === 'function') updateApiStatus();
  if (typeof loadAutoSave === 'function') {
    if (!loadAutoSave()) {
      if (typeof loadTemplate === 'function') loadTemplate('vacio');
    }
  }

  if (!eventsInitialized) {
    const canvas = document.getElementById('canvas');
    const container = document.getElementById('canvas-container');
    if (!canvas || !container) return;

    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    document.addEventListener('keydown', handleKeyDown);

    container.addEventListener('dragover', (e) => e.preventDefault());
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      const tipo = e.dataTransfer.getData('text/plain');
      if (!tipo) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / state.zoom - 50;
      const y = (e.clientY - rect.top) / state.zoom - 50;
      
      pushHistory();
      if (typeof addElement === 'function') addElement(tipo, x, y);
    });
    
    eventsInitialized = true;
  }
}`;

const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

paths.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    // Restore buildElementList if missing or broken
    if (!content.includes('function buildElementList')) {
        content = content.replace('function drawGrid', buildElementListCode + '\n\nfunction drawGrid');
    } else {
        // Replace existing buildElementList to ensure correctness
        content = content.replace(/function buildElementList\(\) \{[\s\S]*?\n\}/, buildElementListCode);
    }

    // Replace init()
    if (content.includes('function init()')) {
        content = content.replace(/function init\(\) \{[\s\S]*?\n\}/, initFixCode);
    } else if (p.includes('index.html')) {
        // For index.html, maybe it's called differently. Let's see.
        // Actually index.html didn't have init(). I'll add it before the end of script.
        const scriptEnd = content.lastIndexOf('</script>');
        content = content.substring(0, scriptEnd) + initFixCode + "\ninit();\n" + content.substring(scriptEnd);
    }

    // Ensure state has customLibrary
    if (!content.includes('customLibrary: []')) {
        content = content.replace('boxes: [],', 'boxes: [],\n  customLibrary: [],');
    }

    fs.writeFileSync(p, content, 'utf8');
    console.log("Restored " + p);
});
