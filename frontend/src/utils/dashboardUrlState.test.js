import { describe, expect, it } from "vitest";
import {
  applyChatUrlState,
  applyDashboardUrlState,
  applyReviewsUrlState,
  buildDeepLinkKey,
  resolveActiveSection,
  resolveChatUrlState,
  resolveDashboardUrlState,
  resolveReviewsUrlState,
} from "@/utils/dashboardUrlState.js";

const universities = [
  { id: 1, name: "Toshkent davlat iqtisodiyot universiteti", short_name: "TSUE", slug: "tsue" },
  { id: 2, name: "Alfraganus universiteti", short_name: "Alfraganus", slug: "alfraganus" },
];

function makeSearchParams(values = {}) {
  return {
    get: (key) => values[key] ?? null,
  };
}

describe("resolveActiveSection", () => {
  it("prefers path section over legacy query", () => {
    expect(
      resolveActiveSection(makeSearchParams({ section: "home" }), "reviews", "/applicant/reviews")
    ).toBe("reviews");
  });

  it("maps reports panel to profile", () => {
    expect(resolveActiveSection(makeSearchParams({ panel: "reports" }), null, "/applicant/home")).toBe(
      "profile"
    );
  });
});

describe("buildDeepLinkKey", () => {
  it("joins deep-link params into a stable key", () => {
    expect(
      buildDeepLinkKey(
        makeSearchParams({
          section: "chats",
          university_id: "1",
          chat_panel: "group",
        })
      )
    ).toBe("chats|1||group||");
  });
});

describe("resolveDashboardUrlState", () => {
  it("selects reviews university from valid university_id", () => {
    const state = resolveDashboardUrlState({
      section: "reviews",
      universityIdParam: "1",
      universityName: null,
      chatPanel: null,
      threadIdParam: null,
      universities,
    });

    expect(state.reviews).toEqual({
      type: "select_university",
      reviewUniversity: "1",
      mobileReviewScreen: "detail",
    });
    expect(state.chat.type).toBe("leave_chats_section");
  });

  it("clears reviews selection for invalid university_id when list is loaded", () => {
    const state = resolveDashboardUrlState({
      section: "reviews",
      universityIdParam: "999",
      universityName: null,
      chatPanel: null,
      threadIdParam: null,
      universities,
    });

    expect(state.reviews).toEqual({
      type: "invalid_university_param",
      reviewUniversity: "",
      mobileReviewScreen: "list",
    });
  });

  it("preserves in-app reviews selection when URL has no university param", () => {
    const state = resolveDashboardUrlState({
      section: "reviews",
      universityIdParam: null,
      universityName: null,
      chatPanel: null,
      threadIdParam: null,
      universities,
    });

    expect(state.reviews).toEqual({ type: "preserve" });
  });

  it("opens group chat for valid university_id", () => {
    const state = resolveDashboardUrlState({
      section: "chats",
      universityIdParam: "2",
      universityName: null,
      chatPanel: "group",
      threadIdParam: null,
      universities,
    });

    expect(state.chat).toEqual({
      type: "group_university",
      selectedUniversityId: 2,
      chatPanel: "group",
      selectedThreadId: null,
      mobileChatScreen: "chat",
    });
  });

  it("clears chat selection for invalid university_id when list is loaded", () => {
    const state = resolveDashboardUrlState({
      section: "chats",
      universityIdParam: "404",
      universityName: null,
      chatPanel: "group",
      threadIdParam: null,
      universities,
    });

    expect(state.chat).toEqual({
      type: "invalid_university_param",
      selectedUniversityId: null,
      selectedThreadId: null,
      chatPanel: "group",
      mobileChatScreen: "list",
    });
  });

  it("preserves in-app chat selection without university param", () => {
    const state = resolveDashboardUrlState({
      section: "chats",
      universityIdParam: null,
      universityName: null,
      chatPanel: "group",
      threadIdParam: null,
      universities,
    });

    expect(state.chat).toEqual({ type: "preserve" });
  });

  it("does not clear invalid university while universities are still loading", () => {
    const state = resolveDashboardUrlState({
      section: "reviews",
      universityIdParam: "999",
      universityName: null,
      chatPanel: null,
      threadIdParam: null,
      universities: [],
    });

    expect(state.reviews).toEqual({ type: "preserve" });
    expect(state.chat.type).toBe("leave_chats_section");
  });
});

describe("applyChatUrlState", () => {
  it("applies group university patch to setters", () => {
    const calls = {
      selectedUniversityId: null,
      selectedThreadId: undefined,
      chatPanel: null,
      mobileChatScreen: null,
    };

    applyChatUrlState(
      resolveChatUrlState({
        section: "chats",
        chatPanel: "group",
        threadIdParam: null,
        match: universities[0],
        hasUniversityParam: true,
        canValidateUniversity: true,
      }),
      {
        setSelectedUniversityId: (value) => {
          calls.selectedUniversityId = value;
        },
        setSelectedThreadId: (value) => {
          calls.selectedThreadId = value;
        },
        setChatPanel: (value) => {
          calls.chatPanel = value;
        },
        setMobileChatScreen: (value) => {
          calls.mobileChatScreen = value;
        },
      }
    );

    expect(calls).toEqual({
      selectedUniversityId: 1,
      selectedThreadId: null,
      chatPanel: "group",
      mobileChatScreen: "chat",
    });
  });
});

describe("applyReviewsUrlState", () => {
  it("skips setter calls when patch is preserve", () => {
    let called = false;

    applyReviewsUrlState(
      resolveReviewsUrlState({
        section: "reviews",
        match: null,
        hasUniversityParam: false,
        canValidateUniversity: true,
      }),
      {
        setReviewUniversity: () => {
          called = true;
        },
        setMobileReviewScreen: () => {
          called = true;
        },
      }
    );

    expect(called).toBe(false);
  });
});

describe("applyDashboardUrlState", () => {
  it("does not override chat list tab when URL has no deep-link params", () => {
    const calls = {
      chatListTab: "joined",
      chatPanel: "group",
      selectedThreadId: 42,
    };

    applyDashboardUrlState({
      section: "chats",
      universityIdParam: null,
      universityName: null,
      chatPanel: null,
      threadIdParam: null,
      universities,
      chatSetters: {
        setSelectedUniversityId: () => {},
        setSelectedThreadId: (value) => {
          calls.selectedThreadId = value;
        },
        setChatPanel: (value) => {
          calls.chatPanel = value;
        },
        setMobileChatScreen: () => {},
        setChatListTab: (value) => {
          calls.chatListTab = value;
        },
      },
      reviewSetters: {
        setReviewUniversity: () => {},
        setMobileReviewScreen: () => {},
      },
    });

    expect(calls).toEqual({
      chatListTab: "joined",
      chatPanel: "group",
      selectedThreadId: 42,
    });
  });

  it("applies private thread deep-link from URL", () => {
    const calls = {
      chatListTab: "search",
      chatPanel: "group",
      selectedThreadId: null,
      mobileChatScreen: "list",
    };

    applyDashboardUrlState({
      section: "chats",
      universityIdParam: null,
      universityName: null,
      chatPanel: "private",
      threadIdParam: "7",
      universities,
      chatSetters: {
        setSelectedUniversityId: () => {},
        setSelectedThreadId: (value) => {
          calls.selectedThreadId = value;
        },
        setChatPanel: (value) => {
          calls.chatPanel = value;
        },
        setMobileChatScreen: (value) => {
          calls.mobileChatScreen = value;
        },
        setChatListTab: (value) => {
          calls.chatListTab = value;
        },
      },
      reviewSetters: {
        setReviewUniversity: () => {},
        setMobileReviewScreen: () => {},
      },
    });

    expect(calls).toEqual({
      chatListTab: "private",
      chatPanel: "private",
      selectedThreadId: 7,
      mobileChatScreen: "chat",
    });
  });
});
