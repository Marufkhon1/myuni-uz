import { describe, expect, it, beforeEach } from "vitest";
import {
  getApplicantChecklistProgress,
  getApplicantChecklistSteps,
  getCompareSuggestion,
  getRecentJoinedChats,
  markApplicantChecklistStep,
} from "./applicantChecklist.js";

describe("applicantChecklist", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("tracks profile and chat steps from live data", () => {
    const universities = [
      { id: 1, name: "Toshkent axborot texnologiyalari universiteti", short_name: "TATU" },
    ];
    const steps = getApplicantChecklistSteps({
      profile: { full_name: "Ali", university: "TATU" },
      joinedChatCount: 1,
      universities,
    });

    expect(steps.find((step) => step.id === "profile")?.done).toBe(true);
    expect(steps.find((step) => step.id === "university")?.done).toBe(true);
    expect(steps.find((step) => step.id === "chat")?.done).toBe(true);
    expect(steps.find((step) => step.id === "reviews")?.done).toBe(false);
  });

  it("persists reviews and compare checklist steps", () => {
    markApplicantChecklistStep("reviews");
    markApplicantChecklistStep("compare");

    const steps = getApplicantChecklistSteps({
      profile: {},
      joinedChatCount: 0,
    });

    expect(steps.find((step) => step.id === "reviews")?.done).toBe(true);
    expect(steps.find((step) => step.id === "compare")?.done).toBe(true);
  });

  it("does not mark university step done for invalid profile text", () => {
    const steps = getApplicantChecklistSteps({
      profile: { full_name: "Ali", university: "Not a real university xyz" },
      joinedChatCount: 0,
      universities: [{ id: 1, name: "TATU", short_name: "TATU" }],
    });

    expect(steps.find((step) => step.id === "university")?.done).toBe(false);
  });

  it("calculates progress summary", () => {
    const universities = [{ id: 1, name: "TATU", short_name: "TATU" }];
    const steps = getApplicantChecklistSteps({
      profile: { full_name: "Ali", university: "TATU" },
      joinedChatCount: 0,
      universities,
    });
    const progress = getApplicantChecklistProgress(steps);

    expect(progress.doneCount).toBe(2);
    expect(progress.totalCount).toBe(5);
    expect(progress.isComplete).toBe(false);
  });

  it("suggests three universities using profile university", () => {
    const universities = [
      { id: 1, name: "TATU", short_name: "TATU", average_rating: 4.2 },
      { id: 2, name: "TDTU", short_name: "TDTU", average_rating: 4.8 },
      { id: 3, name: "WIUT", short_name: "WIUT", average_rating: 4.0 },
    ];

    const suggestion = getCompareSuggestion(universities, "TATU");

    expect(suggestion?.universities).toHaveLength(3);
    expect(suggestion?.universities[0].id).toBe(1);
    expect(suggestion?.universities.map((u) => u.id).sort()).toEqual([1, 2, 3]);
  });

  it("returns null compare suggestion when fewer than three universities", () => {
    const universities = [
      { id: 1, name: "TATU", short_name: "TATU" },
      { id: 2, name: "TDTU", short_name: "TDTU" },
    ];
    expect(getCompareSuggestion(universities, "TATU")).toBeNull();
  });

  it("returns recent joined chats sorted by last message", () => {
    const joined = new Set([1, 2]);
    const universities = [
      {
        id: 1,
        short_name: "A",
        last_message: { created_at: "2026-01-01T10:00:00Z", text: "old" },
      },
      {
        id: 2,
        short_name: "B",
        last_message: { created_at: "2026-01-02T10:00:00Z", text: "new" },
      },
      { id: 3, short_name: "C" },
    ];

    const recent = getRecentJoinedChats(universities, joined, 2);

    expect(recent.map((item) => item.id)).toEqual([2, 1]);
  });
});
