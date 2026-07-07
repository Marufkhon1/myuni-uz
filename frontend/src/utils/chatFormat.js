export function formatChatMessageTime(value) {
  return new Date(value).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
