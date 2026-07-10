import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { Navigate, Route, Routes } from "react-router-dom";
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
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const UniversitiesDirectoryPage = lazy(() => import("./pages/UniversitiesDirectoryPage.jsx"));
const UniversityPublicPage = lazy(() => import("./pages/UniversityPublicPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const SignupPage = lazy(() => import("./pages/SignupPage.jsx"));
const GoogleCallbackPage = lazy(() => import("./pages/GoogleCallbackPage.jsx"));
const GoogleCompleteProfilePage = lazy(() => import("./pages/GoogleCompleteProfilePage.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const ForgotPasswordSentPage = lazy(() => import("./pages/ForgotPasswordSentPage.jsx"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));
const LegalDocumentPage = lazy(() => import("./pages/LegalDocumentPage.jsx"));
const FAQPage = lazy(() => import("./pages/FAQPage.jsx"));
const FAQDetailPage = lazy(() => import("./pages/FAQDetailPage.jsx"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage.jsx"));
const VerifyEmailPendingPage = lazy(() => import("./pages/VerifyEmailPendingPage.jsx"));
const TrustSafetyPage = lazy(() => import("./pages/TrustSafetyPage.jsx"));
const MethodologyPage = lazy(() => import("./pages/MethodologyPage.jsx"));
const ArticlesPage = lazy(() => import("./pages/ArticlesPage.jsx"));
const ArticleDetailPage = lazy(() => import("./pages/ArticleDetailPage.jsx"));
const CompareSharePage = lazy(() => import("./pages/CompareSharePage.jsx"));
const ModeratorDashboardPage = lazy(() => import("./pages/ModeratorDashboardPage.jsx"));

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function DashboardRoute({ role }) {
  return (
    <Suspense fallback={<DashboardPageShellSkeleton />}>
      <DashboardPage role={role} />
    </Suspense>
  );
}

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
      <Suspense fallback={<PageFallback />}>
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
        <Route path="/metodologiya" element={<MethodologyPage />} />
        <Route path="/maqolalar" element={<ArticlesPage />} />
        <Route path="/maqolalar/:slug" element={<ArticleDetailPage />} />
        <Route path="/universitet/:slug" element={<UniversityPublicPage />} />
        <Route path="/universitetlar" element={<UniversitiesDirectoryPage />} />
        <Route path="/taqqoslash" element={<CompareSharePage />} />
        <Route path="/taqqoslash/:token" element={<CompareSharePage />} />
        <Route path="/savollar-javob" element={<FAQPage />} />
        <Route path="/savollar-javob/:slug" element={<FAQDetailPage />} />
        <Route path="/foydalanish-shartlari" element={<LegalDocumentPage />} />
        <Route path="/maxfiylik-siyosati" element={<LegalDocumentPage />} />
        <Route path="/sharh-qoidalari" element={<LegalDocumentPage />} />
        <Route path="/oauth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/oauth/google/complete" element={<GoogleCompleteProfilePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/moderator" element={<ModeratorDashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["applicant"]} />}>
          <Route path="/applicant/dashboard" element={<Navigate to="/applicant/dashboard/home" replace />} />
          <Route path="/applicant/dashboard/:section" element={<DashboardRoute role="applicant" />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/dashboard" element={<Navigate to="/student/dashboard/home" replace />} />
          <Route path="/student/dashboard/:section" element={<DashboardRoute role="student" />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      </AnalyticsProvider>
      </MotionConfig>
    </AuthProvider>
    </ToastProvider>
    </ErrorBoundary>
  );
}
