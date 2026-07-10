import { describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach } from "vitest";
import ChatSuggestedPrompts from "./ChatSuggestedPrompts.jsx";
import { GROUP_CHAT_SUGGESTED_PROMPTS } from "@/utils/chatSuggestedPrompts.js";

afterEach(() => {
  cleanup();
});

describe("ChatSuggestedPrompts", () => {
  it("renders Unibuddy-style prompts and selects one into the callback", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ChatSuggestedPrompts prompts={GROUP_CHAT_SUGGESTED_PROMPTS.slice(0, 2)} onSelect={onSelect} />
    );

    expect(screen.getByTestId("chat-suggested-prompts")).toBeInTheDocument();
    expect(screen.getByText(/Tezkor savollar/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: GROUP_CHAT_SUGGESTED_PROMPTS[0] }));
    expect(onSelect).toHaveBeenCalledWith(GROUP_CHAT_SUGGESTED_PROMPTS[0]);
  });

  it("renders nothing without prompts", () => {
    const { container } = render(<ChatSuggestedPrompts prompts={[]} onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
