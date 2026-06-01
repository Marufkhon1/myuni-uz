import { describe, expect, it } from "vitest";
import { getFocusableElements } from "../hooks/useFocusTrap.js";

describe("getFocusableElements", () => {
  it("returns visible interactive elements in tab order", () => {
    document.body.innerHTML = `
      <div id="modal">
        <button type="button">Birinchi</button>
        <a href="#next">Link</a>
        <button type="button" disabled>Yopiq</button>
        <input type="hidden" />
        <button type="button">Oxirgi</button>
      </div>
    `;

    const modal = document.getElementById("modal");
    const focusables = getFocusableElements(modal);

    expect(focusables).toHaveLength(3);
    expect(focusables[0].textContent).toBe("Birinchi");
    expect(focusables[2].textContent).toBe("Oxirgi");
  });
});
