import { Routes, Route, useNavigate } from "react-router-dom";

// Vite main sections
import About from "./components/About";
import Hero from "./components/Hero";
import NavBar from "./components/Navbar";
import Features from "./components/Features";
import Story from "./components/Story";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

// CRA pages/components
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
    <main className="relative min-h-screen w-screen overflow-x-hidden">
      <Routes>
        {/* Vite Home (your Hero + About + etc.) */}
        <Route
          path="/"
          element={
            <>
              <NavBar />
              <Hero />
              <About />
              <Features />
              <Story />
              <Contact />
              <Footer />
            </>
          }
        />

        {/* CRA Landing Page (optional, if you want to keep it) */}
        <Route path="/landing" element={<LandingPageWrapper />} />

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

        {/* Payment */}
        <Route path="/success" element={<PaymentSuccess />} />
        {/* <Route path="/cancel" element={<PaymentCancel />} /> */}

        <Route path="/admin/delivery-requests" element={
          <ProtectedAdminRoute>
            <AdminDeliveryRequestsPage />
          </ProtectedAdminRoute>
        } />

      </Routes>
    </main>
  );
}

export default App;
