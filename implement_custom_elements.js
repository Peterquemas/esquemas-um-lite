const fs = require('fs');

const paths = [
    '/media/pedro/PROYECTOS/ESQUEMAS TVE SONIDO/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um.html',
    '/media/pedro/PROYECTOS/ESQUEMAS UM LITE/esquemas-um-lite/index.html'
];

function processContent(content) {
    // 1. Add Import Button to sidebar
    if (!content.includes('openImportModal()')) {
        content = content.replace(
            /<\/div>\s*<div class="sidebar-section">\s*<h3>PLANTILLAS<\/h3>/,
            `<button onclick="openImportModal()" style="width:100%; margin-top:10px; background:#f0f0f0; border:1px dashed #999; padding:8px; cursor:pointer; color:#333; font-size:11px;">+ Importar Equipo</button>\n      </div>\n      <div class="sidebar-section">\n        <h3>PLANTILLAS</h3>`
        );
    }

    // 2. Add Modal HTML to body
    if (!content.includes('id="modal-import"')) {
        content = content.replace(
            /<\/body>/,
            `  <div id="modal-import" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:white; padding:20px; border-radius:8px; box-shadow:0 0 20px rgba(0,0,0,0.5); z-index:1000; width:450px;">
    <h3>Importar Nuevo Equipo</h3>
    <div class="field" style="margin-bottom:10px;">
      <label>Nombre del Equipo</label>
      <input type="text" id="import-name" style="width:100%; padding:5px;">
    </div>
    <div class="field" style="margin-bottom:10px;">
      <label>Comportamiento de Conexión</label>
      <select id="import-conn" style="width:100%; padding:5px;">
        <option value="analog_box">Caja Analógica (Panel a Manguera)</option>
        <option value="analog_mic">Elemento Analógico (Micro a XLR)</option>
        <option value="digital">Equipo Digital (Red / Fibra)</option>
        <option value="both">Híbrido (Ambos tipos permitidos)</option>
        <option value="camera">Cámara (Triax)</option>
      </select>
    </div>
    <div class="field" style="margin-bottom:10px;">
      <label>Código SVG</label>
      <textarea id="import-svg" rows="6" style="width:100%; font-family:monospace; font-size:10px;" placeholder="Pega aquí todo el código <svg>..."></textarea>
    </div>
    <div style="display:flex; gap:10px; margin-top:15px;">
      <button onclick="saveImportedElement()" style="flex:1; background:#0066cc; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer;">Añadir a Librería</button>
      <button onclick="document.getElementById('modal-import').style.display='none'" style="flex:1; background:#ccc; border:none; padding:8px; border-radius:4px; cursor:pointer;">Cancelar</button>
    </div>
  </div>\n</body>`
        );
    }

    // 3. Update autoSave to save customLibrary and boxes
    content = content.replace(
        /notes: state\.notes,\n\s*boxes: state\.boxes,\n\s*nextId: state\.nextId/,
        `notes: state.notes,\n    boxes: state.boxes,\n    customLibrary: state.customLibrary,\n    nextId: state.nextId`
    );

    // 4. Update loadAutoSave to load customLibrary and refresh sidebar
    if (!content.includes('state.customLibrary = data.customLibrary || [];')) {
        content = content.replace(
            /state\.boxes = data\.boxes \|\| \[\];/,
            `state.boxes = data.boxes || [];\n    state.customLibrary = data.customLibrary || [];\n    buildElementList();`
        );
    }

    // 5. Update buildElementList to include customLibrary
    if (!content.includes('ELEMENTS_LIBRARY.concat(state.customLibrary || [])')) {
        content = content.replace(
            /ELEMENTS_LIBRARY\.forEach\(el => \{/,
            `const allLib = ELEMENTS_LIBRARY.concat(state.customLibrary || []);\n  allLib.forEach(el => {`
        );
    }
    
    // Fix dragging logic to use allLib instead of ELEMENTS_LIBRARY
    if (!content.includes('const allLib = ELEMENTS_LIBRARY.concat(state.customLibrary || []);')) {
        content = content.replace(
            /const meta = ELEMENTS_LIBRARY\.find\(x => x\.tipo === tipo\);/g,
            `const allLib = ELEMENTS_LIBRARY.concat(state.customLibrary || []);\n    const meta = allLib.find(x => x.tipo === tipo);`
        );
    }
    
    // Also in toggleMirror
    content = content.replace(
        /let meta = ELEMENTS_LIBRARY\.find\(x => x\.tipo === el\.tipo\);/g,
        `const allLib = ELEMENTS_LIBRARY.concat(state.customLibrary || []);\n    let meta = allLib.find(x => x.tipo === el.tipo);`
    );

    // 6. Update selectElement to use smart connection for custom elements
    // We will inject the logic right before the type evaluation
    if (!content.includes('const allLib = ELEMENTS_LIBRARY.concat(state.customLibrary || []);\n      const srcMeta = allLib.find(x => x.tipo === srcEl.tipo);')) {
        content = content.replace(
            /const isBox = srcEl\.tipo === 'caja_conexion' \|\| tgtEl\.tipo === 'caja_conexion' \|\| srcEl\.tipo === 'panel_analogico' \|\| tgtEl\.tipo === 'panel_analogico' \|\| srcEl\.tipo === 'patch_panel' \|\| tgtEl\.tipo === 'patch_panel';\n\s*const isIndividual = \['micro_mano', 'microcasco', 'unidad_pinganillo', 'iem_dual', 'intercom', 'monitor', 'mesa_sonido', 'telefono_movil', 'micro_inalambrico'\].includes\(srcEl\.tipo\) \|\| \n\s*\['micro_mano', 'microcasco', 'unidad_pinganillo', 'iem_dual', 'intercom', 'monitor', 'mesa_sonido', 'telefono_movil', 'micro_inalambrico'\].includes\(tgtEl\.tipo\);\n\n\s*if \(isCamera && isTruck\) tipo = 'cable_triax';\n\s*else if \(isHydra && isTruck\) tipo = 'cable_red';\n\s*else if \(isBox && isTruck\) tipo = 'manguera_8';\n\s*else if \(isIndividual && \(isBox \|\| isHydra\)\) tipo = 'cable_audio';\n\s*else if \(isIndividual && isTruck\) tipo = 'cable_audio';/,
            `const allLib = ELEMENTS_LIBRARY.concat(state.customLibrary || []);
      const srcMeta = allLib.find(x => x.tipo === srcEl.tipo);
      const tgtMeta = allLib.find(x => x.tipo === tgtEl.tipo);

      const customCam = (srcMeta && srcMeta.customConnType === 'camera') || (tgtMeta && tgtMeta.customConnType === 'camera');
      const customDig = (srcMeta && srcMeta.customConnType === 'digital') || (tgtMeta && tgtMeta.customConnType === 'digital');
      const customBoth = (srcMeta && srcMeta.customConnType === 'both') || (tgtMeta && tgtMeta.customConnType === 'both');
      const customAnaBox = (srcMeta && srcMeta.customConnType === 'analog_box') || (tgtMeta && tgtMeta.customConnType === 'analog_box');
      const customAnaMic = (srcMeta && srcMeta.customConnType === 'analog_mic') || (tgtMeta && tgtMeta.customConnType === 'analog_mic');

      const isBox = srcEl.tipo === 'caja_conexion' || tgtEl.tipo === 'caja_conexion' || srcEl.tipo === 'panel_analogico' || tgtEl.tipo === 'panel_analogico' || srcEl.tipo === 'patch_panel' || tgtEl.tipo === 'patch_panel' || customAnaBox;
      const isIndividual = ['micro_mano', 'microcasco', 'unidad_pinganillo', 'iem_dual', 'intercom', 'monitor', 'mesa_sonido', 'telefono_movil', 'micro_inalambrico'].includes(srcEl.tipo) || 
                           ['micro_mano', 'microcasco', 'unidad_pinganillo', 'iem_dual', 'intercom', 'monitor', 'mesa_sonido', 'telefono_movil', 'micro_inalambrico'].includes(tgtEl.tipo) || customAnaMic;

      if ((isCamera || customCam) && isTruck) tipo = 'cable_triax';
      else if (isCamera || customCam) tipo = 'cable_triax'; // Failsafe
      else if (isIndividual && (isBox || isHydra || customDig || customBoth || isTruck)) tipo = 'cable_audio'; // Individual always gets XLR to anything
      else if ((isHydra || customDig || customBoth) && isTruck) tipo = 'cable_red';
      else if (isBox && isTruck) tipo = 'manguera_8';
      else if (customDig && customDig) tipo = 'cable_red';
      else if (customDig && customBoth) tipo = 'cable_red';
      else if (customBoth && customBoth) tipo = 'cable_red';
      else if (customAnaBox && customAnaBox) tipo = 'manguera_8';`
        );
    }

    // 7. Inject JS functions at the bottom
    if (!content.includes('function openImportModal()')) {
        content = content.replace(
            /<\/script>/,
            `\nfunction openImportModal() {
  document.getElementById('import-name').value = '';
  document.getElementById('import-svg').value = '';
  document.getElementById('modal-import').style.display = 'block';
}

function saveImportedElement() {
  const name = document.getElementById('import-name').value.trim();
  const conn = document.getElementById('import-conn').value;
  let svgCode = document.getElementById('import-svg').value.trim();
  
  if (!name || !svgCode) {
    alert('Por favor, indica un nombre y pega el código SVG.');
    return;
  }
  
  let w = 100, h = 100;
  const vbMatch = svgCode.match(/viewBox=["'][\\d\\s\\.]+ (\\d+(?:\\.\\d+)?) (\\d+(?:\\.\\d+)?)["']/);
  if (vbMatch) {
    w = parseFloat(vbMatch[1]);
    h = parseFloat(vbMatch[2]);
  } else {
    const wMatch = svgCode.match(/width=["'](\\d+(?:\\.\\d+)?)["']/);
    const hMatch = svgCode.match(/height=["'](\\d+(?:\\.\\d+)?)["']/);
    if (wMatch) w = parseFloat(wMatch[1]);
    if (hMatch) h = parseFloat(hMatch[1]);
  }
  
  // Clean text tags to avoid duplication
  svgCode = svgCode.replace(/<text[\\s\\S]*?<\\/text>/gi, '');
  
  const id = 'custom_' + Date.now();
  state.customLibrary = state.customLibrary || [];
  state.customLibrary.push({
    tipo: id,
    nombre: name,
    w: w,
    h: h,
    svg: svgCode,
    customConnType: conn
  });
  
  autoSave();
  buildElementList(); // Refresh sidebar
  document.getElementById('modal-import').style.display = 'none';
}\n</script>`
        );
    }

    return content;
}

paths.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    content = processContent(content);
    fs.writeFileSync(p, content, 'utf8');
    console.log("Processed " + p);
});
