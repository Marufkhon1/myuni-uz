import { describe, expect, it } from "vitest";
import { pickActiveTyper, sortTypingQueue } from "./typingQueue.js";

describe("sortTypingQueue", () => {
  it("orders typers by first typing time", () => {
    const users = [
      { id: 2, name: "Maruf", at: "2026-05-29T10:00:02Z" },
      { id: 1, name: "Lola", at: "2026-05-29T10:00:01Z" },
      { id: 3, name: "Denik", at: "2026-05-29T10:00:03Z" },
    ];

    expect(sortTypingQueue(users).map((item) => item.name)).toEqual(["Lola", "Maruf", "Denik"]);
  });
});

describe("pickActiveTyper", () => {
  const users = [
    { id: 1, name: "Lola", at: "2026-05-29T10:00:01Z" },
    { id: 2, name: "Maruf", at: "2026-05-29T10:00:02Z" },
  ];

  it("keeps preferred typer when still active", () => {
    const result = pickActiveTyper(users, 1);
    expect(result.typer.name).toBe("Maruf");
    expect(result.index).toBe(1);
  });

  it("falls back to first typer when preferred left", () => {
    const result = pickActiveTyper([users[0]], 1);
    expect(result.typer.name).toBe("Lola");
    expect(result.index).toBe(0);
  });
});
