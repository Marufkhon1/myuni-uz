const CHAT_ERROR_DISPLAY_MS = 8000;

export function createChatErrorReporter(showError) {
  let timerId = null;
  let lastMessage = "";

  function clearChatError() {
    if (timerId !== null) {
      window.clearTimeout(timerId);
      timerId = null;
    }
    lastMessage = "";
  }

  function reportChatError(message) {
    if (!message) {
      clearChatError();
      return;
    }

    if (message === lastMessage) {
      return;
    }

    lastMessage = message;
    showError(message, { duration: CHAT_ERROR_DISPLAY_MS });
  }

  return { reportChatError, clearChatError };
}
