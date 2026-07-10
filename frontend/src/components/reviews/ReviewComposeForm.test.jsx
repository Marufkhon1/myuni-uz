import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ReviewComposeForm from "./ReviewComposeForm.jsx";
import {
  PROFANITY_REJECTION_MESSAGE,
  REVIEW_REWRITE_CTA_LABEL,
} from "@/content/reviewModerationCopy.js";

const LONG_CLEAN =
  "O'qish muhiti yaxshi, ustozlar yordam beradi va kutubxona qulay joylashgan.";

function renderForm(props = {}) {
  return render(
    <MemoryRouter>
      <ReviewComposeForm
        title="Sharh"
        subtitle="Tajribangizni yozing"
        placeholder="Matn..."
        rating={5}
        onRatingChange={vi.fn()}
        aspectRatings={{
          rating_teachers: 5,
          rating_dormitory: 4,
          rating_infrastructure: 4,
        }}
        onAspectChange={vi.fn()}
        reviewText={LONG_CLEAN}
        onReviewTextChange={vi.fn()}
        isSubmitting={false}
        onSubmit={(event) => event.preventDefault()}
        {...props}
      />
    </MemoryRouter>
  );
}

describe("ReviewComposeForm Step 6", () => {
  it("shows red moderation error and rewrite CTA", async () => {
    const user = userEvent.setup();
    renderForm({ submitError: PROFANITY_REJECTION_MESSAGE });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/moderatsiyadan o'tmadi/i);
    expect(within(alert).getByRole("button", { name: REVIEW_REWRITE_CTA_LABEL })).toBeInTheDocument();

    const textarea = screen.getByRole("textbox", { name: /sharh matni/i });
    expect(textarea).toHaveAttribute("aria-invalid", "true");

    await user.click(screen.getByRole("button", { name: REVIEW_REWRITE_CTA_LABEL }));
    expect(textarea).toHaveFocus();
  });

  it("does not mark text step ready while submit error is visible", () => {
    renderForm({ submitError: PROFANITY_REJECTION_MESSAGE });

    // Stepper chip for "Matn" should not show as completed (no emerald "Tayyor" in that chip alone —
    // section status for Sharh matni must say Kerak).
    const headings = screen.getAllByRole("heading", { level: 4 });
    const textSectionTitle = headings.find((node) => node.textContent === "Sharh matni");
    expect(textSectionTitle).toBeTruthy();
    const section = textSectionTitle.closest("section");
    expect(within(section).getByText("Kerak")).toBeInTheDocument();

    const submit = screen.getByRole("button", { name: /sharhni yuborish/i });
    expect(submit).toBeDisabled();
  });
});
