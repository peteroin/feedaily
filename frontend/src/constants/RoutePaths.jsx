import LandingPageWrapper from "../components/LandingPageWrapper";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import UserProfilePage from "../pages/UserProfilePage";
import StatsPage from "../pages/StatsPage";
import SenderRankingPage from "../pages/SenderRankingPage";
import DeliveryPage from "../pages/DeliveryPage";
import DashboardLayout from "../components/DashboardLayout";
import PaymentSuccess from "../pages/PaymentSuccess";
import AdminDeliveryRequestsPage from "../pages/AdminDeliveryRequestsPage";
import AdminLoginPage from "../pages/AdminLoginPage";
import ProtectedAdminRoute from "../components/ProtectedAdminRoute";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import { ImpactPage } from "../pages/ImpactPage";
import CollaborationFormPage from "../pages/CollaborationFormPage";
import MerchandisePage from "../pages/MerchandisePage";
import MerchandiseCheckoutPage from "../pages/MerchandiseCheckoutPage";
import MerchandiseSuccessPage from "../pages/MerchandiseSuccessPage";

const RoutePaths =[
  {
    path: "/",
    elements:<LandingPageWrapper />
  },
  {
    path: "/collaboration",
    elements:<CollaborationFormPage />
  },
  {
    path: "/login",
    elements:<LoginPage />
  },
  {
    path: "/register",
    elements:<RegisterPage />
  },
  {
    path: "/admin-login",
    elements:<AdminLoginPage />
  },
  {
    path: "/forgot-password",
    elements:<ForgotPasswordPage />
  },
  {
    path: "/dashboard",
    elements: <DashboardLayout>< DashboardPage /></DashboardLayout>
  },
  {
    path: "/stats",
    elements:<DashboardLayout>,<StatsPage />,</DashboardLayout>
  },
  {
    path: "/profile",
    elements:<DashboardLayout>,<UserProfilePage />, </DashboardLayout>
  },
  {
    path: "/sender-rankings",
    elements:<DashboardLayout><SenderRankingPage />,</DashboardLayout>
  },
  {
    path: "/delivery",
    elements:<DashboardLayout>,<DeliveryPage />,</DashboardLayout>
  },
  {
    path: "/impact",
    elements:<DashboardLayout>,<ImpactPage />,</DashboardLayout>
  },
  {
    path: "/success",
    elements:<PaymentSuccess />
  },
  {
    path: "/admin/delivery-requests",
    elements:<ProtectedAdminRoute>,<AdminDeliveryRequestsPage />,</ProtectedAdminRoute>
  },
  {
    path: "/merchandise",
    elements:<MerchandisePage />
  },
  {
    path: "/merchandise/checkout",
    elements:<MerchandiseCheckoutPage />
  },
  {
    path: "/merchandise/success",
    elements:<MerchandiseSuccessPage />
  }
];

export default RoutePaths;
