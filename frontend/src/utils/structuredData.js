import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  buildCanonicalUrl,
  resolveAbsoluteUrl,
  truncateMetaDescription,
} from "../config/siteMeta.js";

export function buildOrganizationSchema({
  description = DEFAULT_DESCRIPTION,
  logoPath = "/favicon.png",
} = {}) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    name: SITE_NAME,
    url: buildCanonicalUrl("/"),
    logo: resolveAbsoluteUrl(logoPath),
    description,
    inLanguage: "uz",
  };
}

export function buildWebSiteSchema({ description } = {}) {
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
    address: detail.location,
  };
  const image = imagePath || detail.image_url;
  if (image) {
    schema.image = resolveAbsoluteUrl(image);
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
      name: review.author || "Talaba",
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
  const image = article.cover_image || "/images/campuses/campus-01.jpg";
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
