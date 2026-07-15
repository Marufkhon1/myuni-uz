import { useCallback, useEffect, useState } from "react";
import { UNIVERSITY_PUBLIC_SECTIONS } from "@/utils/universityPublicSections.js";
import {
  buildUniversityPublicSectionUrl,
  readUniversityPublicSectionFromWindow,
  scrollUniversityPublicSectionIntoView,
} from "@/utils/universityPublicHash.js";

function currentDocumentUrl() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function useUniversityPublicSection(slug) {
  const [activeSection, setActiveSection] = useState(readUniversityPublicSectionFromWindow);

  const syncSectionFromLocation = useCallback(() => {
    setActiveSection(readUniversityPublicSectionFromWindow());
  }, []);

  useEffect(() => {
    syncSectionFromLocation();
  }, [slug, syncSectionFromLocation]);

  useEffect(() => {
    window.addEventListener("hashchange", syncSectionFromLocation);
    window.addEventListener("popstate", syncSectionFromLocation);
    return () => {
      window.removeEventListener("hashchange", syncSectionFromLocation);
      window.removeEventListener("popstate", syncSectionFromLocation);
    };
  }, [syncSectionFromLocation]);

  useEffect(() => {
    const section = readUniversityPublicSectionFromWindow();
    if (section === UNIVERSITY_PUBLIC_SECTIONS.reviews) {
      // Prerender / deep-link: sharhlar blokiga o'tish.
      window.requestAnimationFrame(() => {
        scrollUniversityPublicSectionIntoView(section, { behavior: "auto" });
      });
    }
  }, [slug]);

  const handleSectionChange = useCallback((section) => {
    const nextUrl = buildUniversityPublicSectionUrl(
      window.location.pathname,
      window.location.search,
      section
    );

    if (nextUrl !== currentDocumentUrl()) {
      window.history.pushState(null, "", nextUrl);
    }
    setActiveSection(section);
    scrollUniversityPublicSectionIntoView(section);
  }, []);

  return {
    activeSection,
    handleSectionChange,
    sections: UNIVERSITY_PUBLIC_SECTIONS,
  };
}
