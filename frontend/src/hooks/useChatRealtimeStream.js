import { isChatWebSocketEnabled } from "@/utils/chatRealtimeUrls.js";
import { useChatWebSocketStream } from "./useChatWebSocketStream.js";
import { useMessageStream } from "./useMessageStream.js";

export function useChatRealtimeStream(options) {
  const useWebSocket = isChatWebSocketEnabled();
  const sse = useMessageStream({ ...options, enabled: options.enabled && !useWebSocket });
  const websocket = useChatWebSocketStream({ ...options, enabled: options.enabled && useWebSocket });

  return useWebSocket ? websocket : sse;
}
