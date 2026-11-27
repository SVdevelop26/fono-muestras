/* FonoSmart · App de muestras · VERSIÓN DE PRUEBA · guarda la app en el teléfono para usarla sin internet.
   Va en la MISMA carpeta de GitHub que el index.html de prueba (nunca en la carpeta de la app oficial).
   Cómo funciona: la primera vez guarda el index.html (cifrado). Desde ahí siempre abre la copia guardada,
   al instante y sin señal; si hay internet, revisa en segundo plano si hay una versión nueva y la usa la próxima vez. */
const CACHE = "fonosmart-prueba-v1";
const APP = "./";

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.add(new Request(APP, {cache: "reload"}))));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE && k.indexOf("fonosmart-prueba") === 0) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || r.mode !== "navigate") return;          /* solo la página; nada más pasa por aquí */
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const guardada = await c.match(APP);
    const deRed = fetch(new Request(APP, {cache: "no-cache"}))
      .then(resp => { if (resp && resp.ok) return c.put(APP, resp.clone()).then(() => resp); return resp; })
      .catch(() => null);
    if (guardada){ e.waitUntil(deRed); return guardada; }
    const resp = await deRed;
    return resp || new Response("<meta charset='utf-8'><p style='font:18px sans-serif;padding:24px'>Sin conexión y la app todavía no quedó guardada en este teléfono. Ábrala una vez con internet.</p>",
                                {status: 503, headers: {"Content-Type": "text/html; charset=utf-8"}});
  })());
});
