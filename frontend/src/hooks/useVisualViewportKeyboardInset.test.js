import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVisualViewportKeyboardInset } from "./useVisualViewportKeyboardInset.js";
import { KEYBOARD_INSET_CSS_VAR } from "@/utils/visualViewportKeyboard.js";

describe("useVisualViewportKeyboardInset", () => {
  let listeners;

  beforeEach(() => {
    listeners = { resize: new Set(), scroll: new Set() };
    vi.stubGlobal("requestAnimationFrame", (cb) => {
      cb();
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 800,
    });

    const vv = {
      height: 800,
      offsetTop: 0,
      addEventListener: (type, handler) => listeners[type]?.add(handler),
      removeEventListener: (type, handler) => listeners[type]?.delete(handler),
    };
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      writable: true,
      value: vv,
    });
  });

  afterEach(() => {
    document.documentElement.style.removeProperty(KEYBOARD_INSET_CSS_VAR);
    document.documentElement.removeAttribute("data-myuni-keyboard-open");
    vi.unstubAllGlobals();
  });

  it("writes CSS var and data attribute when keyboard opens", () => {
    const { result } = renderHook(() =>
      useVisualViewportKeyboardInset(true, { syncDocumentCssVar: true })
    );
    expect(result.current.keyboardInsetPx).toBe(0);

    act(() => {
      window.visualViewport.height = 500;
      window.visualViewport.offsetTop = 0;
      listeners.resize.forEach((handler) => handler());
    });

    expect(result.current.keyboardInsetPx).toBe(300);
    expect(result.current.isKeyboardOpen).toBe(true);
    expect(document.documentElement.style.getPropertyValue(KEYBOARD_INSET_CSS_VAR)).toBe("300px");
    expect(document.documentElement.getAttribute("data-myuni-keyboard-open")).toBe("true");
  });

  it("clears CSS var when disabled", () => {
    const { rerender } = renderHook(
      ({ enabled }) => useVisualViewportKeyboardInset(enabled, { syncDocumentCssVar: true }),
      { initialProps: { enabled: true } }
    );

    act(() => {
      window.visualViewport.height = 480;
      listeners.resize.forEach((handler) => handler());
    });

    rerender({ enabled: false });
    expect(document.documentElement.style.getPropertyValue(KEYBOARD_INSET_CSS_VAR)).toBe("");
    expect(document.documentElement.hasAttribute("data-myuni-keyboard-open")).toBe(false);
  });

  it("can observe without owning the document CSS var", () => {
    const { result } = renderHook(() =>
      useVisualViewportKeyboardInset(true, { syncDocumentCssVar: false })
    );

    act(() => {
      window.visualViewport.height = 520;
      listeners.resize.forEach((handler) => handler());
    });

    expect(result.current.keyboardInsetPx).toBe(280);
    expect(document.documentElement.style.getPropertyValue(KEYBOARD_INSET_CSS_VAR)).toBe("");
  });
});
