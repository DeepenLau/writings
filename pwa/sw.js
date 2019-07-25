const CACHE_NAME = 'cache_v' + 2

const CACHE_LIST = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/api/images'
]

function preCache() {
  return caches.open(CACHE_NAME).then(cache => {
    return cache.addAll(CACHE_LIST)
  })
}

function fetchAndSave(request) {
  return fetch(request).then(res => {
    let r = res.clone() // res 必须克隆,因为 res 使用一次之后会被销毁
    caches.open(CACHE_NAME).then(cache => cache.put(request, r))
    return res
  })
}

self.addEventListener('fetch', (e) => { // 不能用 ajax ，用 fetch
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      fetchAndSave(e.request)
        .catch(err => {
          return caches.open(CACHE_NAME)
            .then(cache => {
              return cache.match(e.request)
            })
        })
    )
    return
  }

  // 联网会走这里
  e.respondWith(
    fetch(e.request)
      .catch(err => {
        // 断网的时候走这里
        return caches.open(CACHE_NAME)
          .then(cache => {
            return cache.match(e.request)
          })
      })
  )

})

self.addEventListener('install', (e) => {
  console.log('install')
  e.waitUntil(preCache().then(skipWaiting))
})

function clearCache () {
  return caches.keys().then(keys => {
    return Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key)
        }
      })
    )
  })
}

self.addEventListener('activate', (e) => {
  console.log('activate')
  e.waitUntil(
    Promise.all([
      clearCache(), // 清除旧缓存
      self.clients.claim() // 立即激活当前 sw, 不然要手动点一下 skip
    ])
  )
})