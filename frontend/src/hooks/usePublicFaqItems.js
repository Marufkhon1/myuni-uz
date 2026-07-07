import { useEffect, useState } from "react";
import { getPublicFaqItems } from "@/services/publicService.js";

export function normalizeFaqItems(data) {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.items ?? [];
}

export default function usePublicFaqItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getPublicFaqItems()
      .then((data) => {
        if (!cancelled) {
          setItems(normalizeFaqItems(data));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setError("Savol-javoblar yuklanmadi.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
}
