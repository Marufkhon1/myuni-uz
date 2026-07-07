import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ChatComposeEditBar from "./ChatComposeEditBar.jsx";

describe("ChatComposeEditBar", () => {
  it("shows preview and calls onCancel", () => {
    const onCancel = vi.fn();
    render(<ChatComposeEditBar preview="Eski matn" onCancel={onCancel} />);
    expect(screen.getByText("Xabarni tahrirlash")).toBeInTheDocument();
    expect(screen.getByText("Eski matn")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /bekor qilish/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
