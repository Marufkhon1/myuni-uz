import { useEffect, useState } from "react";

const QUERIES = {
  isPhone: "(max-width: 767px)",
  isTablet: "(min-width: 768px) and (max-width: 1023px)",
  isDesktop: "(min-width: 1024px)",
  isWideChat: "(min-width: 1280px)",
};

function matchQuery(query) {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(query).matches;
}

export function useBreakpoint() {
  const [state, setState] = useState({
    isPhone: matchQuery(QUERIES.isPhone),
    isTablet: matchQuery(QUERIES.isTablet),
    isDesktop: matchQuery(QUERIES.isDesktop),
    isWideChat: matchQuery(QUERIES.isWideChat),
  });

  useEffect(() => {
    const mediaLists = Object.entries(QUERIES).map(([key, query]) => {
      const media = window.matchMedia(query);
      const listener = () => {
        setState({
          isPhone: mediaLists.find((m) => m.key === "isPhone")?.media.matches ?? false,
          isTablet: mediaLists.find((m) => m.key === "isTablet")?.media.matches ?? false,
          isDesktop: mediaLists.find((m) => m.key === "isDesktop")?.media.matches ?? false,
          isWideChat: mediaLists.find((m) => m.key === "isWideChat")?.media.matches ?? false,
        });
      };
      media.addEventListener("change", listener);
      return { key, media, listener };
    });

    const refresh = () => {
      setState({
        isPhone: window.matchMedia(QUERIES.isPhone).matches,
        isTablet: window.matchMedia(QUERIES.isTablet).matches,
        isDesktop: window.matchMedia(QUERIES.isDesktop).matches,
        isWideChat: window.matchMedia(QUERIES.isWideChat).matches,
      });
    };
    refresh();

    return () => {
      mediaLists.forEach(({ media, listener }) => media.removeEventListener("change", listener));
    };
  }, []);

  return state;
}
