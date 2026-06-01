/**
 * Throttles typing API calls and surfaces failures via onError (at most once per errorCooldownMs).
 */
export function createThrottledTyping(sendTyping, { intervalMs = 3000, onError, errorCooldownMs = 12000 } = {}) {
  let lastSentAt = 0;
  let lastErrorShownAt = 0;

  return function notifyTyping() {
    const now = Date.now();
    if (now - lastSentAt < intervalMs) {
      return;
    }
    lastSentAt = now;

    Promise.resolve(sendTyping()).catch((error) => {
      if (!onError) {
        return;
      }
      if (now - lastErrorShownAt < errorCooldownMs) {
        return;
      }
      lastErrorShownAt = now;
      onError(error);
    });
  };
}

/**
 * Faqat foydalanuvchi yozayotganda typing yuboradi; to'xtasa yuborish ham to'xtaydi.
 */
export function createActiveTypingNotifier(
  sendTyping,
  { intervalMs = 2000, idleMs = 2200, onError, errorCooldownMs = 12000 } = {}
) {
  let lastSentAt = 0;
  let lastActivityAt = 0;
  let lastErrorShownAt = 0;
  let pulseTimer = null;

  function clearPulse() {
    if (pulseTimer) {
      window.clearTimeout(pulseTimer);
      pulseTimer = null;
    }
  }

  function reportError(error) {
    if (!onError) {
      return;
    }
    const now = Date.now();
    if (now - lastErrorShownAt < errorCooldownMs) {
      return;
    }
    lastErrorShownAt = now;
    onError(error);
  }

  function sendTypingNow() {
    lastSentAt = Date.now();
    Promise.resolve(sendTyping()).catch(reportError);
  }

  function schedulePulse() {
    clearPulse();
    pulseTimer = window.setTimeout(() => {
      const now = Date.now();
      if (now - lastActivityAt > idleMs) {
        clearPulse();
        return;
      }
      if (now - lastSentAt >= intervalMs) {
        sendTypingNow();
      }
      schedulePulse();
    }, intervalMs);
  }

  return function notifyTypingActivity() {
    const now = Date.now();
    lastActivityAt = now;
    if (now - lastSentAt >= intervalMs) {
      sendTypingNow();
    }
    schedulePulse();
  };
}
