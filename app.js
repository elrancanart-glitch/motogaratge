const km = 113839;
const screen = document.getElementById('screen');
const hudKm = document.getElementById('hudKm');
hudKm.textContent = km.toLocaleString('es-ES');
const menu = [...document.querySelectorAll('.menu-item')];

const tuningDefaults = {
  base:'#0b63c7', accent:'#ffffff', sticker:'SUZUKI',
  stickerColor:'#ffffff', combo:false, combo2:'#111111'
};
let tuning = JSON.parse(localStorage.getItem('motoGarageTuning') || 'null') || tuningDefaults;

const views = {
  garage: {title:'GARAGE', sub:'Centro de control de tu SV650S', html:`
    <div class="cards">
      <div class="card"><small>MOTO</small><strong>SUZUKI SV650S</strong></div>
      <div class="card"><small>AÑO</small><strong>2000</strong></div>
      <div class="card"><small>KILOMETRAJE</small><strong class="blue">${km.toLocaleString('es-ES')} km</strong></div>
      <div class="card"><small>ÚLTIMO SERVICIO</small><strong>26/09/2026</strong></div>
    </div>
    <div class="garage-photos">
      <div class="section-title"><span>📸</span><div><strong>FOTOS DE MANTENIMIENTO</strong><small>Guarda referencias, estado antes/después y detalles de tus piezas.</small></div></div>
      <div class="photo-form">
        <input id="photoInput" type="file" accept="image/*" multiple>
        <input id="photoTitle" type="text" placeholder="Ej. Bujías — referencia CR8E">
        <select id="photoCategory"><option>Bujías</option><option>Cadena</option><option>Frenos</option><option>Aceite / filtros</option><option>Neumáticos</option><option>Motor</option><option>Otros</option></select>
        <select id="photoState"><option>Antes</option><option>Después</option><option>Referencia</option><option>Estado</option></select>
        <textarea id="photoNote" placeholder="Nota: desgaste, medida, referencia, trabajo realizado..."></textarea>
        <button class="action" id="savePhotos">+ AÑADIR FOTOS</button>
      </div>
      <div id="photoGallery" class="photo-gallery"></div>
    </div>
    <button class="action" data-close>VOLVER</button>`},

  tuning: {title:'TUNING', sub:'Prueba colores, combinaciones y pegatinas antes de tocar la moto real.', html:`
    <div class="tuning-layout">
      <div class="bike-preview" id="bikePreview">
        <div class="bike-color-layer"></div>
        <div class="bike-combo-layer"></div>
        <div class="bike-sticker" id="bikeSticker">SUZUKI</div>
      </div>
      <div class="tuning-controls">
        <label>COLOR PRINCIPAL <input id="tuneColor" type="color"></label>
        <div class="swatches">
          <button data-color="#0b63c7" title="Azul Suzuki" style="--sw:#0b63c7"></button>
          <button data-color="#111111" title="Negro" style="--sw:#111111"></button>
          <button data-color="#f5f5f5" title="Blanco" style="--sw:#f5f5f5"></button>
          <button data-color="#c91622" title="Rojo" style="--sw:#c91622"></button>
          <button data-color="#e8c51a" title="Amarillo" style="--sw:#e8c51a"></button>
          <button data-color="#18844b" title="Verde" style="--sw:#18844b"></button>
        </div>
        <label class="check"><input id="comboToggle" type="checkbox"> COMBINAR CON SEGUNDO COLOR</label>
        <label>SEGUNDO COLOR <input id="tuneColor2" type="color"></label>
        <label>PEGATINA / TEXTO <input id="stickerText" type="text" maxlength="18" placeholder="SUZUKI / SV650S / RACING"></label>
        <label>COLOR PEGATINA <input id="stickerColor" type="color"></label>
        <button class="action" id="saveTuning">GUARDAR DISEÑO</button>
      </div>
    </div>
    <p class="tuning-note">💡 Es una previsualización: sirve para probar ideas de pintura, dos tonos y decoración. Más adelante podemos hacer zonas de carenado seleccionables.</p>
    <button class="action" data-close>VOLVER</button>`},

  custom: {title:'PERSONALIZACIÓN', sub:'Haz que tu Moto Garage sea tuyo', html:`<div class="cards"><div class="card"><small>TEMA</small><strong>Azul Suzuki</strong></div><div class="card"><small>INTERFAZ</small><strong>Racing nocturna</strong></div></div><button class="action" data-close>VOLVER</button>`},
  settings: {title:'AJUSTES', sub:'Configuración de Moto Garage', html:`<div class="cards"><div class="card"><small>UNIDADES</small><strong>km / °C / €</strong></div><div class="card"><small>ORIENTACIÓN</small><strong>Horizontal</strong></div><div class="card"><small>DATOS</small><strong>Guardado local</strong></div></div><button class="action" data-close>VOLVER</button>`},
  credits: {title:'CRÉDITOS', sub:'Moto Garage — primera base funcional', html:`<div class="card"><strong>Proyecto Moto Garage</strong><p>Construido paso a paso para convertirse en el garaje digital de tu moto.</p><p class="blue">V2.1 — Tuning + Fotos</p></div><button class="action" data-close>VOLVER</button>`}
};

function openView(name){
  if(name==='home'){screen.classList.remove('open'); return;}
  if(name==='exit'){toast('Salir: en la versión tablet esto cerrará/ocultará la interfaz.');return;}
  const v=views[name]; if(!v)return;
  screen.innerHTML=`<div class="panel"><button class="back" data-close>ESC</button><h2>${v.title}</h2><p class="sub">${v.sub}</p>${v.html}</div>`;
  screen.classList.add('open');
  screen.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{screen.classList.remove('open');setActive('home')}));
  if(name==='tuning') initTuning();
  if(name==='garage') initGarage();
}

function setActive(name){menu.forEach(b=>b.classList.toggle('active',b.dataset.screen===name));}
menu.forEach(btn=>btn.addEventListener('click',()=>{setActive(btn.dataset.screen);openView(btn.dataset.screen)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){screen.classList.remove('open');setActive('home')}if(e.key==='Enter'){const active=document.querySelector('.menu-item.active');active?.click()}});

function toast(msg){
  const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);
  setTimeout(()=>t.remove(),2300)
}

function initTuning(){
  const root=screen;
  const color=root.querySelector('#tuneColor'), color2=root.querySelector('#tuneColor2');
  const toggle=root.querySelector('#comboToggle'), sticker=root.querySelector('#stickerText');
  const stickerColor=root.querySelector('#stickerColor');
  color.value=tuning.base;color2.value=tuning.accent;toggle.checked=tuning.combo;
  sticker.value=tuning.sticker;stickerColor.value=tuning.stickerColor;
  const render=()=>{
    const preview=root.querySelector('#bikePreview');
    preview.style.setProperty('--bike-color',color.value);
    preview.style.setProperty('--bike-color2',color2.value);
    preview.style.setProperty('--sticker-color',stickerColor.value);
    preview.classList.toggle('two-tone',toggle.checked);
    root.querySelector('#bikeSticker').textContent=sticker.value || ' ';
  };
  root.querySelectorAll('.swatches button').forEach(b=>b.addEventListener('click',()=>{color.value=b.dataset.color;render()}));
  [color,color2,toggle,sticker,stickerColor].forEach(el=>el.addEventListener('input',render));
  root.querySelector('#saveTuning').addEventListener('click',()=>{
    tuning={base:color.value,accent:color2.value,combo:toggle.checked,sticker:sticker.value,stickerColor:stickerColor.value};
    localStorage.setItem('motoGarageTuning',JSON.stringify(tuning));
    toast('Diseño guardado en este dispositivo');
  });
  render();
}

function getPhotos(){return JSON.parse(localStorage.getItem('motoGaragePhotos') || '[]');}
function savePhotos(list){localStorage.setItem('motoGaragePhotos',JSON.stringify(list));}

function initGarage(){
  const gallery=screen.querySelector('#photoGallery');
  const render=()=>{
    const list=getPhotos();
    gallery.innerHTML=list.length ? list.map((p,i)=>`
      <article class="photo-card">
        <img src="${p.data}" alt="${escapeHtml(p.title)}">
        <div class="photo-info"><strong>${escapeHtml(p.title)}</strong><small>${escapeHtml(p.category)} · ${escapeHtml(p.state)}</small>${p.note?`<p>${escapeHtml(p.note)}</p>`:''}</div>
        <button class="photo-delete" data-del="${i}" aria-label="Eliminar foto">×</button>
      </article>`).join('') :
      '<div class="empty-photos">Todavía no hay fotos. Añade una de una bujía, cadena, referencia o cualquier trabajo que quieras conservar.</div>';
    gallery.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>{
      const l=getPhotos();l.splice(Number(b.dataset.del),1);savePhotos(l);render();
    }));
  };
  render();
  screen.querySelector('#savePhotos').addEventListener('click',async()=>{
    const input=screen.querySelector('#photoInput');
    if(!input.files.length){toast('Selecciona al menos una foto');return;}
    const title=screen.querySelector('#photoTitle').value.trim() || 'Foto de mantenimiento';
    const category=screen.querySelector('#photoCategory').value;
    const state=screen.querySelector('#photoState').value;
    const note=screen.querySelector('#photoNote').value.trim();
    const files=[...input.files];
    const existing=getPhotos();
    for(const file of files){
      const data=await fileToDataURL(file);
      existing.unshift({data,title,category,state,note,date:new Date().toISOString()});
    }
    savePhotos(existing.slice(0,80));
    input.value='';screen.querySelector('#photoTitle').value='';screen.querySelector('#photoNote').value='';
    render();toast(`${files.length} foto${files.length>1?'s':''} guardada${files.length>1?'s':''}`);
  });
}

function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);
  });
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
