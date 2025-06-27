const CACHE_NAME = 'crud-app-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/static/css/estilos.css',      // troque para o nome do seu CSS real
  '/static/js/app.js',            // troque para o nome real
  '/manifest.json',
  '/icon.png',                    // se tiver ícone
  '/favicon.ico'
];

// Instala o service worker e faz cache dos arquivos
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Fazendo cache dos arquivos');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Ativa e limpa caches antigos
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Ativando...');
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Limpando cache antigo:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Intercepta requisições e responde do cache (fallback offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // fallback opcional para arquivos HTML offline
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      });
    })
  );
});
