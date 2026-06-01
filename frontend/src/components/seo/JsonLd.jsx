import { useEffect } from "react";

function upsertJsonLd(id, data) {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.id = id;
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

/**
 * JSON-LD structured data (schema.org) — SEO uchun.
 */
export default function JsonLd({ id = "json-ld", data }) {
  useEffect(() => {
    if (!data) {
      return undefined;
    }
    upsertJsonLd(id, data);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [data, id]);

  return null;
}
