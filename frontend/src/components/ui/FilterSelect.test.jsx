import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FilterSelect from "./FilterSelect.jsx";

describe("FilterSelect", () => {
  it("opens menu and selects an option", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <FilterSelect
        label="Shahar"
        icon="city"
        value=""
        onChange={handleChange}
        options={[
          { value: "", label: "Barcha shaharlar" },
          { value: "Toshkent", label: "Toshkent" },
        ]}
      />
    );

    expect(screen.getByRole("button", { name: /shahar/i })).toHaveTextContent("Barcha shaharlar");

    await user.click(screen.getByRole("button", { name: /shahar/i }));
    await user.pointer({ keys: "[MouseLeft>]", target: screen.getByRole("option", { name: "Toshkent" }) });

    expect(handleChange).toHaveBeenCalledWith("Toshkent");
  });
});
