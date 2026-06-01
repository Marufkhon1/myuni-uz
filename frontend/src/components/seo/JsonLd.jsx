import { useEffect, useMemo } from "react";
import { buildJsonLdGraph, serializeJsonLd } from "../../utils/structuredData.js";

function upsertJsonLd(id, payload) {
  if (!payload) {
    return;
  }
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.id = id;
    document.head.appendChild(element);
  }
  element.textContent = serializeJsonLd(payload);
}

/**
 * JSON-LD structured data (schema.org) — SEO uchun.
 * `data` — bitta schema; `schemas` — @graph ga birlashtirilgan bir nechta schema.
 */
export default function JsonLd({ id = "json-ld", data, schemas }) {
  const payload = useMemo(() => {
    if (Array.isArray(schemas) && schemas.length > 0) {
      return buildJsonLdGraph(schemas);
    }
    return data ?? null;
  }, [data, schemas]);

  useEffect(() => {
    if (!payload) {
      return undefined;
    }
    upsertJsonLd(id, payload);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [id, payload]);

  return null;
}
