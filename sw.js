/* 86,400 — Service Worker：殼層離線；HTML／SW 一律網路優先，避免分頁順序卡舊版 */
const CACHE = '86400-v64';
const ASSETS = [
  './', './index.html', './sw.js',
  './assets/figma/icon-signal.svg',
  './assets/figma/icon-wifi.svg',
  './assets/figma/icon-battery.svg',
  './assets/figma/icon-sparkles.svg',
  './assets/figma/icon-list.svg',
  './assets/figma/icon-calendar.svg',
  './assets/figma/icon-compass.svg',
  './assets/figma/icon-growth.svg',
  './assets/figma/v257/egg-watercolor-v3.png',
  './assets/figma/v257/capybara.png',
  './assets/figma/v257/red-panda.png',
  './assets/figma/v257/sea-otter.png',
  './assets/figma/v257/fennec-fox.png',
  './assets/figma/v257/lop-rabbit.png',
  './assets/figma/v257/axolotl.png',
  './assets/figma/v257/hedgehog.png',
  './assets/figma/v257/shiba-inu.png',
  './assets/figma/v257/beaver.png',
  './assets/figma/v257/today-neutral.png',
  './assets/figma/v257/today-celebrating.png',
  './assets/figma/v257/room-neutral.png',
  './assets/figma/v257/eod-intro.png',
  './assets/figma/v257/eod-response.png',
  './assets/figma/v257/eod-complete.png',
  './assets/figma/v257/weekly-celebrating.png',
  './assets/figma/v257/journey-complete.png',
  './assets/figma/v257/photo-sample.png',
  './assets/figma/v257/cozy-forest.png',
  './assets/figma/v257/tiny-hat.png',
  './assets/figma/v257/tiny-hat-transparent-v2.png',
  './assets/figma/v257/tiny-hat-card.png',
  './assets/figma/v257/equipped-hero.png',
  './assets/figma/v257/equipped-hat.png',
  './assets/figma/v257/equipped-forest.png'
];

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
  // HTML：網路優先，離線回退 index；sw.js：網路優先，離線只回自己的快取（不拿 HTML 頂替）
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
