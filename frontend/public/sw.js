const CACHE = 'campusfinds-v1';
const ASSETS = ['/', '/index.html'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'CampusFinds', body: 'New notification' };
  e.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/favicon.svg' }));
});
