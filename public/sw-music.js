// Service worker do Avivar Music (só é registrado quando o site abre com ?app=music).
// Rede primeiro; sem internet, entrega o que já foi aberto antes. Não mexe em /api nem em outros domínios.
const CACHE = "avivar-music-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        if (req.mode === "navigate") {
          const shell = (await caches.match("/", { ignoreSearch: true })) || (await caches.match("/index.html", { ignoreSearch: true }));
          if (shell) return shell;
        }
        return new Response("", { status: 504, statusText: "Sem conexão" });
      })
  );
});
