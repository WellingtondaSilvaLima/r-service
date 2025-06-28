const CACHE_NAME = 'rservice-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/static/js/app.js',
  '/static/manifest.json',
  '/static/image/android-chrome-192x192.png',
  '/static/image/android-chrome-512x512.png',
  '/static/image/apple-touch-icon.png',
  '/static/image/favicon-16x16.png',
  '/static/image/favicon-32x32.png',
  '/static/image/favicon.ico'
];

// Instala e faz cache
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[ServiceWorker] Fazendo cache dos arquivos');
      for (const url of URLS_TO_CACHE) {
        try {
          await cache.add(url);
          console.log(`✅ Cached: ${url}`);
        } catch (err) {
          console.error(`❌ Falhou ao cachear: ${url}`, err);
        }
      }
    })
  );
  self.skipWaiting();
});


// Ativa e limpa caches antigos
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Ativando...');
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Limpando cache antigo:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Responde com cache ou busca na rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request).catch(() => {
        // fallback para páginas HTML
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
