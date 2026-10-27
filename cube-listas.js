(function () {
  const MAX_LISTAS = 30, MAX_NOMBRE = 30;
  const body = document.body;

  // ---------- Iconos ----------
  const ICO_LISTA = '<svg class="po-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/></svg>';
  const ICO_AGREGAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="14" y2="6"/><line x1="4" y1="11" x2="14" y2="11"/><line x1="4" y1="16" x2="10" y2="16"/><line x1="17" y1="13" x2="17" y2="21"/><line x1="13" y1="17" x2="21" y2="17"/></svg>';
  const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';
  const EQUIS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12 10 17 19 7"/></svg>';
  const MAS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';

  // ---------- Estilos ----------
  const css = document.createElement('style');
  css.textContent = `
    .po-lab { display: flex; align-items: center; }
    .perfil-opcion .po-ico { width: 20px; height: 20px; opacity: 1; margin-right: 12px; color: var(--verde); flex: 0 0 auto; }

    .lst-nuevo { display: none; align-items: center; gap: 8px; height: 44px; padding: 0 20px 0 16px; margin-top: 18px; border-radius: 999px; background: var(--verde); color: #000; font-weight: 700; font-size: .9rem; }
    .lst-nuevo svg { width: 18px; height: 18px; }
    body.en-listas .lst-nuevo { display: inline-flex; }
    .lst-acciones { display: none; gap: 22px; margin-top: 18px; }
    body.en-lista-det .lst-acciones { display: flex; }
    .lst-acciones button { font-size: .85rem; font-weight: 600; color: var(--verde); }
    .lst-acciones .peligro { color: #ff4d4d; }

    .lst-row { grid-column: 1 / -1; display: flex; align-items: center; gap: 14px; width: 100%; padding: 12px 14px; background: var(--placeholder); border: 1px solid var(--borde); border-radius: var(--radio); text-align: left; }
    .lst-thumb { flex: 0 0 72px; aspect-ratio: 16 / 9; border-radius: 10px; background: #000; overflow: hidden; }
    .lst-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .lst-row-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .lst-row-t b { font-size: .98rem; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .lst-row-t small { font-size: .78rem; color: var(--texto-suave); }
    .lst-row > svg { flex: 0 0 auto; width: 16px; height: 16px; opacity: .5; }

    .lst-q { position: absolute; top: 8px; right: 8px; z-index: 2; width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,.65); color: #fff; display: flex; align-items: center; justify-content: center; }
    .lst-q svg { width: 14px; height: 14px; }
    .lst-sin-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 12px; text-align: center; font-weight: 600; font-size: .9rem; }

    .ac-fav.ac-lst svg { width: 22px; height: 22px; }
    .lst-pill { display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px; margin-top: 10px; border-radius: 999px; border: 2px solid #333; color: #fff; font-weight: 700; font-size: .9rem; }
    .lst-pill svg { width: 20px; height: 20px; }

    .lst-ov { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,.65); opacity: 0; visibility: hidden; transition: opacity .25s ease, visibility .25s; }
    .lst-ov.on { opacity: 1; visibility: visible; }
    .lst-box { position: fixed; left: 50%; bottom: 0; z-index: 310; width: min(100%, 460px); max-height: 75vh; overflow-y: auto; padding: 18px 20px calc(20px + env(safe-area-inset-bottom, 0px)); background: #0a0a0a; border: 2px solid var(--borde); border-bottom: none; border-radius: 20px 20px 0 0; transform: translate(-50%, 100%); visibility: hidden; transition: transform .3s cubic-bezier(.22,.8,.3,1), visibility .3s; }
    .lst-box.on { transform: translate(-50%, 0); visibility: visible; }
    .lst-h { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
    .lst-h b { font-size: 1.05rem; }
    .lst-x { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--texto-suave); }
    .lst-x svg { width: 18px; height: 18px; }
    .lst-sub { color: var(--texto-suave); font-size: .85rem; margin-bottom: 14px; }
    .lst-filas { display: flex; flex-direction: column; gap: 8px; }
    .lst-fila { display: flex; align-items: center; gap: 12px; width: 100%; padding: 13px 14px; background: var(--placeholder); border: 1px solid var(--borde); border-radius: 12px; font-weight: 600; font-size: .92rem; text-align: left; }
    .lst-fila span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .lst-fila small { color: var(--texto-suave); font-weight: 500; }
    .lst-fila svg { width: 18px; height: 18px; color: var(--verde); opacity: 0; }
    .lst-fila.on { border-color: var(--verde); }
    .lst-fila.on svg { opacity: 1; }
    .lst-vacio { color: var(--texto-suave); font-size: .88rem; padding: 6px 0; }
    .lst-nueva { display: flex; gap: 8px; margin-top: 14px; }
    .lst-nueva input { flex: 1; min-width: 0; height: 44px; padding: 0 14px; background: var(--placeholder); border: 1px solid var(--borde); border-radius: 12px; color: #fff; font-family: inherit; font-size: 16px; outline: none; }
    .lst-nueva input:focus { border-color: #3a3a3a; }
    .lst-ok { height: 44px; padding: 0 18px; border-radius: 12px; background: var(--verde); color: #000; font-weight: 700; }
    .lst-msg { display: block; min-height: 18px; margin-top: 10px; color: var(--texto-suave); font-size: .78rem; }
  `;
  document.head.appendChild(css);

  // ---------- Datos ----------
  const clave = () => { const u = window.usuario && window.usuario(); return u ? 'cube_listas_' + u.email : null; };
  function leer() {
    const k = clave(); if (!k) return [];
    try { const a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function guardar(a) {
    const k = clave(); if (!k) return;
    try { localStorage.setItem(k, JSON.stringify(a)); } catch (e) {}
  }
  const nuevoId = () => 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const conExt = s => /\.[a-z0-9]+$/i.test(s);

  function crear(nombre) {
    nombre = nombre.trim().slice(0, MAX_NOMBRE);
    if (!nombre) return { error: 'Escribe un nombre para la lista.' };
    const ls = leer();
    if (ls.length >= MAX_LISTAS) return { error: 'Llegaste al máximo de ' + MAX_LISTAS + ' listas.' };
    if (ls.some(x => x.nombre.toLowerCase() === nombre.toLowerCase())) return { error: 'Ya tienes una lista con ese nombre.' };
    const l = { id: nuevoId(), nombre, items: [], ts: Date.now() };
    ls.push(l); guardar(ls);
    return { lista: l };
  }
  function renombrar(id, nombre) {
    nombre = nombre.trim().slice(0, MAX_NOMBRE);
    if (!nombre) return 'Escribe un nombre para la lista.';
    const ls = leer(), l = ls.find(x => x.id === id);
    if (!l) return 'No se encontró la lista.';
    if (ls.some(x => x.id !== id && x.nombre.toLowerCase() === nombre.toLowerCase())) return 'Ya tienes una lista con ese nombre.';
    l.nombre = nombre; guardar(ls);
    return null;
  }
  function alternar(idLista, info) {
    const ls = leer(), l = ls.find(x => x.id === idLista);
    if (!l) return null;
    const i = l.items.findIndex(x => x.img === info.id);
    let agregado;
    if (i >= 0) { l.items.splice(i, 1); agregado = false; }
    else { l.items.unshift({ img: info.id, titulo: info.titulo || '', ts: Date.now() }); agregado = true; }
    guardar(ls);
    return { l, agregado };
  }

  // Misma lógica que usa cube.html para identificar la historia tocada
  function infoDe(el) {
    if (el.classList.contains('hero')) {
      const t = el.dataset.titulo || '';
      return { id: el.dataset.cover || t, titulo: t };
    }
    const img = el.querySelector('img');
    if (!img) return null;
    return { id: decodeURIComponent((img.getAttribute('src') || '').split('?')[0].split('/').pop()), titulo: img.alt };
  }

  // ---------- Ventana inferior (selector de listas / nombre) ----------
  const ov = document.createElement('div'); ov.className = 'lst-ov';
  const box = document.createElement('div'); box.className = 'lst-box';
  document.body.append(ov, box);
  let onOk = null, pickInfo = null;

  function abrirVentana(html) { box.innerHTML = html; ov.classList.add('on'); box.classList.add('on'); }
  function cerrarVentana() { ov.classList.remove('on'); box.classList.remove('on'); onOk = null; }
  const mensaje = t => { const m = box.querySelector('.lst-msg'); if (m) m.textContent = t; };
  ov.addEventListener('click', cerrarVentana);

  function pintarSelector(msg) {
    const ls = leer(), id = pickInfo.id;
    const filas = ls.map(l => {
      const on = l.items.some(x => x.img === id);
      return `<button class="lst-fila${on ? ' on' : ''}" data-t="${l.id}"><span>${esc(l.nombre)}</span><small>${l.items.length}</small>${CHECK}</button>`;
    }).join('');
    abrirVentana(`<div class="lst-h"><b>Agregar a una lista</b><button class="lst-x" data-x aria-label="Cerrar">${EQUIS}</button></div>
      <p class="lst-sub">${esc(pickInfo.titulo)}</p>
      <div class="lst-filas">${filas || '<p class="lst-vacio">Aún no tienes listas. Crea la primera.</p>'}</div>
      <div class="lst-nueva"><input id="lstInput" maxlength="${MAX_NOMBRE}" placeholder="Nombre de la nueva lista" autocomplete="off"><button class="lst-ok" data-crear>Crear</button></div>
      <small class="lst-msg">${msg || ''}</small>`);
  }

  function pedirNombre(titulo, valor, boton, cb) {
    onOk = cb;
    abrirVentana(`<div class="lst-h"><b>${titulo}</b><button class="lst-x" data-x aria-label="Cerrar">${EQUIS}</button></div>
      <div class="lst-nueva"><input id="lstInput" maxlength="${MAX_NOMBRE}" value="${esc(valor)}" placeholder="Nombre de la lista" autocomplete="off"><button class="lst-ok" data-ok>${boton}</button></div>
      <small class="lst-msg"></small>`);
    setTimeout(() => { const i = box.querySelector('#lstInput'); if (i) i.focus(); }, 60);
  }

  box.addEventListener('click', e => {
    if (e.target.closest('[data-x]')) { cerrarVentana(); return; }
    const t = e.target.closest('[data-t]');
    if (t) {
      const r = alternar(t.dataset.t, pickInfo);
      if (r) { pintarSelector(r.agregado ? 'Agregada a "' + r.l.nombre + '".' : 'Quitada de "' + r.l.nombre + '".'); refrescar(); }
      return;
    }
    if (e.target.closest('[data-crear]')) {
      const r = crear(box.querySelector('#lstInput').value);
      if (r.error) { mensaje(r.error); return; }
      alternar(r.lista.id, pickInfo);
      pintarSelector('Lista "' + r.lista.nombre + '" creada y historia agregada.');
      refrescar();
      return;
    }
    if (e.target.closest('[data-ok]')) {
      const err = onOk && onOk(box.querySelector('#lstInput').value);
      if (err) mensaje(err); else cerrarVentana();
    }
  });
  box.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'lstInput') {
      const b = box.querySelector('[data-crear],[data-ok]'); if (b) b.click();
    }
  });

  // ---------- Botón "agregar a lista" dentro del menú de cada portada ----------
  function inyectar(sh) {
    if (sh.querySelector('[data-lista-add]')) return;
    const fila = sh.querySelector('.ac-botones');
    if (fila) {
      fila.insertAdjacentHTML('beforeend', `<button class="ac-fav ac-lst" data-lista-add aria-label="Agregar a una lista">${ICO_AGREGAR}</button>`);
      return;
    }
    const campana = sh.querySelector('[data-ac="bell"]');
    if (campana) campana.insertAdjacentHTML('afterend', `<button class="lst-pill" data-lista-add>${ICO_AGREGAR}Agregar a una lista</button>`);
  }
  document.querySelectorAll('.tv-sheet').forEach(sh => {
    new MutationObserver(() => inyectar(sh)).observe(sh, { childList: true });
  });

  let ultimo = null;
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-lista-add]');
    if (add) {
      e.stopPropagation(); e.preventDefault();
      if (!window.usuario || !window.usuario()) { if (window.abrirModal) window.abrirModal('auth'); return; }
      if (!ultimo) return;
      pickInfo = ultimo;
      pintarSelector();
      return;
    }
    const el = e.target.closest('.portada, .hero');
    if (el && !e.target.closest('.tv-sheet')) { const i = infoDe(el); if (i) ultimo = i; }
  }, true);

  // ---------- Pantallas (reutilizan la sección #lista de cube.html) ----------
  const titulo = document.getElementById('listaTitulo');
  const grilla = document.getElementById('listaGrilla');
  const vacia = document.getElementById('listaVacia');
  let actual = null;

  const btnNuevo = document.createElement('button');
  btnNuevo.className = 'lst-nuevo';
  btnNuevo.innerHTML = MAS + 'Nueva lista';
  const acciones = document.createElement('div');
  acciones.className = 'lst-acciones';
  acciones.innerHTML = '<button data-ren>Renombrar lista</button><button data-del class="peligro">Eliminar lista</button>';
  grilla.parentNode.insertBefore(btnNuevo, grilla);
  grilla.parentNode.insertBefore(acciones, grilla);

  function setModo(m) {
    const c = body.classList;
    c.add('en-lista');
    c.remove('en-historial', 'en-listas', 'en-lista-det');
    c.add(m === 'det' ? 'en-lista-det' : 'en-listas');
  }

  function pintarIndice() {
    const ls = leer();
    titulo.textContent = 'Mis listas';
    grilla.innerHTML = ls.map(l => {
      const n = l.items.length, primera = l.items.find(x => conExt(x.img));
      const mini = primera ? `<img src="${IMG_BASE}${esc(primera.img)}" alt="" loading="lazy">` : '';
      return `<button class="lst-row" data-abrir="${l.id}"><span class="lst-thumb">${mini}</span><span class="lst-row-t"><b>${esc(l.nombre)}</b><small>${n} ${n === 1 ? 'historia' : 'historias'}</small></span>${CHEV}</button>`;
    }).join('');
    vacia.textContent = 'Todavía no creaste ninguna lista.';
    vacia.hidden = ls.length > 0;
    actual = null;
    setModo('indice');
  }

  function pintarDetalle(id) {
    const l = leer().find(x => x.id === id);
    if (!l) { pintarIndice(); return; }
    actual = id;
    titulo.textContent = l.nombre;
    grilla.innerHTML = l.items.map(h => {
      const cuerpo = conExt(h.img)
        ? `<img src="${IMG_BASE}${esc(h.img)}" alt="${esc(h.titulo)}" loading="lazy">`
        : `<div class="lst-sin-img">${esc(h.titulo)}</div>`;
      return `<div class="portada"><button class="lst-q" data-lq="${esc(h.img)}" aria-label="Quitar de la lista">${EQUIS}</button>${cuerpo}</div>`;
    }).join('');
    vacia.textContent = 'Esta lista está vacía. Agrega historias desde el menú de cada portada.';
    vacia.hidden = l.items.length > 0;
    setModo('det');
  }

  function refrescar() {
    if (body.classList.contains('en-lista-det')) pintarDetalle(actual);
    else if (body.classList.contains('en-listas')) pintarIndice();
  }

  function abrirIndice() {
    pintarIndice();
    body.classList.remove('perfil-abierto', 'buscando', 'en-notif');
    window.scrollTo(0, 0);
    setTimeout(() => window.dispatchEvent(new Event('scroll')), 60);
  }

  grilla.addEventListener('click', e => {
    const q = e.target.closest('[data-lq]');
    if (q) {
      e.stopPropagation();
      const ls = leer(), l = ls.find(x => x.id === actual);
      if (l) { l.items = l.items.filter(x => x.img !== q.dataset.lq); guardar(ls); pintarDetalle(actual); }
      return;
    }
    const a = e.target.closest('[data-abrir]');
    if (a) { pintarDetalle(a.dataset.abrir); window.scrollTo(0, 0); }
  });

  btnNuevo.addEventListener('click', () => {
    pedirNombre('Nueva lista', '', 'Crear', v => {
      const r = crear(v);
      if (r.error) return r.error;
      pintarIndice();
      return null;
    });
  });

  acciones.addEventListener('click', e => {
    const l = leer().find(x => x.id === actual);
    if (!l) return;
    if (e.target.closest('[data-ren]')) {
      pedirNombre('Renombrar lista', l.nombre, 'Guardar', v => {
        const err = renombrar(actual, v);
        if (!err) pintarDetalle(actual);
        return err;
      });
    } else if (e.target.closest('[data-del]')) {
      if (confirm('¿Eliminar la lista "' + l.nombre + '"?')) {
        guardar(leer().filter(x => x.id !== actual));
        pintarIndice();
      }
    }
  });

  // Flecha "volver": desde una lista abierta vuelve al listado; desde el listado, al inicio
  const volver = document.getElementById('cerrarLista');
  const volverOriginal = volver.onclick;
  volver.onclick = function (e) {
    if (body.classList.contains('en-lista-det')) { pintarIndice(); window.scrollTo(0, 0); return; }
    if (volverOriginal) return volverOriginal.call(this, e);
  };

  // ---------- Opción en el panel del perfil ----------
  const ref = document.getElementById('irNotificaciones');
  const opcion = document.createElement('button');
  opcion.className = 'perfil-opcion';
  opcion.id = 'irListas';
  opcion.innerHTML = `<span class="po-lab">${ICO_LISTA}Listas</span>${CHEV}`;
  ref.parentNode.insertBefore(opcion, ref);
  opcion.addEventListener('click', abrirIndice);

  // Limpieza de estados al cambiar de pantalla
  document.addEventListener('click', e => {
    if (e.target.closest('#irFavoritos, #irHistorial, #irNotificaciones')) body.classList.remove('en-listas', 'en-lista-det');
  }, true);
  new MutationObserver(() => {
    const c = body.classList;
    if (!c.contains('en-lista') && (c.contains('en-listas') || c.contains('en-lista-det'))) c.remove('en-listas', 'en-lista-det');
  }).observe(body, { attributes: true, attributeFilter: ['class'] });
})();
