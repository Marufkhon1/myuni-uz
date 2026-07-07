import { useCallback, useEffect, useRef } from "react";

export function useDashboardChatBridges() {
  const getThreadTypingUsersRef = useRef(() => []);
  const groupMessageCreatedBridgeRef = useRef(() => {});
  const privateMessageCreatedBridgeRef = useRef(() => {});

  const onGroupMessageCreatedBridge = useCallback((created) => {
    groupMessageCreatedBridgeRef.current(created);
  }, []);

  const onPrivateMessageCreatedBridge = useCallback((created) => {
    privateMessageCreatedBridgeRef.current(created);
  }, []);

  return {
    getThreadTypingUsersRef,
    onGroupMessageCreatedBridge,
    onPrivateMessageCreatedBridge,
    groupMessageCreatedBridgeRef,
    privateMessageCreatedBridgeRef,
  };
}

export function useDashboardChatBridgeSync({
  groupMessageCreatedBridgeRef,
  privateMessageCreatedBridgeRef,
  getThreadTypingUsersRef,
  getThreadTypingUsers,
  onGroupMessageCreated,
  onPrivateMessageCreated,
}) {
  useEffect(() => {
    getThreadTypingUsersRef.current = getThreadTypingUsers;
  }, [getThreadTypingUsers, getThreadTypingUsersRef]);

  useEffect(() => {
    groupMessageCreatedBridgeRef.current = onGroupMessageCreated;
    privateMessageCreatedBridgeRef.current = onPrivateMessageCreated;
  }, [
    groupMessageCreatedBridgeRef,
    privateMessageCreatedBridgeRef,
    onGroupMessageCreated,
    onPrivateMessageCreated,
  ]);
}
