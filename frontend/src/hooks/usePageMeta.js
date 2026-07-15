import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_OG_IMAGE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_LOCALE,
  SITE_NAME,
  TWITTER_HANDLE,
  buildPageMeta,
} from "@/config/siteMeta.js";

function upsertMetaByName(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertMetaByProperty(property, content) {
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel, href, { hreflang } = {}) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.querySelector(selector);
  if (!href) {
    if (element) {
      element.remove();
    }
    return;
  }
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    if (hreflang) {
      element.setAttribute("hreflang", hreflang);
    }
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function clearHreflangLinks() {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
}

function applyPageMeta(meta) {
  document.title = meta.title;

  upsertMetaByName("description", meta.description);
  upsertMetaByName("robots", meta.robots);

  upsertMetaByProperty("og:site_name", SITE_NAME);
  upsertMetaByProperty("og:title", meta.title);
  upsertMetaByProperty("og:description", meta.description);
  upsertMetaByProperty("og:url", meta.canonicalUrl);
  upsertMetaByProperty("og:type", meta.type);
  upsertMetaByProperty("og:locale", meta.ogLocale || SITE_LOCALE);
  upsertMetaByProperty("og:image", meta.absoluteImage);
  upsertMetaByProperty("og:image:secure_url", meta.absoluteImage);
  upsertMetaByProperty("og:image:alt", meta.imageAlt);
  upsertMetaByProperty("og:image:width", String(OG_IMAGE_WIDTH));
  upsertMetaByProperty("og:image:height", String(OG_IMAGE_HEIGHT));

  upsertMetaByName("twitter:card", "summary_large_image");
  upsertMetaByName("twitter:site", TWITTER_HANDLE);
  upsertMetaByName("twitter:title", meta.title);
  upsertMetaByName("twitter:description", meta.description);
  upsertMetaByName("twitter:image", meta.absoluteImage);
  upsertMetaByName("twitter:image:alt", meta.imageAlt);

  if (meta.type === "article") {
    if (meta.publishedTime) {
      upsertMetaByProperty("article:published_time", meta.publishedTime);
      upsertMetaByProperty("og:article:published_time", meta.publishedTime);
    }
    if (meta.modifiedTime) {
      upsertMetaByProperty("article:modified_time", meta.modifiedTime);
      upsertMetaByProperty("og:article:modified_time", meta.modifiedTime);
    }
    upsertMetaByProperty("og:article:author", meta.author);
    upsertMetaByProperty("article:author", meta.author);
  }

  upsertLink("canonical", meta.canonicalUrl);
  upsertLink("prev", meta.prevUrl || "");
  upsertLink("next", meta.nextUrl || "");

  clearHreflangLinks();
  if (Array.isArray(meta.hreflang) && meta.hreflang.length > 0) {
    for (const item of meta.hreflang) {
      if (!item?.hreflang || !item?.href) {
        continue;
      }
      upsertLink("alternate", item.href, { hreflang: item.hreflang });
    }
  }
}

/**
 * Sahifa title, description, Open Graph va Twitter Card meta teglarini yangilaydi.
 */
export function usePageMeta(options = {}) {
  const { pathname } = useLocation();
  const {
    title,
    description,
    path,
    image = DEFAULT_OG_IMAGE,
    imageAlt,
    type,
    robots,
    publishedTime,
    modifiedTime,
    author,
    prevUrl,
    nextUrl,
    ogLocale,
    hreflang,
  } = options;

  useEffect(() => {
    applyPageMeta({
      ...buildPageMeta({
        title,
        description,
        path: path ?? pathname,
        image,
        imageAlt,
        type,
        robots,
        publishedTime,
        modifiedTime,
        author,
      }),
      prevUrl,
      nextUrl,
      ogLocale,
      hreflang,
    });
  }, [
    title,
    description,
    path,
    pathname,
    image,
    imageAlt,
    type,
    robots,
    publishedTime,
    modifiedTime,
    author,
    prevUrl,
    nextUrl,
    ogLocale,
    hreflang,
  ]);
}

export { applyPageMeta, buildPageMeta };
