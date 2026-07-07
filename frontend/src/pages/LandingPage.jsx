import { useMemo } from "react";
import SocialProofSection from "@/components/SocialProofSection.jsx";
import ProductDemoSection from "@/components/ProductDemoSection.jsx";
import UniversityPartnersSection from "@/components/UniversityPartnersSection.jsx";
import FAQSection from "@/components/FAQSection.jsx";
import HowItWorksSection from "@/components/HowItWorksSection.jsx";
import LandingHashScroll from "@/components/LandingHashScroll.jsx";
import AboutSection from "@/components/AboutSection.jsx";
import CTASection from "@/components/CTASection.jsx";
import FeaturesSection from "@/components/FeaturesSection.jsx";
import HeroSection from "@/components/HeroSection.jsx";
import ReviewsSection from "@/components/ReviewsSection.jsx";
import TopUniversitiesSection from "@/components/TopUniversitiesSection.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import usePublicFaqItems from "@/hooks/usePublicFaqItems.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import MainLayout from "@/layouts/MainLayout.jsx";
import {
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/utils/structuredData.js";

export default function LandingPage() {
  usePageMeta(PAGE_META.landing);
  const { items: faqItems } = usePublicFaqItems();

  const organizationSchema = useMemo(
    () =>
      buildOrganizationSchema({
        description: PAGE_META.landing.description,
      }),
    []
  );

  const websiteSchema = useMemo(
    () =>
      buildWebSiteSchema({
        description: PAGE_META.landing.description,
      }),
    []
  );

  const faqSchema = useMemo(
    () =>
      buildFaqPageSchema(
        faqItems.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))
      ),
    [faqItems]
  );

  return (
    <MainLayout>
      <div data-seo-ready="true">
      <JsonLd
        id="landing-json-ld"
        schemas={[organizationSchema, websiteSchema, faqSchema].filter(Boolean)}
      />
      <LandingHashScroll />
      <HeroSection />
      <SocialProofSection />
      <HowItWorksSection />
      <ProductDemoSection />
      <FeaturesSection />
      <UniversityPartnersSection />
      <TopUniversitiesSection />
      <ReviewsSection />
      <AboutSection />
      <FAQSection />
      <CTASection />
      </div>
    </MainLayout>
  );
}
