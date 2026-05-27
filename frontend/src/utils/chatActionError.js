const CHAT_ERROR_DISPLAY_MS = 8000;

export function createChatErrorReporter(setChatError) {
  let timerId = null;

  function clearChatError() {
    if (timerId !== null) {
      window.clearTimeout(timerId);
      timerId = null;
    }
    setChatError("");
  }

  function reportChatError(message) {
    if (!message) {
      clearChatError();
      return;
    }
    setChatError(message);
    if (timerId !== null) {
      window.clearTimeout(timerId);
    }
    timerId = window.setTimeout(() => {
      timerId = null;
      setChatError("");
    }, CHAT_ERROR_DISPLAY_MS);
  }

  return { reportChatError, clearChatError };
}
