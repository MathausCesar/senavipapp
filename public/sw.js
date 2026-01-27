// Service Worker para PWA
// Arquivo: public/sw.js

const CACHE_NAME = "boletos-v1";
const urlsToCache = [
  "/",
  "/login",
  "/app/dashboard",
  "/app/bills",
  "/offline.html",
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn("Erro ao cachear URLs:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event (Network first, then cache fallback)
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip API calls (deixar o Supabase fazer seu trabalho)
  if (event.request.url.includes("supabase")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Return offline page if available
          if (event.request.destination === "document") {
            return caches.match("/offline.html");
          }
          return new Response("Offline - Página não encontrada", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      })
  );
});

// Background sync (Sincronizar boletos quando voltar online)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-bills") {
    event.waitUntil(
      fetch("/api/sync-bills").catch((err) => {
        console.warn("Erro ao sincronizar:", err);
      })
    );
  }
});
