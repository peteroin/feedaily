import { Routes, Route, useNavigate } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import UserProfilePage from "./pages/UserProfilePage";
import StatsPage from "./pages/StatsPage";
import SenderRankingPage from "./pages/SenderRankingPage";
import DeliveryPage from "./pages/DeliveryPage";
import DashboardLayout from "./components/DashboardLayout";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminDeliveryRequestsPage from "./pages/AdminDeliveryRequestsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { ImpactPage } from "./pages/ImpactPage";
import CollaborationFormPage from "./pages/CollaborationFormPage";
import MerchandisePage from "./pages/MerchandisePage";
import MerchandiseCheckoutPage from "./pages/MerchandiseCheckoutPage";
import MerchandiseSuccessPage from "./pages/MerchandiseSuccessPage";

// Wrapper for LandingPage (to use navigation)
function LandingPageWrapper() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("user");

  const goToLogin = () => navigate("/login");
  const goToGetStarted = () => {
    if (isLoggedIn) navigate("/dashboard");
    else navigate("/register");
  };
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <LandingPage
      isLoggedIn={isLoggedIn}
      onLoginClick={goToLogin}
      onLogoutClick={handleLogout}
      onGetStartedClick={goToGetStarted}
    />
  );
}

function App() {
  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden">
      <Routes>
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/collaboration" element={<CollaborationFormPage />} />

        {/* Auth pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Dashboard & sub-pages with layout */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/stats"
          element={
            <DashboardLayout>
              <StatsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <DashboardLayout>
              <UserProfilePage />
            </DashboardLayout>
          }
        />
        <Route
          path="/sender-rankings"
          element={
            <DashboardLayout>
              <SenderRankingPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/delivery"
          element={
            <DashboardLayout>
              <DeliveryPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/impact"
          element={
            <DashboardLayout>
              <ImpactPage />
            </DashboardLayout>
          }
        />

        <Route path="/success" element={<PaymentSuccess />} />
        <Route
          path="/admin/delivery-requests"
          element={
            <ProtectedAdminRoute>
              <AdminDeliveryRequestsPage />
            </ProtectedAdminRoute>
          }
        />

        {/* Merchandise routes */}
        <Route path="/merchandise" element={<MerchandisePage />} />
        <Route
          path="/merchandise/checkout"
          element={<MerchandiseCheckoutPage />}
        />
        <Route
          path="/merchandise/success"
          element={<MerchandiseSuccessPage />}
        />
      </Routes>
    </main>
  );
}

export default App;
