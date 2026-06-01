import { describe, expect, it } from "vitest";
import {
  buildBlogListSchema,
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildJsonLdGraph,
  buildReviewSchemas,
  buildWebSiteSchema,
  serializeJsonLd,
} from "./structuredData.js";

describe("structuredData", () => {
  it("buildFaqPageSchema returns FAQPage with questions", () => {
    const schema = buildFaqPageSchema([
      { question: "Savol?", answer: "Javob." },
    ]);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(1);
    expect(schema.mainEntity[0].name).toBe("Savol?");
  });

  it("buildBreadcrumbSchema maps items to ListItem entries", () => {
    const schema = buildBreadcrumbSchema([
      { name: "Bosh sahifa", path: "/" },
      { name: "Maqolalar", path: "/maqolalar" },
    ]);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].name).toBe("Maqolalar");
  });

  it("buildReviewSchemas limits review count", () => {
    const reviews = Array.from({ length: 12 }, (_, index) => ({
      id: index,
      rating: 5,
      text: `Sharh ${index}`,
      author: "Talaba",
      created_at: "2026-01-01T00:00:00Z",
    }));
    const schemas = buildReviewSchemas({
      reviews,
      universityName: "Test UNI",
      slug: "test-uni",
      limit: 3,
    });
    expect(schemas).toHaveLength(3);
    expect(schemas[0]["@type"]).toBe("Review");
  });

  it("buildWebSiteSchema includes SearchAction", () => {
    const schema = buildWebSiteSchema();
    expect(schema.potentialAction["@type"]).toBe("SearchAction");
    expect(schema.potentialAction.target.urlTemplate).toContain("search_term_string");
  });

  it("buildBlogListSchema maps articles to ItemList", () => {
    const schema = buildBlogListSchema([
      {
        slug: "test-maqola",
        title: "Test maqola",
        excerpt: "Qisqa matn",
        published_at: "2026-01-01T00:00:00Z",
      },
    ]);
    expect(schema["@type"]).toBe("ItemList");
    expect(schema.itemListElement).toHaveLength(1);
    expect(schema.itemListElement[0].item.headline).toBe("Test maqola");
  });

  it("buildJsonLdGraph merges multiple schemas", () => {
    const graph = buildJsonLdGraph([
      buildFaqPageSchema([{ question: "Q?", answer: "A." }]),
      buildBreadcrumbSchema([{ name: "Home", path: "/" }]),
    ]);
    expect(graph["@graph"]).toHaveLength(2);
  });

  it("serializeJsonLd escapes less-than for XSS safety", () => {
    const serialized = serializeJsonLd({ text: "<script>alert(1)</script>" });
    expect(serialized).not.toContain("<script>");
    expect(serialized).toContain("\\u003c");
  });
});
