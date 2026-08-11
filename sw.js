/* 86,400 — Service Worker: the shell works offline, while HTML and the SW itself
   always go to the network first so a stale shell cannot stick around. */
const CACHE = '86400-v32';
const ASSETS = ['./', './index.html', './sw.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function networkFirst(request, offlineFallback){
  return fetch(request).then(res => {
    if(res && res.ok){
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return res;
  }).catch(() =>
    caches.match(request).then(hit => {
      if(hit) return hit;
      return offlineFallback ? caches.match(offlineFallback) : Response.error();
    })
  );
}

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isSw = /\/sw\.js$/.test(url.pathname);
  const isHtml = event.request.mode === 'navigate'
    || (event.request.headers.get('accept') || '').indexOf('text/html') >= 0
    || /\/index\.html$/.test(url.pathname)
    || url.pathname === '/' || url.pathname.endsWith('/');
  // HTML: network first, falling back to the cached index when offline.
  // sw.js: network first, and offline it only answers from its own cache so HTML never stands in for it.
  if(isHtml || isSw){
    event.respondWith(networkFirst(event.request, isSw ? null : './index.html'));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(hit => {
      if(hit) return hit;
      return fetch(event.request).then(res => {
        if(!res || !res.ok) return res;
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
