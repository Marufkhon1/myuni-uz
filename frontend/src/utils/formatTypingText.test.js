import { describe, expect, it } from "vitest";
import {
  estimateTypingMaxChars,
  formatGroupTypingDisplay,
  formatPrivateTypingText,
} from "./formatTypingText.js";

describe("formatPrivateTypingText", () => {
  it("returns fixed private label", () => {
    expect(formatPrivateTypingText()).toBe("Yozmoqda");
  });
});

describe("formatGroupTypingDisplay", () => {
  const users = [
    { id: 1, name: "Lola", color: "blue" },
    { id: 2, name: "Maruf", color: "green" },
    { id: 3, name: "Denik", color: "red" },
    { id: 4, name: "Ali", color: "yellow" },
  ];

  it("shows all names when they fit", () => {
    const result = formatGroupTypingDisplay(users, 120);
    expect(result.visible.map((item) => item.name)).toEqual(["Lola", "Maruf", "Denik", "Ali"]);
    expect(result.hiddenCount).toBe(0);
  });

  it("truncates with hidden count when names do not fit", () => {
    const result = formatGroupTypingDisplay(users, 31);
    expect(result.visible.map((item) => item.name)).toEqual(["Lola"]);
    expect(result.hiddenCount).toBe(3);
  });

  it("shows single name when only one user is typing", () => {
    const result = formatGroupTypingDisplay([users[0]], 30);
    expect(result.visible).toEqual([users[0]]);
    expect(result.hiddenCount).toBe(0);
  });
});

describe("estimateTypingMaxChars", () => {
  it("derives char budget from container width", () => {
    expect(estimateTypingMaxChars(0)).toBe(48);
    expect(estimateTypingMaxChars(300)).toBe(40);
  });
});
