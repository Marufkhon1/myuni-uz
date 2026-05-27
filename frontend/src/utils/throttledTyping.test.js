import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createThrottledTyping } from "./throttledTyping.js";

describe("createThrottledTyping", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throttles repeated calls within the interval", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const notify = createThrottledTyping(send, { intervalMs: 3000 });

    notify();
    notify();
    notify();

    await vi.runAllTimersAsync();
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("calls onError when send fails", async () => {
    const send = vi.fn().mockRejectedValue(new Error("network"));
    const onError = vi.fn();
    const notify = createThrottledTyping(send, { intervalMs: 0, onError, errorCooldownMs: 0 });

    notify();
    await vi.runAllTimersAsync();

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "network" }));
  });

  it("limits repeated onError within error cooldown", async () => {
    const send = vi.fn().mockRejectedValue(new Error("fail"));
    const onError = vi.fn();
    const notify = createThrottledTyping(send, { intervalMs: 0, onError, errorCooldownMs: 5000 });

    notify();
    await vi.runAllTimersAsync();
    vi.advanceTimersByTime(100);
    notify();
    await vi.runAllTimersAsync();

    expect(onError).toHaveBeenCalledTimes(1);
  });
});
