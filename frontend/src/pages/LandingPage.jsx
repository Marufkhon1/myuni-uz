import LandingHashScroll from "../components/LandingHashScroll.jsx";
import AboutSection from "../components/AboutSection.jsx";
import CTASection from "../components/CTASection.jsx";
import FeaturesSection from "../components/FeaturesSection.jsx";
import HeroSection from "../components/HeroSection.jsx";
import ReviewsSection from "../components/ReviewsSection.jsx";
import TopUniversitiesSection from "../components/TopUniversitiesSection.jsx";
import MainLayout from "../layouts/MainLayout.jsx";

export default function LandingPage() {
  return (
    <MainLayout>
      <LandingHashScroll />
      <HeroSection />
      <FeaturesSection />
      <TopUniversitiesSection />
      <ReviewsSection />
      <AboutSection />
      <CTASection />
    </MainLayout>
  );
}
