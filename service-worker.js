const CACHE='free-space-pwa-v2';
const CORE=[
  './',
  './index.html',
  './board.html',
  './notebook.html',
  './assets/css/theme.css',
  './assets/css/landing.css',
  './assets/css/board.css',
  './assets/css/notebook.css',
  './assets/js/theme.js',
  './assets/js/landing.js',
  './assets/js/board.js',
  './assets/js/notebook.js',
  './assets/js/data-transfer.js',
  './assets/audio/sea.mp3',
  './assets/audio/Rain%20Sound%20Effect.mp3',
  './assets/audio/Rain%20Sound%20And%20Rainforest%20Sound%20Effect.mp3',
  './assets/audio/Birds%20Singing%20In%20A%20Forest%20Sound%20Effect.mp3'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    try{
      const response=await fetch(event.request);
      if(response.ok&&new URL(event.request.url).origin===self.location.origin){
        const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      }
      return response;
    }catch(error){
      if(cached)return cached;
      if(event.request.mode==='navigate')return caches.match('./index.html');
      throw error;
    }
  })());
});
