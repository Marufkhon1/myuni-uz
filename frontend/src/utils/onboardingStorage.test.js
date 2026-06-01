import { describe, expect, it, beforeEach } from "vitest";
import {
  getInitialOnboardingStep,
  isOnboardingComplete,
  markOnboardingComplete,
  shouldOfferOnboarding,
} from "./onboardingStorage.js";

describe("onboardingStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("offers onboarding when profile is incomplete", () => {
    expect(
      shouldOfferOnboarding({
        profile: { full_name: "", university: "" },
        joinedChatCount: 0,
      })
    ).toBe(true);
  });

  it("skips onboarding when marked complete", () => {
    markOnboardingComplete();
    expect(
      shouldOfferOnboarding({
        profile: { full_name: "", university: "" },
        joinedChatCount: 0,
      })
    ).toBe(false);
    expect(isOnboardingComplete()).toBe(true);
  });

  it("starts at the first incomplete step", () => {
    const universities = [{ id: 2, name: "Toshkent davlat iqtisodiyot universiteti", short_name: "TDU" }];
    expect(getInitialOnboardingStep({ profile: { full_name: "" }, joinedChatCount: 0, universities })).toBe(0);
    expect(
      getInitialOnboardingStep({ profile: { full_name: "Ali", university: "" }, joinedChatCount: 0, universities })
    ).toBe(1);
    expect(
      getInitialOnboardingStep({
        profile: { full_name: "Ali", university: "TDU" },
        joinedChatCount: 0,
        universities,
      })
    ).toBe(2);
  });

  it("treats invalid university text as incomplete when the list is loaded", () => {
    const universities = [{ id: 2, name: "Toshkent davlat iqtisodiyot universiteti", short_name: "TDU" }];
    expect(
      shouldOfferOnboarding({
        profile: { full_name: "Ali", university: "Not real" },
        joinedChatCount: 1,
        universities,
      })
    ).toBe(true);
    expect(
      getInitialOnboardingStep({
        profile: { full_name: "Ali", university: "Not real" },
        joinedChatCount: 1,
        universities,
      })
    ).toBe(1);
  });
});
