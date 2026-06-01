import { describe, expect, it, vi } from "vitest";
import { getPublicRecentReviews, unwrapUniversityList } from "../services/publicService.js";

vi.mock("../services/api.js", () => ({
  api: {
    get: vi.fn(async (url, config) => {
      if (url === "/public/reviews/recent/") {
        return { data: [{ id: 1, limit: config?.params?.limit }] };
      }
      return { data: {} };
    }),
  },
}));

describe("publicService catalog helpers", () => {  it("unwrapUniversityList supports legacy array responses", () => {
    const legacy = [{ id: 1, name: "A" }];
    expect(unwrapUniversityList(legacy)).toEqual(legacy);
  });

  it("unwrapUniversityList reads results from paginated responses", () => {
    expect(
      unwrapUniversityList({
        count: 1,
        results: [{ id: 2, name: "B" }],
      })
    ).toEqual([{ id: 2, name: "B" }]);
  });

  it("getPublicRecentReviews accepts numeric limit shorthand", async () => {
    const data = await getPublicRecentReviews(12);
    expect(data[0].limit).toBe(12);
  });
});