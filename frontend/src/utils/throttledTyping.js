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
