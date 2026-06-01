/* eslint-env serviceworker */
/* global clients */
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || "MyUni.uz";
  const options = {
    body: payload.body || "",
    tag: payload.tag || "myuni-chat",
    data: { url: payload.url || "/" },
    icon: "/pwa-192.png",
    badge: "/pwa-192.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

async function focusOrOpenClient(targetUrl) {
  const clientList = await clients.matchAll({ type: "window", includeUncontrolled: true });

  for (const client of clientList) {
    if ("focus" in client) {
      if (typeof client.navigate === "function") {
        await client.navigate(targetUrl);
      }
      return client.focus();
    }
  }

  if (clients.openWindow) {
    return clients.openWindow(targetUrl);
  }

  return undefined;
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(focusOrOpenClient(targetUrl));
});
