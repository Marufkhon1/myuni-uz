/** Telegram uslubidagi chat ranglari — profildan tanlanadi yoki avtomatik */
export { getNameInitials } from "./profileName.js";

export const CHAT_COLOR_OPTIONS = [
  { id: "pink", hex: "#e5659a", className: "text-[#e5659a]", label: "Pushti" },
  { id: "cyan", hex: "#5ad8f2", className: "text-[#5ad8f2]", label: "Moviy" },
  { id: "blue", hex: "#7b8efc", className: "text-[#7b8efc]", label: "Ko'k" },
  { id: "orange", hex: "#f5a623", className: "text-[#f5a623]", label: "Sariq" },
  { id: "green", hex: "#56d364", className: "text-[#56d364]", label: "Yashil" },
  { id: "purple", hex: "#c77dff", className: "text-[#c77dff]", label: "Binafsha" },
  { id: "coral", hex: "#ff8a65", className: "text-[#ff8a65]", label: "Somon" },
  { id: "teal", hex: "#4dd0e1", className: "text-[#4dd0e1]", label: "Ko'k-yashil" },
  { id: "rose", hex: "#f48fb1", className: "text-[#f48fb1]", label: "Qizg' pushti" },
  { id: "mint", hex: "#81c784", className: "text-[#81c784]", label: "Och yashil" },
];

const COLOR_CLASS_BY_ID = Object.fromEntries(
  CHAT_COLOR_OPTIONS.map((option) => [option.id, option.className])
);

const FALLBACK_CLASSES = CHAT_COLOR_OPTIONS.map((option) => option.className);

export function getAuthorColorClass(userId, colorKey) {
  if (colorKey && COLOR_CLASS_BY_ID[colorKey]) {
    return COLOR_CLASS_BY_ID[colorKey];
  }
  const numericId = Number(userId);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return "text-primary";
  }
  return FALLBACK_CLASSES[Math.abs(numericId) % FALLBACK_CLASSES.length];
}

export function getColorOption(colorKey) {
  return CHAT_COLOR_OPTIONS.find((option) => option.id === colorKey) ?? null;
}

export function getAuthorColorHex(userId, colorKey) {
  const option = getColorOption(colorKey);
  if (option) {
    return option.hex;
  }
  const numericId = Number(userId);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return CHAT_COLOR_OPTIONS[2]?.hex ?? "#7b8efc";
  }
  return CHAT_COLOR_OPTIONS[Math.abs(numericId) % CHAT_COLOR_OPTIONS.length].hex;
}
