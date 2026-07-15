import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UniversityPublicPage from "../UniversityPublicPage.jsx";
import UniversityOverviewPage from "./UniversityOverviewPage.jsx";
import UniversityReviewsPage from "./UniversityReviewsPage.jsx";

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

vi.mock("@/components/university/RelatedUniversities.jsx", () => ({
  default: () => <div data-testid="related" />,
}));

const getPublicUniversityBySlug = vi.fn();
const getPublicUniversityReviews = vi.fn();
vi.mock("@/services/publicService.js", () => ({
  getPublicUniversityBySlug: (...args) => getPublicUniversityBySlug(...args),
  getPublicUniversityReviews: (...args) => getPublicUniversityReviews(...args),
}));

const detail = {
  id: 1,
  name: "Test UNI",
  slug: "test-uni",
  location: "Toshkent",
  review_count: 5,
  average_rating: 4.2,
  display_rating: 4.0,
  faculties: [],
  admission_cycles: [],
  reviews: [],
  summary: "Qisqa tavsif.",
};

describe("University silos", () => {
  beforeEach(() => {
    getPublicUniversityBySlug.mockReset();
    getPublicUniversityBySlug.mockResolvedValue(detail);
    getPublicUniversityReviews.mockReset();
    getPublicUniversityReviews.mockResolvedValue({
      count: 1,
      page: 1,
      page_size: 20,
      results: [
        {
          id: 1,
          rating: 5,
          text: "Yaxshi universitet tajribasi.",
          author: "Talaba",
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
    });
  });

  it("renders thin hub with silo CTAs, not full reviews list heading only via nav", async () => {
    render(
      <MemoryRouter initialEntries={["/universitet/test-uni"]}>
        <Routes>
          <Route path="/universitet/:slug" element={<UniversityPublicPage />}>
            <Route index element={<UniversityOverviewPage />} />
            <Route path="sharhlari" element={<UniversityReviewsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 1, name: /test uni/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^sharhlar$/i })).toHaveAttribute(
      "href",
      "/universitet/test-uni/sharhlari"
    );
    expect(screen.getByText(/to'liq kontent alohida sahifalarda/i)).toBeInTheDocument();
  });

  it("redirects legacy #reviews hash to /sharhlari with single silo H1", async () => {
    render(
      <MemoryRouter initialEntries={["/universitet/test-uni#reviews"]}>
        <Routes>
          <Route path="/universitet/:slug" element={<UniversityPublicPage />}>
            <Route index element={<UniversityOverviewPage />} />
            <Route path="sharhlari" element={<UniversityReviewsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: /talabalar sharhlari/i })).toBeInTheDocument();
    });
    expect(screen.queryAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
