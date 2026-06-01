import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ReviewsSection from "./ReviewsSection.jsx";

vi.mock("../hooks/useToast.js", () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn(),
  }),
}));

vi.mock("./ui/FilterSelect.jsx", () => ({
  default: ({ label, onChange }) => (
    <button type="button" onClick={() => onChange(label === "Baho" ? "5" : "")}>
      {label}
    </button>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    article: ({ children, ...props }) => <article {...props}>{children}</article>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

const getPublicRecentReviews = vi.fn(async (params) => {
  if (params?.min_rating === "5" && params?.max_rating === "5") {
    return [{ id: 99, author: "Filtrlangan", rating: 5, text: "Test sharh" }];
  }
  return [{ id: 1, author: "Barchasi", rating: 4, text: "Oddiy sharh" }];
});

vi.mock("../services/publicService.js", () => ({
  getPublicReviewFilters: vi.fn(async () => ({
    cities: ["Toshkent"],
    directions: [{ id: 1, name: "IT" }],
    sort_options: [{ id: "newest", label: "Eng yangi" }],
  })),
  getPublicRecentReviews: (...args) => getPublicRecentReviews(...args),
}));

describe("ReviewsSection filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reloads reviews when rating filter changes", async () => {
    const user = userEvent.setup();
    render(<ReviewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Oddiy sharh")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Baho" }));

    await waitFor(() => {
      expect(getPublicRecentReviews).toHaveBeenLastCalledWith(
        expect.objectContaining({ min_rating: "5", max_rating: "5", sort: "newest", limit: 6 })
      );
      expect(screen.getByText("Test sharh")).toBeInTheDocument();
    });
  });
});
