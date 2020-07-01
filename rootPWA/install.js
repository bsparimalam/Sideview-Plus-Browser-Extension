var appversion = "v0_2_1";
const expectedCaches = ['minibrowser-' + appversion ];
const files2cache = [
    './',
    './index.json',
    './icons/icon-512.png',
    './icons/icon-152.png',
    './icons/icon-32.png',
    './favicon.ico',
    './index.html',
    './index.css',
    './index.js',
    './engine/engine.html',
    './engine/engine.css',
    './engine/engine.js',
    './engine/back.png',
    './engine/back-dark.png',
    './engine/forward.png',
    './engine/forward-dark.png',
    './engine/reload.png',
    './engine/reload-dark.png',
    './engine/loading.html',
    './engine/loading.css',
    './engine/loading.gif',
    './engine/loading-dark.gif'
];
self.addEventListener('install', function(event) {
  console.log(appversion + ' downloading...');
  event.waitUntil(caches.open('Calculator-' + appversion )
    .then(function(cache) {
      cache.addAll(files2cache);
    }));
  console.log('app download complete!');
});

self.addEventListener('activate', function(event){
  console.log('app installation complete!');
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (!expectedCaches.includes(key)) {
          return caches.delete(key);
        }
      })
    )).then(() => {
      console.log('Calculator-' + appversion + ' ready to load offline!');
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(res) {
        if (res) {
          return res;
        } else {
          return fetch(event.request);
        }
      })
  );
});