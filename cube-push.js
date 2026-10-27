(function () {
  if (!window.supabase || !window.CUBE_SUPABASE_URL || !window.CUBE_SUPABASE_ANON_KEY) return;
  const db = window.supabase.createClient(window.CUBE_SUPABASE_URL, window.CUBE_SUPABASE_ANON_KEY);
  const VAPID = window.CUBE_VAPID_PUBLIC_KEY;
  const soporta = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  const ICO = '<svg class="po-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/><line x1="19" y1="2" x2="22" y2="5"/></svg>';

  const css = document.createElement('style');
  css.textContent = `
    .po-lab { display: flex; align-items: center; }
    .perfil-opcion .po-ico { width: 20px; height: 20px; opacity: 1; margin-right: 12px; color: var(--verde); flex: 0 0 auto; }
    .push-estado { font-size: .75rem; font-weight: 700; color: #777; }
    .push-estado.on { color: var(--verde); }
  `;
  document.head.appendChild(css);

  const usuario = () => (window.usuario ? window.usuario() : null);

  function aUint8(b64url) {
    const s = (b64url + '='.repeat((4 - b64url.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(s);
    return Uint8Array.from(raw, c => c.charCodeAt(0));
  }

  async function suscripcionActual() {
    if (!soporta) return null;
    const reg = await navigator.serviceWorker.getRegistration();
    return reg ? reg.pushManager.getSubscription() : null;
  }

  // ¿Este dispositivo está recibiendo avisos para la cuenta actual?
  async function estaActivo() {
    try {
      if (!soporta || !usuario() || Notification.permission !== 'granted') return false;
      const sub = await suscripcionActual();
      if (!sub) return false;
      const { data } = await db.from('push_subscriptions').select('endpoint').eq('endpoint', sub.endpoint).maybeSingle();
      return !!data;
    } catch (e) { return false; }
  }

  async function activar() {
    if (!usuario()) { if (window.abrirModal) window.abrirModal('auth'); return false; }
    if (!soporta) {
      alert('Este navegador no permite notificaciones push. En iPhone, agrega Cube a la pantalla de inicio (Compartir → Añadir a pantalla de inicio) y actívalas desde ahí.');
      return false;
    }
    if (!VAPID) { alert('Falta la clave pública VAPID en cube-config.js.'); return false; }
    const permiso = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permiso !== 'granted') {
      alert('Las notificaciones están bloqueadas. Permítelas en los ajustes del navegador para este sitio y vuelve a intentarlo.');
      return false;
    }
    try {
      const reg = await navigator.serviceWorker.register('sw.js');
      await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aUint8(VAPID) });
      const j = sub.toJSON();
      const { error } = await db.rpc('registrar_push', {
        p_endpoint: sub.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth,
        p_ua: (navigator.userAgent || '').slice(0, 200)
      });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('No se pudo activar el push', e);
      alert('No se pudieron activar las notificaciones. Inténtalo de nuevo.');
      return false;
    }
  }

  async function desactivar() {
    try {
      const sub = await suscripcionActual();
      if (sub) {
        await db.rpc('quitar_push', { p_endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
    } catch (e) { console.error(e); }
  }

  // Al cerrar sesión, este dispositivo deja de recibir los avisos de esa cuenta
  async function quitarDispositivo() {
    try {
      const sub = await suscripcionActual();
      if (sub) await db.rpc('quitar_push', { p_endpoint: sub.endpoint });
    } catch (e) {}
  }
  document.addEventListener('click', e => {
    if (e.target.closest('#btnSalir')) quitarDispositivo();
  }, true);

  // ---------- Opción en el panel del perfil ----------
  const ref = document.getElementById('irNotificaciones');
  const opcion = document.createElement('button');
  opcion.className = 'perfil-opcion';
  opcion.id = 'irPush';
  opcion.innerHTML = `<span class="po-lab">${ICO}Notificaciones push</span><span class="push-estado" id="pushEstado">Desactivadas</span>`;
  ref.parentNode.insertBefore(opcion, ref.nextSibling);
  const estado = opcion.querySelector('#pushEstado');

  async function refrescar() {
    const on = await estaActivo();
    estado.textContent = on ? 'Activadas' : 'Desactivadas';
    estado.classList.toggle('on', on);
  }

  let ocupado = false;
  opcion.addEventListener('click', async () => {
    if (ocupado) return;
    ocupado = true;
    estado.textContent = '…';
    try {
      if (await estaActivo()) await desactivar(); else await activar();
    } finally {
      ocupado = false;
      refrescar();
    }
  });

  // Se actualiza el estado cada vez que se abre el panel del perfil
  document.getElementById('navPerfil').addEventListener('click', () => setTimeout(refrescar, 50));
  refrescar();
})();
