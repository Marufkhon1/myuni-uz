const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN?.trim() || "";
const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID?.trim() || "";
const PLAUSIBLE_SCRIPT = import.meta.env.VITE_PLAUSIBLE_SCRIPT_URL?.trim() || "https://plausible.io/js/script.js";

let analyticsReady = false;
let initPromise = null;
const pendingEvents = [];

function flushPendingEvents() {
  if (!analyticsReady) {
    return;
  }
  while (pendingEvents.length > 0) {
    const job = pendingEvents.shift();
    job();
  }
}

function queueOrRun(job) {
  if (analyticsReady) {
    job();
    return;
  }
  pendingEvents.push(job);
}

function loadScript(src, attributes = {}) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load failed: ${src}`));
    document.head.appendChild(script);
  });
}

export function isAnalyticsEnabled() {
  return Boolean(PLAUSIBLE_DOMAIN || GA4_ID);
}

export async function initAnalytics() {
  if (analyticsReady) {
    return;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    if (typeof window === "undefined") {
      return;
    }

    const tasks = [];

    if (PLAUSIBLE_DOMAIN) {
      tasks.push(
        loadScript(PLAUSIBLE_SCRIPT, {
          defer: "",
          "data-domain": PLAUSIBLE_DOMAIN,
        })
      );
    }

    if (GA4_ID) {
      tasks.push(loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`));
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", GA4_ID, { send_page_view: false });
    }

    if (tasks.length) {
      await Promise.allSettled(tasks);
    }

    analyticsReady = true;
    flushPendingEvents();
  })();

  return initPromise;
}

export function trackPageView(path, { title } = {}) {
  if (!path) {
    return;
  }

  queueOrRun(() => {
    if (PLAUSIBLE_DOMAIN && typeof window.plausible === "function") {
      window.plausible("pageview", {
        u: `${window.location.origin}${path}`,
      });
    }

    if (GA4_ID && typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: path,
        page_title: title || document.title,
      });
    }
  });
}

export function trackEvent(name, props = {}) {
  if (!name) {
    return;
  }

  queueOrRun(() => {
    if (PLAUSIBLE_DOMAIN && typeof window.plausible === "function") {
      window.plausible(name, Object.keys(props).length ? { props } : undefined);
    }

    if (GA4_ID && typeof window.gtag === "function") {
      window.gtag("event", name, props);
    }
  });
}

export function trackDashboardSection(section) {
  trackEvent("dashboard_section", { section });
}

export function trackPwaInstall(action) {
  trackEvent("pwa_install", { action });
}

const DASHBOARD_QUERY_KEYS = new Set([
  "section",
  "panel",
  "university_id",
  "university",
  "chat_panel",
  "thread_id",
]);

/** Dashboard tab o'zgarishlarida pageview inflatsiyasini oldini oladi. */
export function normalizeAnalyticsPath(pathname, search = "", hash = "") {
  const isDashboard =
    pathname.startsWith("/student/dashboard") || pathname.startsWith("/applicant/dashboard");

  if (!isDashboard || !search) {
    return `${pathname}${search}${hash}`;
  }

  const params = new URLSearchParams(search);
  DASHBOARD_QUERY_KEYS.forEach((key) => params.delete(key));
  const normalizedSearch = params.toString();
  return `${pathname}${normalizedSearch ? `?${normalizedSearch}` : ""}${hash}`;
}
