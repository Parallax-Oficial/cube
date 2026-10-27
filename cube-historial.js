(function () {
  const MAX = 50;

  const CLOCK = '<svg class="po-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>';
  const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';
  const EQUIS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';

  // ---------- Estilos ----------
  const css = document.createElement('style');
  css.textContent = `
    .po-lab { display: flex; align-items: center; }
    .perfil-opcion .po-ico { width: 20px; height: 20px; opacity: 1; margin-right: 12px; color: var(--verde); flex: 0 0 auto; }
    .h-limpiar { display: none; margin-top: 18px; color: #ff4d4d; font-size: .85rem; font-weight: 600; }
    body.en-historial .h-limpiar { display: block; }
    .h-cuando { position: absolute; bottom: 8px; left: 8px; z-index: 2; background: rgba(0,0,0,.65); color: #fff; font-size: .6rem; font-weight: 600; padding: 3px 8px; border-radius: 999px; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
    .h-x { position: absolute; top: 8px; right: 8px; z-index: 2; width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,.65); color: #fff; display: flex; align-items: center; justify-content: center; }
    .h-x svg { width: 14px; height: 14px; }
    .h-sin-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 12px; text-align: center; font-weight: 600; font-size: .9rem; }
  `;
  document.head.appendChild(css);

  // ---------- Datos ----------
  const clave = () => { const u = window.usuario && window.usuario(); return u ? 'cube_historial_' + u.email : null; };
  function leer() {
    const k = clave(); if (!k) return [];
    try { const a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function guardar(a) {
    const k = clave(); if (!k) return;
    try { localStorage.setItem(k, JSON.stringify(a.slice(0, MAX))); } catch (e) {}
  }
  function registrar(info) {
    if (!info || !info.id) return;
    const a = leer().filter(x => x.img !== info.id);
    a.unshift({ img: info.id, titulo: info.titulo || '', ts: Date.now() });
    guardar(a);
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

  // Se registra al tocar "Ver" (botón de reproducir) con la sesión iniciada
  let ultimo = null;
  document.addEventListener('click', e => {
    const el = e.target.closest('.portada, .hero');
    if (el && !e.target.closest('.tv-sheet')) { const i = infoDe(el); if (i) ultimo = i; }
    if (e.target.closest('[data-ac="play"]') && ultimo && window.usuario && window.usuario()) registrar(ultimo);
  }, true);

  // ---------- Vista ----------
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dia = ts => new Date(ts).setHours(0, 0, 0, 0);
  function cuando(ts) {
    const d = Math.round((dia(Date.now()) - dia(ts)) / 864e5);
    return d <= 0 ? 'Hoy' : d === 1 ? 'Ayer' : 'Hace ' + d + ' días';
  }

  const grilla = document.getElementById('listaGrilla');
  const vacia = document.getElementById('listaVacia');
  const limpiar = document.createElement('button');
  limpiar.className = 'h-limpiar';
  limpiar.textContent = 'Borrar historial';
  grilla.parentNode.insertBefore(limpiar, grilla);

  function pintar() {
    const a = leer();
    document.getElementById('listaTitulo').textContent = 'Historial';
    grilla.innerHTML = a.map(h => {
      const conImg = /\.[a-z0-9]+$/i.test(h.img);
      const cuerpo = conImg
        ? `<img src="${IMG_BASE}${esc(h.img)}" alt="${esc(h.titulo)}" loading="lazy">`
        : `<div class="h-sin-img">${esc(h.titulo)}</div>`;
      return `<div class="portada"><span class="h-cuando">${cuando(h.ts)}</span><button class="h-x" data-quitar="${esc(h.img)}" aria-label="Quitar del historial">${EQUIS}</button>${cuerpo}</div>`;
    }).join('');
    vacia.textContent = 'Tu historial está vacío.';
    vacia.hidden = a.length > 0;
    limpiar.hidden = a.length === 0;
  }

  function abrir() {
    pintar();
    const b = document.body;
    b.classList.remove('perfil-abierto', 'buscando', 'en-notif');
    b.classList.add('en-lista', 'en-historial');
    window.scrollTo(0, 0);
    setTimeout(() => window.dispatchEvent(new Event('scroll')), 60);
  }

  grilla.addEventListener('click', e => {
    const x = e.target.closest('[data-quitar]');
    if (!x) return;
    e.stopPropagation();
    guardar(leer().filter(h => h.img !== x.dataset.quitar));
    pintar();
  });

  limpiar.addEventListener('click', () => {
    if (confirm('¿Borrar todo tu historial?')) { guardar([]); pintar(); }
  });

  // ---------- Opción en el panel del perfil ----------
  const ref = document.getElementById('irNotificaciones');
  const opcion = document.createElement('button');
  opcion.className = 'perfil-opcion';
  opcion.id = 'irHistorial';
  opcion.innerHTML = `<span class="po-lab">${CLOCK}Historial</span>${CHEV}`;
  ref.parentNode.insertBefore(opcion, ref);
  opcion.addEventListener('click', abrir);

  // Si se abre Favoritos (u otra lista), el botón de borrar historial no debe aparecer
  document.getElementById('irFavoritos').addEventListener('click', () => document.body.classList.remove('en-historial'), true);
  new MutationObserver(() => {
    const c = document.body.classList;
    if (!c.contains('en-lista') && c.contains('en-historial')) c.remove('en-historial');
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
