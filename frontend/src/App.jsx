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
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/themes.css";
// Wrapper for LandingPage (to use navigation)
function LandingPageWrapper() {
  const navigate = useNavigate();

  const goToLogin = () => navigate("/login");
  const goToRegister = () => navigate("/register");

  return (
    <LandingPage
      onLoginClick={goToLogin}
      onGetStartedClick={goToRegister}
    />
  );
}

function App() {
  return (
    <ThemeProvider>
      <main className="relative min-h-screen w-screen overflow-x-hidden theme-bg-primary">
        <Routes>
          <Route path="/" element={<LandingPageWrapper />} />

          {/* Auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />

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

          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/admin/delivery-requests" element={
            <ProtectedAdminRoute>
              <AdminDeliveryRequestsPage />
            </ProtectedAdminRoute>
          } />

        </Routes>
      </main>
    </ThemeProvider>
  );
}

export default App;
