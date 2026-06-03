import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import SkipToContent from "./components/a11y/SkipToContent.jsx";
import AnalyticsProvider from "./components/analytics/AnalyticsProvider.jsx";
import OfflineBanner from "./components/pwa/OfflineBanner.jsx";
import PwaInstallPrompt from "./components/pwa/PwaInstallPrompt.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { DashboardPageShellSkeleton } from "./components/skeletons/DashboardSkeletons.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import DashboardRedirect from "./pages/DashboardRedirect.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
import GoogleCallbackPage from "./pages/GoogleCallbackPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ForgotPasswordSentPage from "./pages/ForgotPasswordSentPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import LegalDocumentPage from "./pages/LegalDocumentPage.jsx";
import UniversityPublicPage from "./pages/UniversityPublicPage.jsx";
import UniversitiesDirectoryPage from "./pages/UniversitiesDirectoryPage.jsx";
import UniversitiesMapPage from "./pages/UniversitiesMapPage.jsx";
import FAQPage from "./pages/FAQPage.jsx";
import FAQDetailPage from "./pages/FAQDetailPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import VerifyEmailPendingPage from "./pages/VerifyEmailPendingPage.jsx";
import TrustSafetyPage from "./pages/TrustSafetyPage.jsx";
import CompareSharePage from "./pages/CompareSharePage.jsx";
import ModeratorDashboardPage from "./pages/ModeratorDashboardPage.jsx";

export default function App() {
  return (
    <ErrorBoundary>
    <ToastProvider>
    <AuthProvider>
      <MotionConfig reducedMotion="user">
      <SkipToContent />
      <ScrollToTop />
      <OfflineBanner />
      <PwaInstallPrompt />
      <AnalyticsProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password/sent" element={<ForgotPasswordSentPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email/pending" element={<VerifyEmailPendingPage />} />
        <Route path="/ishonch-xavfsizlik" element={<TrustSafetyPage />} />
        <Route path="/universitet/:slug" element={<UniversityPublicPage />} />
        <Route path="/universitetlar" element={<UniversitiesDirectoryPage />} />
        <Route path="/universitetlar/xarita" element={<UniversitiesMapPage />} />
        <Route path="/taqqoslash/:token" element={<CompareSharePage />} />
        <Route path="/savollar-javob" element={<FAQPage />} />
        <Route path="/savollar-javob/:slug" element={<FAQDetailPage />} />
        <Route path="/foydalanish-shartlari" element={<LegalDocumentPage />} />
        <Route path="/maxfiylik-siyosati" element={<LegalDocumentPage />} />
        <Route path="/sharh-qoidalari" element={<LegalDocumentPage />} />
        <Route path="/oauth/google/callback" element={<GoogleCallbackPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/moderator" element={<ModeratorDashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["applicant"]} />}>
          <Route
            path="/applicant/dashboard"
            element={
              <Suspense fallback={<DashboardPageShellSkeleton />}>
                <DashboardPage role="applicant" />
              </Suspense>
            }
          />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route
            path="/student/dashboard"
            element={
              <Suspense fallback={<DashboardPageShellSkeleton />}>
                <DashboardPage role="student" />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </AnalyticsProvider>
      </MotionConfig>
    </AuthProvider>
    </ToastProvider>
    </ErrorBoundary>
  );
}
