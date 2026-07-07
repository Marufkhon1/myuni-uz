import { useCallback, useState } from "react";
import { markApplicantChecklistStep } from "@/utils/applicantChecklist.js";

export function useDashboardCompare({ changeSection, bumpChecklistVersion }) {
  const [comparePrefill, setComparePrefill] = useState(null);

  const handleOpenFavoriteCompare = useCallback(
    (universityId) => {
      markApplicantChecklistStep("compare");
      bumpChecklistVersion();
      setComparePrefill([String(universityId)]);
      changeSection("compare");
    },
    [changeSection, bumpChecklistVersion]
  );

  const handleOpenCompareSuggestion = useCallback(
    (universityList) => {
      if (!universityList?.length) {
        return;
      }
      markApplicantChecklistStep("compare");
      bumpChecklistVersion();
      setComparePrefill(universityList.map((university) => String(university.id)));
      changeSection("compare");
    },
    [changeSection, bumpChecklistVersion]
  );

  const clearComparePrefill = useCallback(() => {
    setComparePrefill(null);
  }, []);

  return {
    comparePrefill,
    handleOpenFavoriteCompare,
    handleOpenCompareSuggestion,
    clearComparePrefill,
  };
}
