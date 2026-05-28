import { useEffect } from "react";

const DEFAULT_TITLE = "MyUni.uz | Universitetlar reytingi va talabalar sharhlari";
const DEFAULT_DESCRIPTION =
  "MyUni.uz — O'zbekiston universitetlari haqida talabalar sharhlari, reyting va tanlov uchun ochiq ma'lumot.";

export function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    document.title = title || DEFAULT_TITLE;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description || DEFAULT_DESCRIPTION);

    return () => {
      document.title = DEFAULT_TITLE;
      meta.setAttribute("content", DEFAULT_DESCRIPTION);
    };
  }, [title, description]);
}
