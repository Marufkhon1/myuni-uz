import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ReviewCard from "./ReviewCard.jsx";

const baseItem = {
  id: 1,
  author: "Test User",
  author_role: "student",
  rating: 4,
  text: "Yaxshi universitet",
  created_at: "2026-01-15T10:00:00Z",
  like_count: 2,
  liked_by_me: false,
  status: "approved",
  is_mine: true,
};

describe("ReviewCard", () => {
  it("renders review text and like button", () => {
    render(<ReviewCard item={baseItem} onLike={vi.fn()} />);
    expect(screen.getByText("Yaxshi universitet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Yoqdi/i })).toBeInTheDocument();
  });

  it("calls onDelete for own review", () => {
    const onDelete = vi.fn();
    render(<ReviewCard item={baseItem} onLike={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /O['']chirish/i }));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("shows pending status badge", () => {
    render(<ReviewCard item={{ ...baseItem, status: "pending", is_mine: false }} onLike={vi.fn()} />);
    expect(screen.getByText(/Ko['']rib chiqilmoqda/)).toBeInTheDocument();
  });
});
