import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  buildCanonicalUrl,
  resolveArticleCoverImage,
  resolveAbsoluteUrl,
  truncateMetaDescription,
} from "../config/siteMeta.js";

export function buildOrganizationSchema({
  description = DEFAULT_DESCRIPTION,
  logoPath = "/favicon.png",
} = {}) {
  // Platforma — universitet emas. EducationalOrganization ishlatilmaydi (SEO toksiklik).
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: buildCanonicalUrl("/"),
    logo: resolveAbsoluteUrl(logoPath),
    description,
    inLanguage: "uz",
  };
}

export function buildWebSiteSchema({ description, searchPath = "/universitetlar" } = {}) {
  const searchUrl = buildCanonicalUrl(searchPath);
  const searchTarget = searchUrl.includes("?")
    ? `${searchUrl}&q={search_term_string}`
    : `${searchUrl}?q={search_term_string}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: buildCanonicalUrl("/"),
    description: description || DEFAULT_DESCRIPTION,
    inLanguage: "uz",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: buildCanonicalUrl("/"),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchTarget,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildFaqPageSchema(faqItems = []) {
  if (!faqItems.length) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(items = []) {
  if (!items.length) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path),
    })),
  };
}

export function buildUniversitySchema({ detail, slug, imagePath }) {
  if (!detail || !slug) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: detail.name,
    url: buildCanonicalUrl(`/universitet/${slug}`),
  };

  if (detail.short_name && detail.short_name !== detail.name) {
    schema.alternateName = detail.short_name;
  }

  const image = imagePath || detail.image_url;
  if (image) {
    schema.image = resolveAbsoluteUrl(image);
  }

  const city = String(detail.city || "").trim() || String(detail.location || "").split(",")[0].trim();
  const street = String(detail.address || "").trim();
  if (street || city || detail.location) {
    schema.address = {
      "@type": "PostalAddress",
      addressCountry: "UZ",
    };
    if (street) {
      schema.address.streetAddress = street;
    }
    if (city) {
      schema.address.addressLocality = city;
    } else if (detail.location) {
      schema.address.addressLocality = String(detail.location).split(",")[0].trim();
    }
  }

  // Aniq kampus geo faqat street-signal bilan — seed city-jitter hech qachon schema.geo ga kirmaydi.
  const lat = Number(detail.latitude);
  const lng = Number(detail.longitude);
  const preciseAddress =
    street &&
    (/\d/.test(street) ||
      /(ko['ʻ’`]?cha|str\.|street|улица|проспект)/i.test(street));
  if (preciseAddress && Number.isFinite(lat) && Number.isFinite(lng)) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: lat,
      longitude: lng,
    };
  }

  if (detail.phone) {
    schema.telephone = detail.phone;
  }
  if (detail.email) {
    schema.email = detail.email;
  }

  const officialSite = String(detail.website || "").trim();
  if (officialSite) {
    const normalized = /^https?:\/\//i.test(officialSite)
      ? officialSite
      : `https://${officialSite.replace(/^\/+/, "")}`;
    schema.sameAs = [normalized];
    if (detail.telegram_url) {
      schema.sameAs.push(detail.telegram_url);
    }
    if (detail.instagram_url) {
      schema.sameAs.push(detail.instagram_url);
    }
  } else {
    const links = [detail.telegram_url, detail.instagram_url].filter(Boolean);
    if (links.length) {
      schema.sameAs = links;
    }
  }

  if (detail.review_count > 0 && detail.average_rating != null) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: detail.average_rating,
      reviewCount: detail.review_count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return schema;
}

export function buildReviewSchemas({ reviews = [], universityName, slug, limit = 10 }) {
  if (!reviews.length || !universityName || !slug) {
    return [];
  }
  const itemReviewed = {
    "@type": "CollegeOrUniversity",
    name: universityName,
    url: buildCanonicalUrl(`/universitet/${slug}`),
  };

  return reviews.slice(0, limit).map((review) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      "@type": "Person",
      name: review.author || "Foydalanuvchi",
    },
    reviewBody: truncateMetaDescription(review.text, 500),
    datePublished: review.created_at,
    itemReviewed,
  }));
}

export function buildArticleSchema({ article, slug }) {
  if (!article || !slug) {
    return null;
  }
  const image = resolveArticleCoverImage(article.cover_image);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt || truncateMetaDescription(article.body),
    url: buildCanonicalUrl(`/maqolalar/${slug}`),
    image: resolveAbsoluteUrl(image),
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: buildCanonicalUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: buildCanonicalUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: resolveAbsoluteUrl("/favicon.png"),
      },
    },
    inLanguage: "uz",
    mainEntityOfPage: buildCanonicalUrl(`/maqolalar/${slug}`),
  };
}

export function buildWebPageSchema({ title, description, path }) {
  if (!title || !path) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description || DEFAULT_DESCRIPTION,
    url: buildCanonicalUrl(path),
    inLanguage: "uz",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: buildCanonicalUrl("/"),
    },
  };
}

export function buildBlogListSchema(articles = []) {
  if (!articles.length) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "MyUni.uz maqolalari",
    url: buildCanonicalUrl("/maqolalar"),
    numberOfItems: articles.length,
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: buildCanonicalUrl(`/maqolalar/${article.slug}`),
      item: {
        "@type": "BlogPosting",
        headline: article.title,
        description: article.excerpt || truncateMetaDescription(article.body),
        url: buildCanonicalUrl(`/maqolalar/${article.slug}`),
        datePublished: article.published_at || article.created_at,
        image: resolveAbsoluteUrl(resolveArticleCoverImage(article.cover_image)),
      },
    })),
  };
}

/** XSS-safe JSON-LD serialization (Next.js / Google tavsiyasi). */
export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Bir nechta schema.org obyektini bitta @graph ga birlashtiradi. */
export function buildJsonLdGraph(schemas = []) {
  const nodes = schemas
    .filter(Boolean)
    .map((schema) => {
      const copy = { ...schema };
      delete copy["@context"];
      return copy;
    });

  if (!nodes.length) {
    return null;
  }
  if (nodes.length === 1) {
    return {
      "@context": "https://schema.org",
      ...nodes[0],
    };
  }
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
