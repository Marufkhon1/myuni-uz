import { useCallback, useState } from "react";

const CHECKLIST_SECTIONS = new Set(["reviews", "popular", "compare"]);

export function useApplicantChecklistVersion() {
  const [checklistVersion, setChecklistVersion] = useState(0);

  const bumpChecklistVersion = useCallback(() => {
    setChecklistVersion((value) => value + 1);
  }, []);

  const wrapChangeSection = useCallback(
    (changeSectionBase) => (sectionId, options) => {
      changeSectionBase(sectionId, options);
      if (CHECKLIST_SECTIONS.has(sectionId)) {
        bumpChecklistVersion();
      }
    },
    [bumpChecklistVersion]
  );

  return {
    checklistVersion,
    bumpChecklistVersion,
    wrapChangeSection,
  };
}
