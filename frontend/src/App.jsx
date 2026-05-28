import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import DashboardRedirect from "./pages/DashboardRedirect.jsx";

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

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password/sent" element={<ForgotPasswordSentPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/universitet/:slug" element={<UniversityPublicPage />} />
        <Route path="/foydalanish-shartlari" element={<LegalDocumentPage />} />
        <Route path="/maxfiylik-siyosati" element={<LegalDocumentPage />} />
        <Route path="/sharh-qoidalari" element={<LegalDocumentPage />} />
        <Route path="/oauth/google/callback" element={<GoogleCallbackPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["applicant"]} />}>
          <Route
            path="/applicant/dashboard"
            element={
              <Suspense fallback={<div className="p-8 text-center font-bold">Yuklanmoqda...</div>}>
                <DashboardPage role="applicant" />
              </Suspense>
            }
          />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route
            path="/student/dashboard"
            element={
              <Suspense fallback={<div className="p-8 text-center font-bold">Yuklanmoqda...</div>}>
                <DashboardPage role="student" />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
    </ErrorBoundary>
  );
}
