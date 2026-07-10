/**
 * Soft-keyboard bottom inset from the Visual Viewport API.
 * Formula used by production chat UIs (Telegram Web / WhatsApp-style):
 *   inset = layoutViewportHeight - visualViewport.height - visualViewport.offsetTop
 */
export function computeKeyboardInset(
  layoutViewportHeight,
  visualViewportHeight,
  visualViewportOffsetTop = 0
) {
  const layout = Number(layoutViewportHeight);
  const height = Number(visualViewportHeight);
  const offsetTop = Number(visualViewportOffsetTop) || 0;

  if (!Number.isFinite(layout) || !Number.isFinite(height) || layout <= 0 || height <= 0) {
    return 0;
  }

  return Math.max(0, Math.round(layout - height - offsetTop));
}

export const KEYBOARD_INSET_CSS_VAR = "--myuni-keyboard-inset";
export const KEYBOARD_OPEN_THRESHOLD_PX = 80;

export function isKeyboardOpenFromInset(insetPx, thresholdPx = KEYBOARD_OPEN_THRESHOLD_PX) {
  return Number(insetPx) >= thresholdPx;
}
