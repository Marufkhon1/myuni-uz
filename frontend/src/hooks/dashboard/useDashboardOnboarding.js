import { useEffect, useRef } from "react";
import {
  isOnboardingComplete,
  markOnboardingComplete,
  shouldOfferOnboarding,
} from "@/utils/onboardingStorage.js";

export function useDashboardOnboarding({
  isDataLoading,
  profile,
  joinedUniversityIds,
  universities,
  setOnboardingOpen,
}) {
  const onboardingOfferedRef = useRef(false);

  useEffect(() => {
    if (isDataLoading || !profile) {
      return;
    }

    const needsOnboarding = shouldOfferOnboarding({
      profile,
      joinedChatCount: joinedUniversityIds.size,
      universities,
    });

    if (!needsOnboarding) {
      if (!isOnboardingComplete()) {
        markOnboardingComplete();
      }
      return;
    }

    if (!onboardingOfferedRef.current) {
      onboardingOfferedRef.current = true;
      setOnboardingOpen(true);
    }
  }, [isDataLoading, profile, joinedUniversityIds.size, universities, setOnboardingOpen]);
}
