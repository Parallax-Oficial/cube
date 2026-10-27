(function () {
  if (!window.supabase || !window.CUBE_SUPABASE_URL || !window.CUBE_SUPABASE_ANON_KEY) return;
  const db = window.supabase.createClient(window.CUBE_SUPABASE_URL, window.CUBE_SUPABASE_ANON_KEY);

  const DIAS = 30;
  const FORMATO = /^[A-Za-z0-9_.]{3,20}$/;
  const MSG_FORMATO = 'Usa de 3 a 20 caracteres: letras, números, _ y .';

  const ICO_EDITAR = '<svg class="po-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';
  const EQUIS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';

  // ---------- Estilos ----------
  const css = document.createElement('style');
  css.textContent = `
    .po-lab { display: flex; align-items: center; }
    .perfil-opcion .po-ico { width: 20px; height: 20px; opacity: 1; margin-right: 12px; color: var(--verde); flex: 0 0 auto; }
    .usr-ov { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,.65); opacity: 0; visibility: hidden; transition: opacity .25s ease, visibility .25s; }
    .usr-ov.on { opacity: 1; visibility: visible; }
    .usr-box { position: fixed; left: 50%; bottom: 0; z-index: 310; width: min(100%, 460px); padding: 18px 20px calc(20px + env(safe-area-inset-bottom, 0px)); background: #0a0a0a; border: 2px solid var(--borde); border-bottom: none; border-radius: 20px 20px 0 0; transform: translate(-50%, 100%); visibility: hidden; transition: transform .3s cubic-bezier(.22,.8,.3,1), visibility .3s; }
    .usr-box.on { transform: translate(-50%, 0); visibility: visible; }
    .usr-h { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
    .usr-h b { font-size: 1.05rem; }
    .usr-x { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--texto-suave); }
    .usr-x svg { width: 18px; height: 18px; }
    .usr-sub { color: var(--texto-suave); font-size: .85rem; margin-bottom: 14px; }
    .usr-sub b { color: #fff; }
    .usr-fila { display: flex; gap: 8px; }
    .usr-fila input { flex: 1; min-width: 0; height: 44px; padding: 0 14px; background: var(--placeholder); border: 1px solid var(--borde); border-radius: 12px; color: #fff; font-family: inherit; font-size: 16px; outline: none; }
    .usr-fila input:focus { border-color: #3a3a3a; }
    .usr-fila input:disabled { opacity: .5; }
    .usr-ok { height: 44px; padding: 0 18px; border-radius: 12px; background: var(--verde); color: #000; font-weight: 700; }
    .usr-ok:disabled { opacity: .5; cursor: default; }
    .usr-nota { margin-top: 12px; color: #777; font-size: .75rem; line-height: 1.6; }
    .usr-msg { display: block; min-height: 18px; margin-top: 8px; font-size: .8rem; color: var(--texto-suave); }
    .usr-msg.error { color: #ff7777; }
  `;
  document.head.appendChild(css);

  // ---------- Ventana inferior ----------
  const ov = document.createElement('div'); ov.className = 'usr-ov';
  const box = document.createElement('div'); box.className = 'usr-box';
  document.body.append(ov, box);

  const cerrar = () => { ov.classList.remove('on'); box.classList.remove('on'); };
  ov.addEventListener('click', cerrar);

  const input = () => box.querySelector('#usrInput');
  const boton = () => box.querySelector('.usr-ok');
  function mensaje(t, error) {
    const m = box.querySelector('.usr-msg');
    if (!m) return;
    m.textContent = t || '';
    m.className = 'usr-msg' + (error ? ' error' : '');
  }

  function fechaLarga(d) {
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  }

  // Devuelve la fecha desde la que se puede volver a cambiar, o null si ya se puede
  async function bloqueoHasta(u) {
    try {
      const { data } = await db.from('profiles').select('username_changed_at').eq('id', u.id).maybeSingle();
      if (!data || !data.username_changed_at) return null;
      const hasta = new Date(Date.parse(data.username_changed_at) + DIAS * 864e5);
      return hasta > new Date() ? hasta : null;
    } catch (e) { return null; }
  }

  async function abrir() {
    const u = window.usuario && window.usuario();
    if (!u) { if (window.abrirModal) window.abrirModal('auth'); return; }
    box.innerHTML = `<div class="usr-h"><b>Cambiar nombre de usuario</b><button class="usr-x" data-x aria-label="Cerrar">${EQUIS}</button></div>
      <p class="usr-sub">Nombre actual: <b></b></p>
      <div class="usr-fila"><input id="usrInput" maxlength="20" placeholder="Nuevo nombre de usuario" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="usr-ok" data-guardar>Guardar</button></div>
      <small class="usr-msg"></small>
      <p class="usr-nota">De 3 a 20 caracteres: letras, números, _ y . Solo puedes cambiarlo una vez cada ${DIAS} días.</p>`;
    box.querySelector('.usr-sub b').textContent = u.nombre;
    ov.classList.add('on'); box.classList.add('on');

    const hasta = await bloqueoHasta(u);
    if (hasta) {
      input().disabled = true; boton().disabled = true;
      mensaje('Podrás cambiarlo de nuevo el ' + fechaLarga(hasta) + '.');
    } else {
      setTimeout(() => { const i = input(); if (i && !i.disabled) i.focus(); }, 60);
    }
  }

  async function guardar() {
    const u = window.usuario && window.usuario();
    if (!u) { cerrar(); return; }
    const nuevo = input().value.trim();
    if (!FORMATO.test(nuevo)) { mensaje(MSG_FORMATO, true); return; }
    if (nuevo === u.nombre) { mensaje('Ese ya es tu nombre de usuario.', true); return; }

    boton().disabled = true;
    mensaje('Guardando…');
    const { data, error } = await db.from('profiles').update({ username: nuevo }).eq('id', u.id).select('username');
    if (boton()) boton().disabled = false;

    if (error) {
      const t = error.message || '';
      if (error.code === '23505') mensaje('Ese nombre ya está en uso.', true);
      else if (t.indexOf('USERNAME_COOLDOWN') >= 0) mensaje('Solo puedes cambiar tu nombre una vez cada ' + DIAS + ' días.', true);
      else if (t.indexOf('USERNAME_INVALIDO') >= 0) mensaje(MSG_FORMATO, true);
      else mensaje('No se pudo guardar. Inténtalo de nuevo.', true);
      return;
    }
    if (!data || !data.length) { mensaje('No se pudo guardar. Inténtalo de nuevo.', true); return; }

    // Actualiza la sesión local y el panel del perfil
    u.nombre = data[0].username;
    if (typeof window.guardarUsuario === 'function') window.guardarUsuario(u);
    else localStorage.setItem('cube_sesion_activa', JSON.stringify(u));
    const nombrePanel = document.getElementById('perfilNombre');
    if (nombrePanel) nombrePanel.textContent = u.nombre;
    cerrar();
  }

  box.addEventListener('click', e => {
    if (e.target.closest('[data-x]')) cerrar();
    else if (e.target.closest('[data-guardar]')) guardar();
  });
  box.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'usrInput') guardar();
  });

  // ---------- Opción en el panel del perfil ----------
  const ref = document.getElementById('irNotificaciones');
  const opcion = document.createElement('button');
  opcion.className = 'perfil-opcion';
  opcion.id = 'irUsername';
  opcion.innerHTML = `<span class="po-lab">${ICO_EDITAR}Nombre de usuario</span>${CHEV}`;
  ref.parentNode.insertBefore(opcion, ref);
  opcion.addEventListener('click', abrir);
})();
