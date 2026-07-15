import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import RankingsYearPage from "./RankingsYearPage.jsx";

vi.mock("@/hooks/useAuth.js", () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false, role: null }),
}));

vi.mock("@/hooks/useDarkMode.js", () => ({
  useDarkMode: () => ({ isDark: false, setIsDark: vi.fn() }),
}));

vi.mock("@/hooks/usePageMeta.js", () => ({ usePageMeta: vi.fn() }));
vi.mock("@/hooks/useFocusTrap.js", () => ({ default: () => {} }));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }) => children,
  motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> },
}));

vi.mock("@/components/OfficeMapEmbed.jsx", () => ({
  default: () => <div data-testid="map" />,
}));

const getAllPublicUniversities = vi.fn();
vi.mock("@/services/publicService.js", () => ({
  getAllPublicUniversities: (...args) => getAllPublicUniversities(...args),
  getPublicUniversities: (...args) => getAllPublicUniversities(...args),
}));

describe("RankingsYearPage", () => {
  beforeEach(() => {
    getAllPublicUniversities.mockReset();
    usePageMeta.mockClear();
    getAllPublicUniversities.mockResolvedValue({
      count: 1,
      results: [
        {
          id: 1,
          name: "Test UNI",
          slug: "test-uni",
          city: "Toshkent",
          display_rating: 4.2,
          bayesian_rating: 4.2,
          average_rating: 4.5,
          review_count: 12,
          rating_confidence: "high",
        },
      ],
    });
  });

  it("renders soft ranking table for supported year", async () => {
    render(
      <MemoryRouter initialEntries={["/reyting/2026"]}>
        <Routes>
          <Route path="/reyting/:year" element={<RankingsYearPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 1, name: /2026/i })).toBeInTheDocument();
    expect(screen.getByText(/rasmiy davlat yoki xalqaro/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /test uni/i })).toHaveAttribute(
        "href",
        "/universitet/test-uni"
      );
    });
    expect(getAllPublicUniversities).toHaveBeenCalledWith(
      expect.objectContaining({ sort: "rating", min_reviews: 3 })
    );
  });

  it("shows archive-missing state for unsupported year", async () => {
    render(
      <MemoryRouter initialEntries={["/reyting/2010"]}>
        <Routes>
          <Route path="/reyting/:year" element={<RankingsYearPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: /arxiv hali yo/i })).toBeInTheDocument();
    expect(getAllPublicUniversities).not.toHaveBeenCalled();
    expect(usePageMeta).toHaveBeenCalledWith(
      expect.objectContaining({
        robots: "noindex, follow",
        title: expect.stringMatching(/arxiv yo'q \(2010\)/i),
      })
    );
  });

  it("noindexes invalid year params without NaN title", async () => {
    render(
      <MemoryRouter initialEntries={["/reyting/abc"]}>
        <Routes>
          <Route path="/reyting/:year" element={<RankingsYearPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: /arxiv hali yo/i })).toBeInTheDocument();
    expect(usePageMeta).toHaveBeenCalledWith(
      expect.objectContaining({
        robots: "noindex, follow",
        title: expect.stringMatching(/arxiv yo'q \(abc\)/i),
      })
    );
    expect(usePageMeta).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringMatching(/NaN/i) })
    );
  });

  it("offers retry when ranking fetch fails", async () => {
    const user = userEvent.setup();
    getAllPublicUniversities
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        count: 1,
        results: [
          {
            id: 1,
            name: "Retry UNI",
            slug: "retry-uni",
            city: "Toshkent",
            display_rating: 4.1,
            review_count: 5,
            rating_confidence: "medium",
          },
        ],
      });

    render(
      <MemoryRouter initialEntries={["/reyting/2026"]}>
        <Routes>
          <Route path="/reyting/:year" element={<RankingsYearPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/yuklanmadi/i);
    await user.click(screen.getByRole("button", { name: /qayta urinish/i }));
    expect(await screen.findByRole("link", { name: /retry uni/i })).toBeInTheDocument();
  });
});
