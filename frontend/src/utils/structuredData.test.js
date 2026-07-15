import { describe, expect, it } from "vitest";
import {
  buildArticleSchema,
  buildBlogListSchema,
  buildBreadcrumbSchema,
  buildContactPageSchema,
  buildFaqPageSchema,
  buildJsonLdGraph,
  buildOrganizationSchema,
  buildRankingsListSchema,
  buildReviewSchemas,
  buildUniversitySchema,
  buildWebPageSchema,
  buildWebSiteSchema,
  serializeJsonLd,
} from "./structuredData.js";

describe("structuredData", () => {
  it("buildOrganizationSchema is Organization only (not EducationalOrganization)", () => {
    const schema = buildOrganizationSchema();
    expect(schema["@type"]).toBe("Organization");
    expect(JSON.stringify(schema)).not.toContain("EducationalOrganization");
  });

  it("buildUniversitySchema uses PostalAddress and omits geo for city-level seeds", () => {
    const schema = buildUniversitySchema({
      detail: {
        name: "Test UNI",
        short_name: "TU",
        city: "Toshkent",
        location: "Toshkent",
        address: "Toshkent, O'zbekiston",
        latitude: 41.2995,
        longitude: 69.2401,
        review_count: 2,
        average_rating: 4.5,
        phone: "+998711234567",
        website: "https://example.uz",
      },
      slug: "test-uni",
    });
    expect(schema.address["@type"]).toBe("PostalAddress");
    expect(schema.address.addressCountry).toBe("UZ");
    expect(schema.geo).toBeUndefined();
    expect(schema.telephone).toBe("+998711234567");
    expect(schema.sameAs).toContain("https://example.uz");
  });
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

  it("buildWebPageSchema supports AboutPage type", () => {
    const schema = buildWebPageSchema({
      title: "Biz haqimizda | MyUni.uz",
      description: "About",
      path: "/haqida",
      pageType: "AboutPage",
    });
    expect(schema["@type"]).toBe("AboutPage");
    expect(schema.url).toContain("/haqida");
  });

  it("buildContactPageSchema includes ContactPoint email", () => {
    const schema = buildContactPageSchema({
      title: "Aloqa | MyUni.uz",
      description: "Bog'lanish",
      path: "/aloqa",
      email: "hello@myuni.uz",
      address: "Samarqand",
    });
    expect(schema["@type"]).toBe("ContactPage");
    expect(schema.mainEntity.contactPoint.email).toBe("hello@myuni.uz");
    expect(schema.mainEntity.contactPoint.telephone).toBeUndefined();
  });

  it("buildRankingsListSchema emits ItemList without AggregateRating", () => {
    const schema = buildRankingsListSchema({
      year: 2026,
      universities: [{ slug: "tdiu", name: "TDIU" }],
      totalCount: 42,
    });
    expect(schema["@type"]).toBe("ItemList");
    expect(schema.numberOfItems).toBe(42);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(JSON.stringify(schema)).not.toContain("AggregateRating");
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
    expect(schemas[0].author.name).toBe("Talaba");
  });

  it("buildReviewSchemas uses neutral author fallback", () => {
    const schemas = buildReviewSchemas({
      reviews: [{ rating: 4, text: "Yaxshi", created_at: "2026-01-01T00:00:00Z" }],
      universityName: "Test UNI",
      slug: "test-uni",
    });
    expect(schemas[0].author.name).toBe("Foydalanuvchi");
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

  it("buildArticleSchema uses news path and NewsArticle type", () => {
    const schema = buildArticleSchema({
      article: {
        title: "Yangilik",
        excerpt: "Qisqa",
        body: "Matn",
        published_at: "2026-01-01T00:00:00Z",
      },
      slug: "test-yangilik",
      basePath: "/yangiliklar",
      schemaType: "NewsArticle",
    });
    expect(schema["@type"]).toBe("NewsArticle");
    expect(schema.url).toContain("/yangiliklar/test-yangilik");
    expect(schema.mainEntityOfPage).toContain("/yangiliklar/test-yangilik");
    expect(schema.url).not.toContain("/maqolalar/");
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
