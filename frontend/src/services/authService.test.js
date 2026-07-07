import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();
const clearTokensMock = vi.fn();
const dispatchAuthLogoutMock = vi.fn();

vi.mock("./api.js", () => ({
  api: {
    post: (...args) => postMock(...args),
  },
}));

vi.mock("../utils/authStorage.js", () => ({
  clearTokens: () => clearTokensMock(),
  getAccessToken: () => null,
  getRefreshToken: () => null,
  markCookieSession: () => {},
}));

vi.mock("../utils/authEvents.js", () => ({
  dispatchAuthLogout: () => dispatchAuthLogoutMock(),
}));

describe("logoutSession", () => {
  beforeEach(() => {
    postMock.mockReset();
    clearTokensMock.mockReset();
    dispatchAuthLogoutMock.mockReset();
  });

  it("clears local session even when logout API fails", async () => {
    postMock.mockRejectedValueOnce(new Error("network"));

    const { logoutSession } = await import("./authService.js");
    await expect(logoutSession()).resolves.toBeUndefined();

    expect(dispatchAuthLogoutMock).toHaveBeenCalledTimes(1);
    expect(postMock).toHaveBeenCalledWith("/auth/logout/", null, { timeout: 8000 });
    expect(clearTokensMock).toHaveBeenCalledTimes(1);
  });

  it("dispatches logout event and clears tokens on success", async () => {
    postMock.mockResolvedValueOnce({ data: { detail: "Chiqildi." } });

    const { logoutSession } = await import("./authService.js");
    await logoutSession();

    expect(dispatchAuthLogoutMock).toHaveBeenCalledTimes(1);
    expect(clearTokensMock).toHaveBeenCalledTimes(1);
  });
});
