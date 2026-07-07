import { useCallback, useEffect, useState } from "react";
import { UNIVERSITY_PUBLIC_SECTIONS } from "@/utils/universityPublicSections.js";
import {
  buildUniversityPublicSectionUrl,
  readUniversityPublicSectionFromWindow,
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

  const handleSectionChange = useCallback((section) => {
    const nextUrl = buildUniversityPublicSectionUrl(
      window.location.pathname,
      window.location.search,
      section
    );

    if (nextUrl === currentDocumentUrl()) {
      setActiveSection(section);
      return;
    }

    setActiveSection(section);
    window.history.pushState(null, "", nextUrl);
  }, []);

  return {
    activeSection,
    handleSectionChange,
    sections: UNIVERSITY_PUBLIC_SECTIONS,
  };
}
