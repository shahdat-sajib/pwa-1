const staticCacheName = 'site-static-v1';
const dynamicCacheName = 'site-dynamic-v1';
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/logo.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v129/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    '/pages/fallback.html'
];

//cache size limit
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        })
    })
}

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
            .filter(key => key !== staticCacheName && key !== dynamicCacheName)
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
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fetchRes.clone());
                    limitCacheSize(dynamicCacheName, 2);
                    return fetchRes; 
                }) 
            });
        }).catch(() => {
            if(evt.request.url.indexOf('.html') > -1){
                return caches.match('/pages/fallback.html');
            } 
        }) 
    );
});