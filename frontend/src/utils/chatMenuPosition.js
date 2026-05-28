const VIEWPORT_MARGIN = 8;

const HEART_TRIGGER_SIZE = 40;
const EXPANDED_PICKER_HEIGHT = 220;

export function clampContextMenuPosition(clientX, clientY, width, height) {
  let x = clientX;
  let y = clientY + 4;

  if (y + height > window.innerHeight - VIEWPORT_MARGIN) {
    y = clientY - height - 4;
  }
  if (x + width > window.innerWidth - VIEWPORT_MARGIN) {
    x = window.innerWidth - width - VIEWPORT_MARGIN;
  }

  return {
    x: Math.max(VIEWPORT_MARGIN, x),
    y: Math.max(VIEWPORT_MARGIN, y),
  };
}

export function getReactionPickerPosition(bubbleRect, isMine, expanded = false) {
  const barWidth = 48;
  const barHeight = expanded ? EXPANDED_PICKER_HEIGHT : HEART_TRIGGER_SIZE;
  const gap = 6;

  let top = bubbleRect.bottom - barHeight;
  top = Math.min(
    Math.max(VIEWPORT_MARGIN, top),
    window.innerHeight - barHeight - VIEWPORT_MARGIN
  );

  if (isMine) {
    return {
      top,
      left: Math.max(VIEWPORT_MARGIN, bubbleRect.left - barWidth - gap),
    };
  }

  return {
    top,
    left: Math.min(bubbleRect.right + gap, window.innerWidth - barWidth - VIEWPORT_MARGIN),
  };
}
