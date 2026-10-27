self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (err) { d = { title: 'cube', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'cube', {
    body: d.body || '',
    icon: d.icon,
    badge: d.icon,
    tag: d.tag,
    data: { url: d.url || 'cube.html' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const destino = new URL((e.notification.data && e.notification.data.url) || 'cube.html', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(lista => {
    for (const c of lista) {
      if (c.url.split('#')[0] === destino.split('#')[0] && 'focus' in c) return c.focus();
    }
    return self.clients.openWindow(destino);
  }));
});
