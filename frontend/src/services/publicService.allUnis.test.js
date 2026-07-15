import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAllPublicUniversities, getPublicUniversities } from "./publicService.js";

vi.mock("./api.js", () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from "./api.js";

describe("getAllPublicUniversities", () => {
  beforeEach(() => {
    api.get.mockReset();
  });

  it("pages through all catalog pages up to total_pages", async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          count: 3,
          page: 1,
          page_size: 2,
          total_pages: 2,
          results: [{ id: 1 }, { id: 2 }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          count: 3,
          page: 2,
          page_size: 2,
          total_pages: 2,
          results: [{ id: 3 }],
        },
      });

    const data = await getAllPublicUniversities({ sort: "rating", page_size: 2 });
    expect(data.results).toHaveLength(3);
    expect(data.count).toBe(3);
    expect(api.get).toHaveBeenCalledTimes(2);
    expect(api.get).toHaveBeenNthCalledWith(
      1,
      "/public/universities/",
      expect.objectContaining({ params: expect.objectContaining({ page: 1, page_size: 2 }) })
    );
  });

  it("getPublicUniversities still returns a single page", async () => {
    api.get.mockResolvedValue({
      data: { count: 50, page: 1, page_size: 24, total_pages: 3, results: [{ id: 1 }] },
    });
    const data = await getPublicUniversities({ page: 1 });
    expect(data.results).toHaveLength(1);
    expect(data.total_pages).toBe(3);
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});
