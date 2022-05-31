const staticCacheName = 'site-static-v1';
const dynamicCache = 'site-dynamic-v1';
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/logo.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v129/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
];

//install service worker
self.addEventListener('install', (evt => {
    // console.log('service worker has been installed');
    evt.waitUntill(
        caches.open(staticCacheName).then(cache => {
            console.log('caching shell assets');
            cache.addAll(assets);
        })
    );

}));

//activate service worker
self.addEventListener('activate', evt => {
    // console.log('Service worker has been activated');
    evt.waitUntill(caches.keys().then(keys => {
        // console.log(keys);
        return Promise.all(keys
            .filter(key => key !== staticCacheName)
            .map(key => caches.delete(key)
            ))
    })
    );
});

//fetch event
self.addEventListener('fetch', evt => {
    // console.log('fetch event', evt);
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fetchRes => {
                return caches.open(dynamicCache).then(cache => {
                    cache.put(evt.request.url, fetchRes.clone());
                    return fetchRes; 
                })
            });
        })
    );
});