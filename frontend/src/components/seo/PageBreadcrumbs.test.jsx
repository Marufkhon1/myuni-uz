import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PageBreadcrumbs from "./PageBreadcrumbs.jsx";

describe("PageBreadcrumbs", () => {
  it("renders links for ancestors and current page text", () => {
    render(
      <MemoryRouter>
        <PageBreadcrumbs
          items={[
            { name: "Bosh sahifa", path: "/" },
            { name: "Biz haqimizda", path: "/haqida" },
          ]}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /bosh sahifa/i })).toHaveAttribute("href", "/");
    expect(screen.getByText("Biz haqimizda")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /biz haqimizda/i })).not.toBeInTheDocument();
  });

  it("renders nothing with fewer than 2 items", () => {
    const { container } = render(
      <MemoryRouter>
        <PageBreadcrumbs items={[{ name: "Only" }]} />
      </MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
