/* 86,400 — Service Worker：殼層離線；HTML／SW 一律網路優先，避免分頁順序卡舊版 */
const CACHE = '86400-v12';
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

function networkFirst(request){
  return fetch(request).then(res => {
    if(res && res.ok){
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return res;
  }).catch(() =>
    caches.match(request).then(hit => hit || caches.match('./index.html'))
  );
}

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // HTML 與 sw.js：永遠先打網路，否則重新整理會卡在舊分頁順序／舊文案
  const isShell = event.request.mode === 'navigate'
    || (event.request.headers.get('accept') || '').indexOf('text/html') >= 0
    || /\/index\.html$/.test(url.pathname)
    || /\/sw\.js$/.test(url.pathname)
    || url.pathname === '/' || url.pathname.endsWith('/');
  if(isShell){
    event.respondWith(networkFirst(event.request));
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
