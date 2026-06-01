import { api } from "./api.js";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }
  return outputArray;
}

export async function getPushConfig() {
  const { data } = await api.get("/auth/push/vapid/");
  return data;
}

export async function subscribeToPush(subscription) {
  const json = subscription.toJSON();
  const { data } = await api.post("/auth/push/subscribe/", {
    endpoint: json.endpoint,
    keys: json.keys,
  });
  return data;
}

export async function unsubscribeFromPush(subscription) {
  const endpoint = subscription?.endpoint;
  if (!endpoint) {
    return null;
  }
  const { data } = await api.post("/auth/push/unsubscribe/", { endpoint });
  return data;
}

export async function ensurePushSubscription() {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unsupported" };
  }
  if (!("serviceWorker" in window.navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return { ok: false, reason: "unsupported" };
  }

  const config = await getPushConfig();
  if (!config.enabled || !config.public_key) {
    return { ok: false, reason: "disabled" };
  }

  let permission = window.Notification.permission;
  if (permission === "default") {
    permission = await window.Notification.requestPermission();
  }
  if (permission !== "granted") {
    return { ok: false, reason: "denied" };
  }

  const registration = await window.navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.public_key),
    });
  }

  await subscribeToPush(subscription);
  return { ok: true, subscription };
}
