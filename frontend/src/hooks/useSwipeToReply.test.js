import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSwipeToReply } from "./useSwipeToReply.js";

function touch(x, y = 0) {
  return { touches: [{ clientX: x, clientY: y }] };
}

describe("useSwipeToReply", () => {
  it("fires onReply after a right swipe past the threshold", () => {
    const onReply = vi.fn();
    const { result } = renderHook(() => useSwipeToReply({ enabled: true, onReply }));

    act(() => {
      result.current.handlers.onTouchStart(touch(10, 10));
      result.current.handlers.onTouchMove(touch(40, 12));
      result.current.handlers.onTouchMove(touch(90, 14));
    });
    expect(result.current.offsetX).toBeGreaterThanOrEqual(64);

    act(() => {
      result.current.handlers.onTouchEnd();
    });
    expect(onReply).toHaveBeenCalledTimes(1);
    expect(result.current.offsetX).toBe(0);
  });

  it("ignores mostly-vertical pans", () => {
    const onReply = vi.fn();
    const { result } = renderHook(() => useSwipeToReply({ enabled: true, onReply }));

    act(() => {
      result.current.handlers.onTouchStart(touch(10, 10));
      result.current.handlers.onTouchMove(touch(20, 80));
      result.current.handlers.onTouchEnd();
    });
    expect(onReply).not.toHaveBeenCalled();
  });
});
