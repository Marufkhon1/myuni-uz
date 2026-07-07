import { describe, expect, it } from "vitest";
import { resolveActiveChatMembers } from "@/utils/chatMembers.js";

describe("resolveActiveChatMembers", () => {
  it("returns empty state outside group chat", () => {
    expect(
      resolveActiveChatMembers({
        selectedUniversityId: 1,
        chatPanel: "private",
        chatMembers: { universityId: 1, members: [{ id: 1 }], member_count: 3 },
        displayedGroupUniversity: { id: 1, member_count: 3 },
      })
    ).toEqual({ members: [], member_count: 0 });
  });

  it("uses displayed university count when members belong to another chat", () => {
    expect(
      resolveActiveChatMembers({
        selectedUniversityId: 2,
        chatPanel: "group",
        chatMembers: { universityId: 1, members: [{ id: 1 }], member_count: 99 },
        displayedGroupUniversity: { id: 2, member_count: 12 },
      })
    ).toEqual({ members: [], member_count: 12 });
  });

  it("keeps loaded members for the selected university", () => {
    expect(
      resolveActiveChatMembers({
        selectedUniversityId: 2,
        chatPanel: "group",
        chatMembers: {
          universityId: 2,
          members: [{ id: 10 }, { id: 11 }],
          member_count: 2,
        },
        displayedGroupUniversity: { id: 2, member_count: 12 },
      })
    ).toEqual({
      members: [{ id: 10 }, { id: 11 }],
      member_count: 2,
    });
  });

  it("falls back to displayed count when loaded count is zero", () => {
    expect(
      resolveActiveChatMembers({
        selectedUniversityId: 2,
        chatPanel: "group",
        chatMembers: { universityId: 2, members: [], member_count: 0 },
        displayedGroupUniversity: { id: 2, member_count: 8 },
      })
    ).toEqual({ members: [], member_count: 8 });
  });
});
